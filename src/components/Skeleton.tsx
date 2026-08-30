import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className, rounded = 'rounded-lg' }: SkeletonProps) {
  return <div className={cn('shimmer-bg', rounded, className)} />;
}

export function MessageCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16" rounded="rounded-full" />
        <Skeleton className="h-6 w-16" rounded="rounded-full" />
        <Skeleton className="h-6 w-20" rounded="rounded-full" />
      </div>
    </div>
  );
}

export function AvatarSkeleton({ size = 'h-10 w-10' }: { size?: string }) {
  return <Skeleton className={size} rounded="rounded-full" />;
}
