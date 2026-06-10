import { cn } from "@/lib/utils";

export function Sticker({
  children,
  className,
  rotate = -6,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      style={{ rotate: `${rotate}deg` }}
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border-2 border-dashed border-brand-mint bg-mint/10 bg-[#7BD389]/15 px-3 py-2 text-sm font-bold text-ink shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Tape({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-6 w-20 rounded-sm bg-brand-yellow/70 shadow-sm",
        className
      )}
    />
  );
}
