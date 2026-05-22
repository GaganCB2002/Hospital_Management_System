import { formatDate } from '../../lib/formatters';
import { formatFileSize } from '../../lib/fileAttachments';

function getTypeLabel(type) {
  if (!type) {
    return 'File';
  }
  if (type.includes('pdf')) {
    return 'PDF';
  }
  if (type.startsWith('image/')) {
    return 'Image';
  }
  if (type.includes('word') || type.includes('document')) {
    return 'Doc';
  }
  if (type.includes('sheet') || type.includes('excel')) {
    return 'Sheet';
  }
  return 'File';
}

export default function DocumentList({ documents, emptyMessage = 'No documents uploaded yet.' }) {
  if (!documents?.length) {
    return <p className="text-body-md text-on-surface-variant">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 dark:border-outline dark:bg-on-primary-fixed md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-body-md font-bold text-on-surface dark:text-white">{document.name}</p>
              <span className="rounded-full bg-secondary-container px-2 py-1 text-label-md text-on-secondary-container">
                {getTypeLabel(document.type)}
              </span>
              <span className="rounded-full bg-surface-container-high px-2 py-1 text-label-md text-on-surface dark:bg-surface dark:text-white">
                {document.category || 'General'}
              </span>
            </div>
            <p className="mt-1 text-label-md text-on-surface-variant">
              {formatFileSize(document.size)} • Uploaded {formatDate(document.uploadedAt)} • {document.uploadedBy || 'System'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {document.dataUrl ? (
              <>
                <a
                  href={document.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-outline-variant px-3 py-2 text-body-md font-bold text-on-surface dark:border-outline dark:text-white"
                >
                  Preview
                </a>
                <a
                  href={document.dataUrl}
                  download={document.name}
                  className="rounded-lg bg-primary px-3 py-2 text-body-md font-bold text-white"
                >
                  Download
                </a>
              </>
            ) : (
              <span className="rounded-lg bg-surface-container-high px-3 py-2 text-body-md font-bold text-on-surface dark:bg-surface dark:text-white">
                Metadata only
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
