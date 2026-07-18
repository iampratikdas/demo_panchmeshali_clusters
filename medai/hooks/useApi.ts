import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export const queryKeys = {
  patient: ['patient'] as const,
  doctors: ['doctors'] as const,
  doctor: (id: string) => ['doctors', id] as const,
  medicines: ['medicines'] as const,
  medicine: (id: string) => ['medicines', id] as const,
  prescriptions: ['prescriptions'] as const,
  prescription: (id: string) => ['prescriptions', id] as const,
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  appointments: ['appointments'] as const,
  appointment: (id: string) => ['appointments', id] as const,
  history: ['history'] as const,
  chats: ['chats'] as const,
  messages: (chatId: string) => ['messages', chatId] as const,
  notifications: ['notifications'] as const,
  healthMetrics: ['healthMetrics'] as const,
  emergency: ['emergency'] as const,
  activity: ['activity'] as const,
  search: (q: string) => ['search', q] as const,
};

export function usePatient() {
  return useQuery({ queryKey: queryKeys.patient, queryFn: api.getPatient });
}

export function useDoctors() {
  return useQuery({ queryKey: queryKeys.doctors, queryFn: api.getDoctors });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctor(id),
    queryFn: () => api.getDoctor(id),
    enabled: !!id,
  });
}

export function useMedicines() {
  return useQuery({ queryKey: queryKeys.medicines, queryFn: api.getMedicines });
}

export function useMedicine(id: string) {
  return useQuery({
    queryKey: queryKeys.medicine(id),
    queryFn: () => api.getMedicine(id),
    enabled: !!id,
  });
}

export function usePrescriptions() {
  return useQuery({
    queryKey: queryKeys.prescriptions,
    queryFn: api.getPrescriptions,
  });
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: queryKeys.prescription(id),
    queryFn: () => api.getPrescription(id),
    enabled: !!id,
  });
}

export function useReports() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: api.getReports });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.report(id),
    queryFn: () => api.getReport(id),
    enabled: !!id,
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments,
    queryFn: api.getAppointments,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointment(id),
    queryFn: () => api.getAppointment(id),
    enabled: !!id,
  });
}

export function useHistory() {
  return useQuery({ queryKey: queryKeys.history, queryFn: api.getHistory });
}

export function useChatThreads() {
  return useQuery({
    queryKey: queryKeys.chats,
    queryFn: api.getChatThreads,
  });
}

export function useChatMessages(chatId: string) {
  return useQuery({
    queryKey: queryKeys.messages(chatId),
    queryFn: () => api.getChatMessages(chatId),
    enabled: !!chatId,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.getNotifications,
  });
}

export function useHealthMetrics() {
  return useQuery({
    queryKey: queryKeys.healthMetrics,
    queryFn: api.getHealthMetrics,
  });
}

export function useEmergencyContacts() {
  return useQuery({
    queryKey: queryKeys.emergency,
    queryFn: api.getEmergencyContacts,
  });
}

export function useActivity() {
  return useQuery({ queryKey: queryKeys.activity, queryFn: api.getActivity });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => api.search(query),
    enabled: query.trim().length > 0,
  });
}
