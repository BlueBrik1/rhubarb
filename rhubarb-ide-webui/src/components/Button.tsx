import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "sidebar";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-rhubarb-600 text-custard-50 hover:bg-rhubarb-500 active:bg-rhubarb-700",
  ghost:
    "bg-rhubarb-800/70 text-custard-100 hover:bg-rhubarb-700 active:bg-rhubarb-800",
  sidebar:
    "bg-rhubarb-900 text-custard-100/90 hover:bg-rhubarb-800 active:bg-rhubarb-900 text-xs",
};

export default function Button({ variant = "ghost", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`font-display cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
    />
  );
}
