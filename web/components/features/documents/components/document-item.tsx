import { Download, FileText } from "lucide-react";

import type { CustomerDocument } from "../types";
import {
  formatCategory,
  formatDocumentDate,
  formatFileSize,
} from "../utils/format-document";

export function DocumentItem({ document }: { document: CustomerDocument }) {
  const meta = [
    formatCategory(document.category),
    "PDF",
    formatFileSize(document.fileSizeBytes),
    formatDocumentDate(document.createdAt),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex w-full min-w-[280px] flex-1 items-center justify-between gap-6 rounded-[20px] border border-[#ccc] bg-white px-[30px] py-5">
      <div className="flex items-center gap-[30px]">
        <FileText className="size-6 shrink-0 text-[#185b50]" aria-hidden />
        <div className="flex flex-col items-start gap-1.5">
          <p className="text-lg font-semibold text-[#0c1f13]">
            {document.title}
          </p>
          <p className="text-base text-[#546256]">{meta}</p>
        </div>
      </div>

      <a
        href={document.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Download ${document.title}`}
        className="shrink-0 text-[#185b50] transition-opacity hover:opacity-70"
      >
        <Download className="size-6" aria-hidden />
      </a>
    </div>
  );
}
