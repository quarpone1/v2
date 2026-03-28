import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white/60 border border-white/70 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.05)] backdrop-blur-2xl rounded-[32px] overflow-hidden transition-all duration-300",
        !noPadding && "p-6 sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
