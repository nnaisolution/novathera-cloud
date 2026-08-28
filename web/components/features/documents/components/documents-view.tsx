"use client";

import { useDocuments } from "../hooks/use-documents";
import { DocumentItem } from "./document-item";

export function DocumentsView() {
  const { data, isLoading } = useDocuments();

  return (
    <div className="flex w-full flex-col items-start gap-10">
      <div className="flex flex-col items-start gap-2.5">
        <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
          Documents
        </h1>
        <p className="text-base text-[#546256]">
          Records, protocols and consent forms
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[89px] w-full min-w-[280px] flex-1 animate-pulse rounded-[20px] bg-white"
            />
          ))
        ) : data?.length ? (
          data.map((document) => (
            <DocumentItem key={document.id} document={document} />
          ))
        ) : (
          <div className="col-span-full flex w-full flex-col items-center gap-2 rounded-[20px] border border-[#ccc] bg-white py-16 text-center">
            <p className="text-base text-[#546256]">No documents yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
