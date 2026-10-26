import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-tight transition-none focus:outline-none focus:ring-1 focus:ring-neutral-900",
    {
        variants: {
            variant: {
                default: "border-emerald-700 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
                secondary: "border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
                destructive: "border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
                outline: "text-neutral-950 dark:text-neutral-50 border-neutral-300 dark:border-neutral-700",
                warning: "border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
                success: "border-green-600 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
                info: "border-sky-600 bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
