import React from 'react';
import Card from '../../../components/ui/Card';
import Skeleton, { SkeletonText } from '../../../components/ui/Skeleton';

/**
 * Placeholder for the overview while the history loads, in the shape of the
 * page it becomes: without it, returning users saw the first-run screen flash
 * before their data arrived.
 */
export default function OverviewSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading your overview">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="flex flex-col gap-7 sm:flex-row sm:items-center">
          <Skeleton className="mx-auto h-[8.5rem] w-[8.5rem] flex-shrink-0 rounded-full sm:mx-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-6 w-28" />
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-6" />)}
            </div>
          </div>
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-48 w-full rounded-md" />
        </Card>
      </div>

      <Skeleton className="h-[5.5rem] w-full rounded-lg" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <SkeletonText lines={5} />
        </Card>
        <Card className="space-y-5">
          <Skeleton className="h-4 w-32" />
          <SkeletonText lines={4} />
        </Card>
      </div>
    </div>
  );
}
