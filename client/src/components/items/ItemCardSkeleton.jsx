/** Skeleton loader matching ItemCard's layout. */
export default function ItemCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] !rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/3" />
        <div className="flex items-center gap-2 pt-2">
          <div className="skeleton h-6 w-6 !rounded-full" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
