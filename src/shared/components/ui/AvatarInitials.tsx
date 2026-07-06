import { cn } from "@/shared/utils/cn";

function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Nurse|Pharm\.)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarInitialsProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles: Record<NonNullable<AvatarInitialsProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

export function AvatarInitials({
  name,
  imageUrl,
  size = "sm",
  className,
}: AvatarInitialsProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "flex-shrink-0 rounded-full object-cover",
          sizeStyles[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-secondary-100 font-semibold text-secondary-700",
        sizeStyles[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
