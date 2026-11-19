'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraErrorCode, CameraErrorEvent, CameraState } from '../types/widget';

export interface UseCameraOptions {
  autoStart?: boolean;
  onCameraStateChange?: (state: CameraState) => void;
  onCameraError?: (error: CameraErrorEvent) => void;
}

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  cameraError: CameraErrorEvent | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  captureFrame: () => Promise<string | null>;
  simulateCameraError: (code: CameraErrorCode) => void;
  clearError: () => void;
}

export function classifyCameraError(err: unknown): CameraErrorEvent {
  const errorObj = err as { name?: string; message?: string };
  const name = errorObj.name || '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      code: 'PERMISSION_DENIED',
      message: 'Camera permission was denied in your browser settings.',
    };
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      code: 'NO_CAMERA_FOUND',
      message: 'No camera device was detected on your system.',
    };
  }

  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      code: 'CAMERA_IN_USE',
      message: 'Camera is currently in use by another application or browser tab.',
    };
  }

  if (name === 'NotSupportedError') {
    return {
      code: 'UNSUPPORTED',
      message: 'Camera streaming requires a secure HTTPS connection or supported browser.',
    };
  }

  return {
    code: 'UNKNOWN',
    message: errorObj.message || 'Unable to access camera device.',
  };
}

export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
  const { autoStart = true, onCameraStateChange, onCameraError } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraError, setCameraError] = useState<CameraErrorEvent | null>(null);

  const updateState = useCallback(
    (newState: CameraState) => {
      setCameraState(newState);
      onCameraStateChange?.(newState);
    },
    [onCameraStateChange],
  );

  const reportError = useCallback(
    (errEvent: CameraErrorEvent) => {
      setCameraError(errEvent);
      onCameraError?.(errEvent);
      const nextState: CameraState =
        errEvent.code === 'PERMISSION_DENIED' ? 'denied' : 'error';
      updateState(nextState);
    },
    [onCameraError, updateState],
  );

  const clearError = useCallback(() => {
    setCameraError(null);
    updateState('idle');
  }, [updateState]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.onended = null;
          track.stop();
        } catch {
          // ignore track stop failures
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    updateState('idle');
  }, [updateState]);

  const startCamera = useCallback(async (): Promise<boolean> => {
    // If stream already active and tracks are running
    if (streamRef.current && streamRef.current.active) {
      updateState('active');
      return true;
    }

    // Stop existing before starting fresh
    stopCamera();

    // Browser environment check
    if (
      typeof window === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      const unsupportedErr: CameraErrorEvent = {
        code: 'UNSUPPORTED',
        message: 'Camera API is not supported in this browser or insecure connection.',
      };
      reportError(unsupportedErr);
      return false;
    }

    try {
      updateState('idle');
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Listen for unexpected track disconnection / hardware unplugging
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          const disconnectErr: CameraErrorEvent = {
            code: 'DISCONNECTED',
            message: 'Camera device was disconnected.',
          };
          reportError(disconnectErr);
        };
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {
            // auto-play restrictions handled gracefully
          });
        };
      }

      updateState('active');
      return true;
    } catch (err: unknown) {
      const parsedError = classifyCameraError(err);
      reportError(parsedError);
      return false;
    }
  }, [stopCamera, updateState, reportError]);

  const simulateCameraError = useCallback(
    (code: CameraErrorCode) => {
      stopCamera();
      const messages: Record<CameraErrorCode, string> = {
        PERMISSION_DENIED: 'Camera permission was denied in your browser settings.',
        NO_CAMERA_FOUND: 'No camera device was detected on your system.',
        CAMERA_IN_USE: 'Camera is currently in use by another application or browser tab.',
        UNSUPPORTED: 'Camera streaming requires a secure HTTPS connection or supported browser.',
        DISCONNECTED: 'Camera device was disconnected.',
        UNKNOWN: 'An unexpected camera error occurred.',
      };
      reportError({ code, message: messages[code] });
    },
    [stopCamera, reportError],
  );

  const captureFrame = useCallback(async (): Promise<string | null> => {
    const video = videoRef.current;
    if (!video || !streamRef.current || !streamRef.current.active) {
      return null;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Mirror image horizontally to match user-facing preview
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    return new Promise<string | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const objectUrl = URL.createObjectURL(blob);
          resolve(objectUrl);
        },
        'image/jpeg',
        0.92,
      );
    });
  }, []);

  // Monitor permission queries for auto-recovery when user re-enables camera in browser settings
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'permissions' in navigator &&
      navigator.permissions?.query
    ) {
      try {
        navigator.permissions
          .query({ name: 'camera' as PermissionName })
          .then((status) => {
            permissionStatusRef.current = status;
            status.onchange = () => {
              if (status.state === 'granted') {
                // If permission was granted out-of-band, auto-recover!
                clearError();
                startCamera();
              }
            };
          })
          .catch(() => {
            // Permissions query for camera is not supported in all browsers
          });
      } catch {
        // Ignore permission query errors
      }
    }

    return () => {
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
    };
  }, [clearError, startCamera]);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera]);

  return {
    videoRef,
    cameraState,
    cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    simulateCameraError,
    clearError,
  };
}
