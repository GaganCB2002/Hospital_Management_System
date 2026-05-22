import { useEffect, useRef, useState } from 'react';

export default function ActionMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="rounded-lg border border-outline-variant p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low dark:border-outline dark:hover:bg-on-primary-fixed"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-12 z-30 min-w-[190px] overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl dark:border-outline dark:bg-surface-container">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className={`flex w-full items-center gap-2 px-4 py-3 text-left text-body-md transition-colors hover:bg-surface-container-low dark:text-white dark:hover:bg-on-primary-fixed ${
                action.destructive ? 'text-error dark:text-error-container' : 'text-on-surface'
              }`}
            >
              {action.icon ? <span className="material-symbols-outlined text-[18px]">{action.icon}</span> : null}
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
