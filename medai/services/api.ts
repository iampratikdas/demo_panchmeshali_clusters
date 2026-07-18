import {
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
} from '@/dummy';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async getPatient() {
    await delay();
    return patient;
  },

  async getDoctors() {
    await delay();
    return doctors;
  },

  async getDoctor(id: string) {
    await delay(200);
    return doctors.find((d) => d.id === id) ?? null;
  },

  async getMedicines() {
    await delay();
    return medicines;
  },

  async getMedicine(id: string) {
    await delay(200);
    return medicines.find((m) => m.id === id) ?? null;
  },

  async getPrescriptions() {
    await delay();
    return prescriptions;
  },

  async getPrescription(id: string) {
    await delay(200);
    return prescriptions.find((p) => p.id === id) ?? null;
  },

  async getReports() {
    await delay();
    return reports;
  },

  async getReport(id: string) {
    await delay(200);
    return reports.find((r) => r.id === id) ?? null;
  },

  async getAppointments() {
    await delay();
    return appointments;
  },

  async getAppointment(id: string) {
    await delay(200);
    return appointments.find((a) => a.id === id) ?? null;
  },

  async getHistory() {
    await delay();
    return history;
  },

  async getChatThreads() {
    await delay();
    return chats.chatThreads;
  },

  async getChatMessages(chatId: string) {
    await delay();
    return chats.messages.filter((m) => m.chatId === chatId);
  },

  async getNotifications() {
    await delay();
    return notifications;
  },

  async getHealthMetrics() {
    await delay();
    return healthMetrics;
  },

  async getEmergencyContacts() {
    await delay();
    return emergency.contacts;
  },

  async getActivity() {
    await delay();
    return activity.activities;
  },

  async search(query: string) {
    await delay(300);
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: {
      id: string;
      type: string;
      title: string;
      subtitle: string;
    }[] = [];

    doctors
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q),
      )
      .forEach((d) =>
        results.push({
          id: d.id,
          type: 'doctor',
          title: d.name,
          subtitle: d.specialization,
        }),
      );

    medicines
      .filter((m) => m.name.toLowerCase().includes(q))
      .forEach((m) =>
        results.push({
          id: m.id,
          type: 'medicine',
          title: m.name,
          subtitle: m.dosage,
        }),
      );

    prescriptions
      .filter(
        (p) =>
          p.diagnosis.toLowerCase().includes(q) ||
          p.doctorName.toLowerCase().includes(q),
      )
      .forEach((p) =>
        results.push({
          id: p.id,
          type: 'prescription',
          title: p.diagnosis,
          subtitle: p.doctorName,
        }),
      );

    reports
      .filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      )
      .forEach((r) =>
        results.push({
          id: r.id,
          type: 'report',
          title: r.title,
          subtitle: r.type,
        }),
      );

    appointments
      .filter(
        (a) =>
          a.reason.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q),
      )
      .forEach((a) =>
        results.push({
          id: a.id,
          type: 'appointment',
          title: a.doctorName,
          subtitle: `${a.date} · ${a.time}`,
        }),
      );

    return results;
  },

  async login(_email: string, _password: string) {
    await delay(800);
    return { success: true, user: patient };
  },

  async signup(_data: Record<string, unknown>) {
    await delay(1000);
    return { success: true, user: patient };
  },
};
