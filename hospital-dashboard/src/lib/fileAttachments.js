function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
}

export async function filesToAttachments(fileList, options = {}) {
  const {
    maxSizeMb = 2,
    category = 'General',
    uploadedBy = 'Portal User',
  } = options;

  const files = Array.from(fileList || []);
  const maxBytes = maxSizeMb * 1024 * 1024;

  return Promise.all(
    files.map(async (file, index) => {
      if (file.size > maxBytes) {
        throw new Error(`${file.name} exceeds the ${maxSizeMb} MB upload limit.`);
      }

      const dataUrl = await readFileAsDataUrl(file);
      return {
        id: `DOC-${Date.now()}-${index}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        category,
        uploadedBy,
        dataUrl,
      };
    }),
  );
}
