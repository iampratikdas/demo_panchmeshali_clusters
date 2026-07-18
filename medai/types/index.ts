export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';
export type PrescriptionStatus = 'pending' | 'verified' | 'expired';
export type MedicineTiming = 'morning' | 'afternoon' | 'night';
export type ReportType = 'Blood Test' | 'MRI' | 'CT Scan' | 'X-Ray' | 'Ultrasound' | 'ECG' | 'Other';
export type NotificationType =
  | 'medicine'
  | 'appointment'
  | 'prescription'
  | 'message'
  | 'report';
export type MessageType =
  | 'text'
  | 'image'
  | 'voice'
  | 'pdf'
  | 'prescription'
  | 'report';
export type HistoryEventType =
  | 'visit'
  | 'upload'
  | 'medicine'
  | 'diagnosis'
  | 'vaccination'
  | 'lab'
  | 'checkup';

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  height: number;
  weight: number;
  bmi: number;
  age: number;
  avatar: string;
  healthScore: number;
  allergies: string[];
  conditions: string[];
  lifestyle: {
    smoking: string;
    alcohol: string;
    exercise: string;
    diet: string;
  };
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    validUntil: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  rating: number;
  reviews: number;
  avatar: string;
  experience: number;
  about: string;
  availability: string;
  isOnline: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  image: string;
  color: string;
  timings: MedicineTiming[];
  foodInstruction: string;
  duration: number;
  remainingDays: number;
  sideEffects: string[];
  notes: string;
  reminderEnabled: boolean;
  prescriptionId: string;
  doctorId: string;
  completedToday: MedicineTiming[];
}

export interface Prescription {
  id: string;
  doctorId: string;
  hospital: string;
  date: string;
  diagnosis: string;
  notes: string;
  medicineIds: string[];
  status: PrescriptionStatus;
  medicineCount: number;
  appointmentId?: string;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  doctorId: string;
  hospital: string;
  preview: string;
  notes: string;
  status: 'ready' | 'processing';
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  symptoms: string;
  notes: string;
  recommendation?: string;
  hospital: string;
}

export interface HistoryEvent {
  id: string;
  year: number;
  date: string;
  title: string;
  description: string;
  type: HistoryEventType;
  doctorId?: string;
  relatedIds?: string[];
  details?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: 'patient' | 'doctor';
  type: MessageType;
  content: string;
  timestamp: string;
  attachmentName?: string;
  duration?: string;
}

export interface ChatThread {
  id: string;
  doctorId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface HealthMetric {
  id: string;
  type: 'weight' | 'bloodPressure' | 'sugar' | 'heartRate' | 'bmi' | 'water';
  label: string;
  unit: string;
  current: number | string;
  data: { date: string; value: number; secondary?: number }[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  type: 'hospital' | 'family' | 'ambulance' | 'doctor';
}

export interface SearchResult {
  id: string;
  type: 'medicine' | 'doctor' | 'prescription' | 'history' | 'appointment' | 'report';
  title: string;
  subtitle: string;
}
