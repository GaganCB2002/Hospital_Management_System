export default function Select({ label, error, options = [], className = '', placeholder, ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-surface dark:bg-surface border ${error ? 'border-error' : 'border-outline-variant dark:border-outline'} rounded-lg px-3 py-2.5 text-sm text-on-surface dark:text-on-surface focus:ring-2 focus:ring-primary outline-none transition-colors`}
        {...props}
      >
        {placeholder && <option value="" className="text-on-surface-variant">{placeholder}</option>}
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const display = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {display}
            </option>
          );
        })}
      </select>
      {error && <p className="mt-1 text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
