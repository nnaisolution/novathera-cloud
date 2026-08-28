"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      closeButton
      richColors={false}
      className="toaster group z-[100]"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#023a40]" />,
        info: <InfoIcon className="size-4 text-[#023a40]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#023a40]" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#023a40]" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "group toast !bg-[#fffaf0] !text-[#1a1c18] !border !border-[#e5e5e0] shadow-lg rounded-2xl",
          title: "!text-[#023a40] font-medium",
          description: "!text-[#222222]",
          actionButton: "bg-[#023a40] text-white",
          cancelButton: "bg-[#f2f2ef] text-[#222222]",
          closeButton:
            "!bg-[#f2f2ef] !border-[#e5e5e0] !text-[#222222] hover:!bg-[#e5e5e0]",
          success: "!border-[#023a40]/20",
          error: "!border-red-200 !bg-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
