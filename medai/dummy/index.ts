import patient from './patient.json';
import doctors from './doctors.json';
import medicines from './medicines.json';
import prescriptions from './prescriptions.json';
import reports from './reports.json';
import appointments from './appointments.json';
import history from './history.json';
import chats from './chats.json';
import notifications from './notifications.json';
import healthMetrics from './healthMetrics.json';
import emergency from './emergency.json';
import activity from './activity.json';

export {
  patient,
  doctors,
  medicines,
  prescriptions,
  reports,
  appointments,
  history,
  chats,
  notifications,
  healthMetrics,
  emergency,
  activity,
};

export type Patient = typeof patient;
export type Doctor = (typeof doctors)[number];
export type Medicine = (typeof medicines)[number];
export type Prescription = (typeof prescriptions)[number];
export type Report = (typeof reports)[number];
export type Appointment = (typeof appointments)[number];
export type HistoryData = typeof history;
export type HistoryEvent = (typeof history.timeline)[number]['events'][number];
export type ChatsData = typeof chats;
export type ChatThread = (typeof chats.chatThreads)[number];
export type ChatMessage = (typeof chats.messages)[number];
export type Notification = (typeof notifications)[number];
export type HealthMetrics = typeof healthMetrics;
export type EmergencyData = typeof emergency;
export type EmergencyContact = (typeof emergency.contacts)[number];
export type ActivityData = typeof activity;
export type ActivityItem = (typeof activity.activities)[number];
