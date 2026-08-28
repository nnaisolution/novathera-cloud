import { cn } from "@/lib/utils";

/**
 * Nova Thera lockup: brand mark plus wordmark.
 *
 * The mark is the square glyph cropped out of the full logo; the name stays as
 * live text rather than part of the artwork so it inherits `currentColor` and
 * remains legible in both light and dark themes. The full-lockup SVG is a fixed
 * dark teal and would wash out on a dark background.
 */
const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Plain img, not next/image: an SVG from public/ would otherwise need
          dangerouslyAllowSVG, and there is nothing here to optimise. */}
      <img
        src="/branding/logo-mark.svg"
        alt=""
        aria-hidden
        className="size-8.5 shrink-0"
      />
      <span className="text-xl font-bold">Nova Thera</span>
    </div>
  );
};

export default Logo;
