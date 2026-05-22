export function normalizeSearch(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function matchesQuery(record, query, fields) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) => {
    const sourceValue = typeof field === 'function' ? field(record) : record?.[field];
    return normalizeSearch(sourceValue).includes(normalizedQuery);
  });
}

export function sortByQueryStrength(records, query, accessor) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return records;
  }

  return [...records].sort((left, right) => {
    const leftValue = normalizeSearch(accessor(left));
    const rightValue = normalizeSearch(accessor(right));
    const leftStartsWith = leftValue.startsWith(normalizedQuery) ? 1 : 0;
    const rightStartsWith = rightValue.startsWith(normalizedQuery) ? 1 : 0;
    return rightStartsWith - leftStartsWith;
  });
}
