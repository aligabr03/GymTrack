import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-[var(--border-glow)] focus-visible:shadow-[0_0_20px_-6px_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
