import { Skeleton } from '@/components/ui/Skeleton';

interface StationListSkeletonProps {
  count?: number;
}

export function StationListSkeleton({ count = 3 }: StationListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-48 h-4 mb-1" />
              <Skeleton className="w-36 h-4" />
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="w-10 h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
