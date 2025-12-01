import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-md ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonText({ className = "h-3 w-24" }) {
  return <Skeleton className={className} />;
}

export function SkeletonCircle({ size = 40, className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export function CardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}
    >
      <div className="space-y-3">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-48" />
        <SkeletonText className="h-3 w-24" />
      </div>
    </div>
  );
}
