import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-6px_var(--primary)]",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline:
                    "border border-[var(--border-light)] bg-transparent text-foreground hover:bg-[rgba(255,255,255,0.04)] hover:border-[var(--border-glow)]",
                secondary:
                    "bg-[rgba(255,255,255,0.06)] text-foreground hover:bg-[rgba(255,255,255,0.1)]",
                ghost: "text-foreground hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground",
                link: "text-foreground underline-offset-4 hover:underline",
                accent:
                    "bg-[rgba(255,255,255,0.06)] border border-[var(--border)] text-foreground hover:bg-[rgba(255,255,255,0.1)] hover:border-[var(--border-glow)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-12 rounded-md px-8 text-base",
                icon: "h-10 w-10",
                "icon-sm": "h-8 w-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
