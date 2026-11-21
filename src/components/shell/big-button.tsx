import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
  secondary: "bg-background text-foreground hover:bg-muted border-border",
  danger: "bg-status-rdece text-white hover:bg-status-rdece/90 border-status-rdece",
  success: "bg-status-zeleno text-white hover:bg-status-zeleno/90 border-status-zeleno",
} as const;

export type BigButtonVariant = keyof typeof variants;

/** Classes for a big tap target (min 64 px high, full width, large text). */
export function bigButtonClass(variant: BigButtonVariant = "primary", className?: string) {
  return cn(
    "flex min-h-16 w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3 text-center text-xl font-semibold transition-colors select-none",
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-7 [&_svg]:shrink-0",
    variants[variant],
    className,
  );
}

type Common = { variant?: BigButtonVariant; icon?: ReactNode; className?: string; children: ReactNode };

type BigButtonProps =
  | (Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">)
  | (Common & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">);

/**
 * One big, obvious action. Renders a link with `href`, otherwise a button.
 * Icons are decorative: the text label is always shown (AGENTS.md §7).
 */
export function BigButton(props: BigButtonProps) {
  const { variant = "primary", icon, className, children } = props;
  const inner = (
    <>
      {icon && <span aria-hidden>{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, icon: _i, className: _c, children: _ch, ...linkProps } = props;
    return (
      <Link {...linkProps} className={bigButtonClass(variant, className)}>
        {inner}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, icon: _i, className: _c, children: _ch, href: _h, ...buttonProps } = props;
  return (
    <button type="button" {...buttonProps} className={bigButtonClass(variant, className)}>
      {inner}
    </button>
  );
}
