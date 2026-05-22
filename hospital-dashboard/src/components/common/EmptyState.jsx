export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="w-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-10 text-center dark:border-outline">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary dark:bg-on-primary-fixed dark:text-primary-fixed">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="w-full text-headline-md font-bold text-on-surface dark:text-white px-4 leading-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-body-md text-on-surface-variant max-w-md px-4 leading-relaxed text-center">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

