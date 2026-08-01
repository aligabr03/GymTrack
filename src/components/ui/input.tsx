import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-base md:text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-[var(--border-glow)] focus-visible:ring-0 focus-visible:shadow-[0_0_20px_-6px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
