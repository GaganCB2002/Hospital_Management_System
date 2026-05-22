export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-surface dark:bg-surface border ${error ? 'border-error' : 'border-outline-variant dark:border-outline'} rounded-lg px-3 py-2.5 text-sm text-on-surface dark:text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors placeholder:text-on-surface-variant/60`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
