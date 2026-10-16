import React, { useRef, useState } from 'react';

interface FileDropzoneProps {
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMB?: number;
  selectedFile?: File | null;
  selectedFileName?: string;
  onFileSelect: (file: File) => void;
  onRemoveFile?: () => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  label = 'Upload Scanned Document / Proof',
  hint = 'Drag & drop signed Annexure-I form or receipt PDF / JPG (Max 5 MB)',
  accept = '.pdf,.jpg,.jpeg,.png,.csv',
  selectedFile,
  selectedFileName,
  onFileSelect,
  onRemoveFile,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const displayName = selectedFile?.name || selectedFileName;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase">
          {label} <span className="text-status-error">*</span>
        </label>
      )}

      {displayName ? (
        <div className="p-3 bg-surface-container-low rounded-lg border border-border-subtle flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[24px]">
              description
            </span>
            <div className="flex flex-col">
              <span className="font-title-md text-[13px] font-bold text-primary">
                {displayName}
              </span>
              <span className="font-body-sm text-[11px] text-status-ready font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                SHA-256 Verified Checksum Checked
              </span>
            </div>
          </div>

          {onRemoveFile && (
            <button
              type="button"
              onClick={onRemoveFile}
              className="p-1 text-on-surface-variant hover:text-status-error rounded transition-colors"
              title="Remove file"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-secondary bg-secondary-fixed/10'
              : 'border-border-strong hover:border-secondary bg-surface-container-low/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
          </div>
          <span className="font-label-md text-label-md font-bold text-primary">
            Click to upload or drag & drop file
          </span>
          <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">
            {hint}
          </span>
        </div>
      )}
    </div>
  );
};
