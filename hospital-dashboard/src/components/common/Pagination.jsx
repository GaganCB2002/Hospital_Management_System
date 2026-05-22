export default function Pagination({ page, pageSize, total, hasMore, onPrev, onNext }) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = total ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="flex items-center justify-between border-t border-outline-variant px-5 py-4 dark:border-outline">
      <p className="text-body-md text-on-surface-variant">
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={page === 1}
          className="rounded-lg border border-outline-variant px-4 py-2 text-body-md disabled:opacity-50 dark:border-outline dark:text-white"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasMore}
          className="rounded-lg border border-outline-variant px-4 py-2 text-body-md disabled:opacity-50 dark:border-outline dark:text-white"
        >
          Show {pageSize} More
        </button>
      </div>
    </div>
  );
}
