import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, PointerEvent } from "react";
import { onPressDrop } from "@/lib/motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "pressable inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium disabled:pointer-events-none disabled:opacity-50 min-h-11 px-4",
  {
    variants: {
      variant: {
        primary: "bg-pine text-pine-fg hover:opacity-90",
        outline: "border border-rule bg-paper text-ink hover:bg-inset",
        ghost: "text-ink hover:bg-inset",
        danger: "bg-danger text-paper hover:opacity-90",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  onPointerDown,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        onPressDrop(event);
        onPointerDown?.(event);
      }}
      {...props}
    />
  );
}
