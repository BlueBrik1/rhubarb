import type { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "primary";
}

const variantClasses: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ghost: "bg-rhubarb-900 text-custard-100/90 hover:bg-rhubarb-800 active:bg-rhubarb-900",
  primary: "bg-rhubarb-600 text-custard-50 hover:bg-rhubarb-500 active:bg-rhubarb-700",
};

export default function IconButton({ variant = "ghost", className = "", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={`flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
    />
  );
}
