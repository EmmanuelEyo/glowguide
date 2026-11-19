'use client';

import { useState, useRef, useEffect } from 'react';
import { useWidget } from '../../context/WidgetContext';
import { useCamera } from '../../hooks/useCamera';
import { processImageFile } from '../../utils/imageUpload';
import { CameraErrorRecovery } from '../camera/CameraErrorRecovery';

export function CameraCaptureStep() {
  const {
    isOpen,
    session,
    prevStep,
    setCameraState,
    setCameraError,
    clearCameraError,
    setCapturedImage,
    clearCapturedImage,
    startAnalysis,
  } = useWidget();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    videoRef,
    cameraState,
    cameraError,
    startCamera,
    stopCamera,
    captureFrame,
    clearError,
  } = useCamera({
    autoStart: !session.capturedImageUrl,
    onCameraStateChange: setCameraState,
    onCameraError: setCameraError,
  });

  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const objectUrl = await captureFrame();
      if (objectUrl) {
        setCapturedImage(objectUrl);
        stopCamera();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    clearCapturedImage();
    clearCameraError();
    clearError();
    setUploadError(null);
    startCamera();
  };

  const handleRetryCamera = () => {
    clearCameraError();
    clearError();
    setUploadError(null);
    startCamera();
  };

  // Stop the camera stream when the floating widget is closed so the
  // browser camera indicator light turns off while the widget is hidden.
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = processImageFile(file);
    if (result.success && result.imageUrl) {
      setUploadError(null);
      clearCameraError();
      clearError();
      setCapturedImage(result.imageUrl);
      stopCamera();
    } else if (result.error) {
      setUploadError(result.error);
    }

    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const result = processImageFile(file);
    if (result.success && result.imageUrl) {
      setUploadError(null);
      clearCameraError();
      clearError();
      setCapturedImage(result.imageUrl);
      stopCamera();
    } else if (result.error) {
      setUploadError(result.error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // 1. Captured Photo Preview Mode
  if (session.capturedImageUrl) {
    return (
      <div className="flex flex-col items-center text-center p-6 sm:p-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[0.625rem] font-medium tracking-[0.08em] uppercase mb-4">
          <span aria-hidden="true">✓</span>
          <span>Snapshot Ready</span>
        </div>

        <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
          Review Your Photo
        </h3>

        <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6">
          Your image is processed exclusively in browser memory. Verify your face is clear before continuing.
        </p>

        {/* Captured image display */}
        <div className="w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-luma-canvas border border-luma-border overflow-hidden shadow-inner mb-6 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={session.capturedImageUrl}
            alt="Captured skin snapshot"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-[340px] flex flex-col gap-3">
          <button
            type="button"
            onClick={() => startAnalysis()}
            className="w-full h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2"
          >
            <span>✦</span> Use This Photo
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevStep}
              className="h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 h-10 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink hover:bg-luma-subtle text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
            >
              Retake Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Camera Error or Denied Mode
  const activeError = session.cameraError || cameraError;
  if (cameraState === 'error' || cameraState === 'denied' || activeError) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="camera-error-upload-input"
        />

        <CameraErrorRecovery
          error={
            activeError || {
              code: cameraState === 'denied' ? 'PERMISSION_DENIED' : 'UNKNOWN',
              message:
                cameraState === 'denied'
                  ? 'Camera permission was denied in your browser settings.'
                  : 'Unable to access camera device.',
            }
          }
          onRetry={handleRetryCamera}
          onUploadClick={() => fileInputRef.current?.click()}
          onBack={prevStep}
        />

        {uploadError && (
          <div className="w-full max-w-[340px] mx-auto px-6 pb-6">
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs text-center">
              {uploadError}
            </div>
          </div>
        )}
      </>
    );
  }

  // 3. Live Viewfinder Mode
  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Live badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luma-subtle border border-luma-border text-[0.625rem] font-medium tracking-[0.08em] uppercase text-luma-secondary mb-4">
        <span
          className={`w-2 h-2 rounded-full ${cameraState === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          aria-hidden="true"
        />
        <span>{cameraState === 'active' ? 'Live Camera' : 'Initializing Camera...'}</span>
      </div>

      <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
        Position Your Face
      </h3>

      <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-4">
        Center your face within the framing guide in even light, then capture a snapshot.
      </p>

      {/* Video Viewfinder Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full max-w-[340px] aspect-[4/3] rounded-2xl bg-luma-canvas border border-luma-border relative overflow-hidden mb-4 shadow-inner ${isDragOver ? 'ring-2 ring-luma-accent' : ''
          }`}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />

        {/* Subtle Face Alignment Oval */}
        <div
          className="absolute inset-0 m-auto w-40 h-52 rounded-[50%] border-2 border-dashed border-luma-accent/60 pointer-events-none flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-[0.625rem] text-luma-inverse/80 font-medium tracking-wider uppercase bg-luma-canvas/60 px-2 py-0.5 rounded backdrop-blur-sm">
            Align Face
          </span>
        </div>

        {/* Drop zone indicator when dragging */}
        {isDragOver && (
          <div className="absolute inset-0 bg-luma-canvas/80 backdrop-blur-sm flex flex-col items-center justify-center text-luma-inverse p-4">
            <span className="text-3xl mb-2">📥</span>
            <span className="text-xs font-semibold">Drop photo to upload</span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="w-full max-w-[340px] p-2.5 rounded-lg bg-red-50 text-red-700 text-xs mb-3">
          {uploadError}
        </div>
      )}

      {/* Primary Capture Action */}
      <div className="w-full max-w-[340px] flex flex-col gap-3">
        <button
          type="button"
          onClick={handleCapture}
          disabled={cameraState !== 'active' || isCapturing}
          className="w-full h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark disabled:opacity-50 text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-sm">📷</span>
          <span>{isCapturing ? 'Capturing...' : 'Capture Photo'}</span>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          id="camera-viewfinder-upload"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevStep}
            className="h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink hover:bg-luma-subtle text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            Upload Instead
          </button>
        </div>
      </div>
    </div>
  );
}
