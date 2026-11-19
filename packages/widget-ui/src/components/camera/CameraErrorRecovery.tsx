'use client';

import type { CameraErrorEvent } from '../../types/widget';

interface CameraErrorRecoveryProps {
  error: CameraErrorEvent;
  onRetry: () => void;
  onUploadClick: () => void;
  onBack: () => void;
}

export function CameraErrorRecovery({
  error,
  onRetry,
  onUploadClick,
  onBack,
}: CameraErrorRecoveryProps) {
  const isPermissionDenied = error.code === 'PERMISSION_DENIED';
  const isCameraInUse = error.code === 'CAMERA_IN_USE';
  const isNoCamera = error.code === 'NO_CAMERA_FOUND';
  const isDisconnected = error.code === 'DISCONNECTED';

  return (
    <div className="flex flex-col items-center text-center p-6 sm:p-8">
      {/* Status Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[0.625rem] font-medium tracking-[0.08em] uppercase mb-4">
        <span aria-hidden="true">⚠️</span>
        <span>
          {isPermissionDenied
            ? 'Permission Denied'
            : isCameraInUse
              ? 'Camera Busy'
              : isNoCamera
                ? 'Camera Not Found'
                : isDisconnected
                  ? 'Stream Interrupted'
                  : 'Camera Error'}
        </span>
      </div>

      <h3 className="font-display text-2xl font-light text-luma-ink leading-tight mb-2">
        {isPermissionDenied
          ? 'Enable Camera Access'
          : isCameraInUse
            ? 'Camera Currently in Use'
            : isNoCamera
              ? 'No Camera Detected'
              : isDisconnected
                ? 'Camera Disconnected'
                : 'Unable to Connect'}
      </h3>

      <p className="text-xs text-luma-secondary leading-relaxed max-w-[320px] mb-6">
        {error.message}
      </p>

      {/* Structured Guidance Card */}
      <div className="w-full max-w-[340px] p-4 rounded-xl bg-luma-page border border-luma-border text-left mb-6">
        {isPermissionDenied && (
          <div className="space-y-2.5">
            <p className="text-[0.6875rem] font-semibold text-luma-ink uppercase tracking-wider">
              How to unblock in your browser:
            </p>
            <ol className="text-xs text-luma-secondary space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Click the <strong className="text-luma-ink font-semibold">lock or camera icon</strong> in your browser address bar.
              </li>
              <li>
                Switch camera permissions from <em>Block</em> to <strong className="text-luma-ink font-semibold">Allow</strong>.
              </li>
              <li>
                Click <strong className="text-luma-ink font-semibold">Retry Camera</strong> below to start your skin analysis.
              </li>
            </ol>
          </div>
        )}

        {isCameraInUse && (
          <div className="space-y-2">
            <p className="text-[0.6875rem] font-semibold text-luma-ink uppercase tracking-wider">
              Troubleshooting suggestion:
            </p>
            <p className="text-xs text-luma-secondary leading-relaxed">
              Please close any active video meetings (Zoom, Google Meet, Teams) or other browser tabs that may be holding a lock on your webcam, then retry.
            </p>
          </div>
        )}

        {isNoCamera && (
          <div className="space-y-2">
            <p className="text-[0.6875rem] font-semibold text-luma-ink uppercase tracking-wider">
              Alternative available:
            </p>
            <p className="text-xs text-luma-secondary leading-relaxed">
              If your device does not have an integrated webcam, you can upload any clear front-facing selfie from your photo library.
            </p>
          </div>
        )}

        {isDisconnected && (
          <div className="space-y-2">
            <p className="text-[0.6875rem] font-semibold text-luma-ink uppercase tracking-wider">
              Stream Recovery:
            </p>
            <p className="text-xs text-luma-secondary leading-relaxed">
              The camera feed was interrupted. Ensure your webcam is securely plugged in and click reconnect.
            </p>
          </div>
        )}

        {!isPermissionDenied && !isCameraInUse && !isNoCamera && !isDisconnected && (
          <p className="text-xs text-luma-secondary leading-relaxed">
            You can retry camera access or continue your skin discovery by selecting an image file directly.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-[340px] flex flex-col gap-3">
        <button
          type="button"
          onClick={onUploadClick}
          className="w-full h-11 px-6 rounded-[3px] bg-luma-accent hover:bg-luma-accent-dark text-luma-inverse text-xs font-medium tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2"
        >
          <span>📁</span> Upload a Photo Instead
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-4 rounded-[3px] border border-luma-border text-luma-secondary hover:text-luma-ink text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="flex-1 h-10 px-4 rounded-[3px] border border-luma-border-strong text-luma-ink hover:bg-luma-subtle text-[0.6875rem] font-medium tracking-[0.1em] uppercase transition-colors"
          >
            {isDisconnected ? 'Reconnect Camera' : 'Retry Camera'}
          </button>
        </div>
      </div>
    </div>
  );
}
