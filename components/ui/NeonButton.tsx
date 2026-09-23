import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

export type NeonAccent = "cyan" | "pink" | "yellow";
export type NeonVariant = "outline" | "solid" | "dashed" | "ghost";
export type NeonSize = "sm" | "md" | "lg";

interface NeonButtonOwnProps {
  variant?: NeonVariant;
  accent?: NeonAccent;
  size?: NeonSize;
  href?: string;
  className?: string;
}

type NeonButtonProps = NeonButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">;

// Clases completas y literales por variante/acento: Tailwind escanea el código en busca de
// nombres de clase textuales, así que no se pueden interpolar fragmentos como `hover:${accent}`.
const OUTLINE_CLASSES: Record<NeonAccent, string> = {
  cyan: "border-2 border-cyan bg-transparent text-cyan hover:bg-cyan hover:text-background hover:shadow-[0_0_18px_#00f5ff]",
  pink: "border-2 border-pink bg-transparent text-pink hover:bg-pink hover:text-background hover:shadow-[0_0_18px_#ff006e]",
  yellow:
    "border-2 border-yellow bg-transparent text-yellow hover:bg-yellow hover:text-background hover:shadow-[0_0_18px_#f5ff00]",
};

const SOLID_CLASSES: Record<NeonAccent, string> = {
  cyan: "border-0 bg-cyan text-background hover:shadow-[0_0_28px_#00f5ff]",
  pink: "border-0 bg-pink text-background hover:shadow-[0_0_28px_#ff006e]",
  yellow: "border-0 bg-yellow text-background hover:shadow-[0_0_28px_#f5ff00]",
};

const DASHED_CLASSES: Record<NeonAccent, string> = {
  cyan: "border-2 border-dashed border-cyan bg-transparent text-cyan hover:shadow-[0_0_14px_rgba(0,245,255,.6)]",
  pink: "border-2 border-dashed border-pink bg-transparent text-pink hover:shadow-[0_0_14px_rgba(255,0,110,.6)]",
  yellow:
    "border-2 border-dashed border-yellow bg-transparent text-yellow hover:shadow-[0_0_14px_rgba(245,255,0,.6)]",
};

const GHOST_CLASS =
  "border border-border-strong bg-transparent text-foreground hover:border-foreground";

const SIZE_CLASS: Record<NeonSize, string> = {
  sm: "px-3.5 py-2.5 text-[10px]",
  md: "px-5 py-3.5 text-xs",
  lg: "px-8 py-5 text-base",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center font-pixel transition-all duration-150 active:scale-95 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";

function variantClass(variant: NeonVariant, accent: NeonAccent) {
  switch (variant) {
    case "solid":
      return SOLID_CLASSES[accent];
    case "dashed":
      return DASHED_CLASSES[accent];
    case "ghost":
      return GHOST_CLASS;
    case "outline":
    default:
      return OUTLINE_CLASSES[accent];
  }
}

export function NeonButton({
  variant = "outline",
  accent = "cyan",
  size = "md",
  href,
  className = "",
  children,
  ...rest
}: NeonButtonProps) {
  const classes = `${BASE} ${variantClass(variant, accent)} ${SIZE_CLASS[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
