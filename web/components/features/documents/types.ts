export type DocumentCategory =
  | "ASSESSMENT"
  | "LAB"
  | "PROTOCOL"
  | "CONSENT"
  | "GUIDE"
  | "OTHER";

export type CustomerDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSizeBytes: number | null;
  createdAt: Date;
};
