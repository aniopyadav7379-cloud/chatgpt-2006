"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface XPButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
}

export default function XPButton({
  children,
  variant = "primary",
  icon,
  className,
  ...props
}: XPButtonProps) {
  return (
    <button
      className={cn(
        variant === "primary" ? "xp-button" : "xp-button-ghost",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
