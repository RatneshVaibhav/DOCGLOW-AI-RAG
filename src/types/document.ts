export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    fileName: string;
    chunkIndex: number;
    pageNumber: number;
    uploadTimestamp: string;
    documentId: string;
  };
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  uploadedAt: string;
  status: "uploading" | "processing" | "ready" | "error";
  extractedTextPreview?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  detail?: string;
}

export type UploadStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "chunking"
  | "embedding"
  | "storing"
  | "ready"
  | "error";
