import { cn } from "@/lib/utils";

const colors = ["#D7B35B", "#DFA4AF", "#7CB7E8", "#93B29B", "#DCEBF5"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function InitialAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      style={{ background: colorFor(name) }}
      className={cn(
        "grid place-items-center rounded-full font-heading font-bold text-ink",
        className
      )}
    >
      {letter}
    </span>
  );
}
