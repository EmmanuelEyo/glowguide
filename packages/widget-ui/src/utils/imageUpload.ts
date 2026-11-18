const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface ProcessImageFileResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export function processImageFile(file: File): ProcessImageFileResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: 'Please select a valid JPG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: 'Image file size must be less than 10MB.',
    };
  }

  try {
    const objectUrl = URL.createObjectURL(file);
    return {
      success: true,
      imageUrl: objectUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process file.';
    return {
      success: false,
      error: message,
    };
  }
}
