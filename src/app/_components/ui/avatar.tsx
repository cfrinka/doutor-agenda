"use client";

import {
  Avatar as AvatarPrimitive,
  AvatarImage,
  AvatarFallback,
} from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <AvatarPrimitive
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      <AvatarImage
        src={src || undefined}
        alt={alt}
        className="aspect-square h-full w-full"
      />
      <AvatarFallback className="bg-muted flex h-full w-full items-center justify-center rounded-full">
        {fallback}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}
