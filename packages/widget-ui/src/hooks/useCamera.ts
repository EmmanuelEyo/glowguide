'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraState } from '../types/widget';

export interface UseCameraOptions {
  autoStart?: boolean;
  onCameraStateChange?: (state: CameraState) => void;
}

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  error: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  captureFrame: () => Promise<string | null>;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
  const { autoStart = true, onCameraStateChange } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateState = useCallback(
    (newState: CameraState) => {
      setCameraState(newState);
      onCameraStateChange?.(newState);
    },
    [onCameraStateChange],
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
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
      setError('Camera API is not supported in this browser environment.');
      updateState('error');
      return false;
    }

    try {
      updateState('idle');
      setError(null);

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

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // play video once metadata is ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {
            // auto-play restrictions handled gracefully
          });
        };
      }

      updateState('active');
      return true;
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj.name === 'NotAllowedError' ||
        errorObj.name === 'PermissionDeniedError'
      ) {
        setError('Camera permission was denied.');
        updateState('denied');
      } else {
        setError(errorObj.message || 'Unable to access camera device.');
        updateState('error');
      }
      return false;
    }
  }, [stopCamera, updateState]);

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
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
