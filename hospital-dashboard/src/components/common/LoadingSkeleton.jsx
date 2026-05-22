export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-surface-container dark:bg-on-primary-fixed/60 ${className}`} />;
}

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-12 gap-3">
          <SkeletonBlock className="col-span-3 h-12" />
          <SkeletonBlock className="col-span-3 h-12" />
          <SkeletonBlock className="col-span-2 h-12" />
          <SkeletonBlock className="col-span-2 h-12" />
          <SkeletonBlock className="col-span-2 h-12" />
        </div>
      ))}
    </div>
  );
}
