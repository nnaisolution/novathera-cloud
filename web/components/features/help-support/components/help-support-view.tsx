import { HelpSupportContactCards } from "./help-support-contact-cards";
import { HelpSupportForm } from "./help-support-form";

export function HelpSupportView() {
  return (
    <div className="flex w-full flex-col items-start gap-10">
      <div className="flex flex-col items-start gap-2.5">
        <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
          Help &amp; Support
        </h1>
        <p className="text-base text-[#546256]">We&apos;re one message away</p>
      </div>

      <HelpSupportContactCards />
      <HelpSupportForm />
    </div>
  );
}
