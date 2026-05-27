/** Triggers a browser download for an in-memory Blob. */
export const downloadBlob = (blob: Blob, filename: string) => {
  if (!(blob instanceof Blob)) {
    throw new Error('Invalid blob: expected a Blob instance');
  }

  if (typeof filename !== 'string' || filename.trim().length === 0) {
    throw new Error('Invalid filename: expected a non-empty string');
  }

  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  try {
    // Use a temporary anchor because browsers only download Blob URLs via clicks.
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }
};
