export interface Watermark {
  id: string;
  src: string;
  name: string;
  isDefault?: boolean;
}

export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string; // URL for the original image
  processedUrl: string | null; // URL for the watermarked image
  status: ProcessingStatus;
  lastWatermarkId: string | null; // ID of the watermark applied
  error?: string;
  width: number;
  height: number;
}
