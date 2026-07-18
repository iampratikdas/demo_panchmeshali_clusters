export const APP_NAME = 'MedAI';
export const APP_TAGLINE = 'Your Health, Organized.';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;

export const SYMPTOM_CHIPS = [
  'I have a fever',
  'I have a headache',
  'I have a sore throat',
  'I feel dizzy',
  'Chest pain',
  'Fatigue',
] as const;

export const SERVICE_CARDS = [
  { id: 'checkup', label: 'Check-up', icon: 'clipboard' },
  { id: 'cardiology', label: 'Cardiology', icon: 'heart' },
  { id: 'dental', label: 'Dental', icon: 'tooth' },
  { id: 'neurology', label: 'Neurology', icon: 'brain' },
] as const;

export const QUICK_ACTIONS = [
  { id: 'upload-rx', label: 'Upload Prescription', route: '/prescription/upload', icon: 'document' },
  { id: 'upload-report', label: 'Upload Report', route: '/reports', icon: 'folder' },
  { id: 'add-medicine', label: 'Add Medicine', route: '/(tabs)/medicines', icon: 'pill' },
  { id: 'book', label: 'Book Appointment', route: '/appointment/book', icon: 'calendar' },
  { id: 'emergency', label: 'Emergency', route: '/emergency', icon: 'phone' },
  { id: 'history', label: 'View History', route: '/history', icon: 'clock' },
] as const;
