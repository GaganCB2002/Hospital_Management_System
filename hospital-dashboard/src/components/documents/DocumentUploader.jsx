import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { filesToAttachments } from '../../lib/fileAttachments';

export default function DocumentUploader({
  label = 'Upload Documents',
  helperText = 'Supports PDF, images, and all standard file formats up to 2 MB each.',
  category = 'General',
  uploadedBy = 'Portal User',
  onDocumentsAdded,
  multiple = true,
  accept = '.pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.txt',
}) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (event) => {
    const { files } = event.target;
    if (!files?.length) {
      return;
    }

    setIsUploading(true);
    try {
      const attachments = await filesToAttachments(files, { category, uploadedBy });
      await onDocumentsAdded?.(attachments);
      toast.success(`${attachments.length} document${attachments.length > 1 ? 's' : ''} uploaded successfully.`);
      event.target.value = '';
    } catch (error) {
      toast.error(error.message || 'Unable to upload documents.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-4 dark:border-outline dark:bg-on-primary-fixed">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-body-md font-bold text-on-surface dark:text-white">{label}</p>
          <p className="text-label-md text-on-surface-variant">{helperText}</p>
        </div>
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 text-body-md font-bold text-white transition ${
            isUploading ? 'bg-outline' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Choose Files'}
        </label>
      </div>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
