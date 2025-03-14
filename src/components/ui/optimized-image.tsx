"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackSrc?: string;
  fallbackClassName?: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.jpg",
  className,
  fallbackClassName,
  containerClassName,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-muted animate-pulse rounded-md",
            fallbackClassName
          )}
        />
      )}
      
      {hasError ? (
        <Image
          src={fallbackSrc}
          alt={alt}
          width={width || 100}
          height={height || 100}
          className={cn("object-cover", className, fallbackClassName)}
          {...props}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 100}
          height={height || 100}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </div>
  );
}

export function ProfileImage({
  src,
  alt,
  className,
  size = 40,
  ...props
}: Omit<OptimizedImageProps, "width" | "height"> & { size?: number }) {
  return (
    <OptimizedImage
      src={src || "/images/placeholder-avatar.jpg"}
      alt={alt || "Profile picture"}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      fallbackSrc="/images/placeholder-avatar.jpg"
      {...props}
    />
  );
} 