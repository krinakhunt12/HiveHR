export const FILE_TYPES = [
  { 
    value: 'resume', 
    label: 'Resume/CV',
    extensions: ['pdf', 'doc', 'docx']
  },
  { 
    value: 'payslip', 
    label: 'Payslip',
    extensions: ['pdf', 'jpg', 'jpeg', 'png']
  },
  { 
    value: 'certificate', 
    label: 'Certificate',
    extensions: ['pdf', 'jpg', 'jpeg', 'png']
  },
  { 
    value: 'other', 
    label: 'Other Document',
    extensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
  }
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'
];