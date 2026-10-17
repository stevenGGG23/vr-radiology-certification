import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "caliper" | "danger" | "dark" | "light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-[#1a5bd0] text-white shadow-sm hover:bg-[#1447a8]",
  secondary: "border border-line-strong bg-transparent text-bone hover:border-bone/40 hover:bg-bone/[0.04]",
  ghost: "text-bone-dim hover:text-bone hover:bg-bone/[0.05]",
  caliper: "bg-[#b58b33] text-white shadow-sm hover:bg-[#9c7628]",
  danger: "border border-doppler-red/40 text-doppler-red hover:bg-doppler-red/10",
  dark: "bg-[#0b1f3a] text-white hover:bg-[#071528]",
  light: "bg-white text-[#0b1f3a] shadow-sm hover:bg-[#eef3fa]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-lg",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
}

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "group/btn relative inline-flex select-none items-center justify-center whitespace-nowrap font-semibold",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
    variants[variant],
    sizes[size],
    className,
  );
}

function Inner({ iconLeft, iconRight, children }: Pick<BaseProps, "iconLeft" | "iconRight" | "children">) {
  return (
    <>
      {iconLeft}
      <span>{children}</span>
      {iconRight && (
        <span className="transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5">{iconRight}</span>
      )}
    </>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
  ...props
}: BaseProps & Omit<ComponentProps<"button">, "children">) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
  href,
  ...props
}: BaseProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...props}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>
        {children}
      </Inner>
    </Link>
  );
}
