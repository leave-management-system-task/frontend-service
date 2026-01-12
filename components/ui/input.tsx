import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
          "border-slate-300 bg-white text-slate-900",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-slate-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          "hover:border-slate-400 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
