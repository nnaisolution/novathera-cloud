type BookingStepHeaderProps = {
  title: string;
  description: string;
};

export function BookingStepHeader({
  title,
  description,
}: BookingStepHeaderProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <h2 className="font-display text-[26px] leading-tight font-normal text-[#185b50] lg:text-[32px]">
        {title}
      </h2>
      <p className="text-sm leading-[1.5] text-[#222] lg:text-base">
        {description}
      </p>
    </div>
  );
}
