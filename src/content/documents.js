export const documents = {
  title: 'Your Documents',
  searchPlaceholder: 'Search documents…',
  filters: ['All', 'PDF', 'DOCX', 'IMAGE', 'XLSX', 'ZIP'],
  sort: ['Newest', 'Oldest', 'A–Z', 'Z–A'],
  actions: { delete: 'Delete', download: 'Download', preview: 'Preview' },
  empty: 'No documents uploaded yet.',
};

export const uploadModal = {
  title: 'Upload Document',
  name: 'Title',
  description: 'Description',
  addFiles: 'Add Files',
  upload: 'Upload',
  cancel: 'Cancel',
  errors: {
    noFiles: 'Please add at least one file.',
    pickerFailed: 'File picker failed.',
    missingFields: 'Please enter title and description.',
  },
};

export const editor = {
  titleLabel: 'Title',
  descriptionLabel: 'Description',
  save: 'Save',
  cancel: 'Cancel',
  errors: {
    updateFailed: 'Update failed.',
  },
};
