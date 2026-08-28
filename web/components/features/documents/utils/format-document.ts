import type { DocumentCategory } from "../types";

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ASSESSMENT: "Assessment",
  LAB: "Lab",
  PROTOCOL: "Protocol",
  CONSENT: "Consent",
  GUIDE: "Guide",
  OTHER: "Document",
};

export function formatCategory(category: DocumentCategory) {
  return CATEGORY_LABELS[category];
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
