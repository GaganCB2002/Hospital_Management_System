export function formatInr(value) {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatCompactInr(value) {
  const numericValue = Number(value) || 0;
  if (numericValue >= 10000000) {
    return `${formatDecimal(numericValue / 10000000)} Cr`;
  }
  if (numericValue >= 100000) {
    return `${formatDecimal(numericValue / 100000)} L`;
  }
  if (numericValue >= 1000) {
    return `${formatDecimal(numericValue / 1000)} K`;
  }
  return formatInr(numericValue);
}

export function formatDate(value, options = {}) {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(date, time) {
  return `${formatDate(date)}${time ? ` • ${time}` : ''}`;
}

export function formatDecimal(value) {
  return Number(value).toFixed(1).replace(/\.0$/, '');
}

export function formatPercent(value) {
  if (typeof value === 'string') {
    return value;
  }
  return `${formatDecimal(value)}%`;
}
