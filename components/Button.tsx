import React from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      href,
      icon,
      iconPosition = "right",
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:pointer-events-none select-none tracking-tight rounded-md";

    const variants = {
      primary:
        "bg-accent text-[#FFF9F3] hover:bg-[#3E1012] active:bg-[#2C0B0C] border border-transparent font-semibold shadow-xs transition-all",
      accent:
        "bg-accent text-[#FFF9F3] hover:bg-[#3E1012] active:bg-[#2C0B0C] border border-transparent font-bold shadow-xs transition-all",
      secondary:
        "bg-[#FFF9F3] text-foreground hover:bg-[#E0CEC3]/40 active:bg-[#E0CEC3]/60 border border-[#E6D8CF] shadow-2xs",
      outline:
        "bg-transparent text-foreground border border-[#E6D8CF] hover:border-accent/40 hover:bg-[#FFF9F3] active:bg-[#E0CEC3]/30",
      ghost:
        "bg-transparent text-muted hover:text-foreground hover:bg-[#FFF9F3] border border-transparent",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded gap-1.5 h-8",
      md: "text-xs sm:text-sm px-4 py-2.5 rounded-md gap-2 h-10",
      lg: "text-sm sm:text-base px-6 py-3 rounded-md gap-2.5 h-12 font-semibold",
    };

    const combined = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={combined}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combined} disabled={disabled} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
