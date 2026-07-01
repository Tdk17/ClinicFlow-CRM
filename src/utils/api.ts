import { User, Clinic, Patient, Appointment, MedicalRecord, Payment } from "../types";

// Base API handler that communicates with the Express backend
// which acts as a dual-mode service (either proxying to Back4App or operating in Demo memory-mode).
const API_BASE = ""; 

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || "Ocorreu um erro na requisição à API.");
  }

  return response.json();
}

export const apiService = {
  // Config state
  async getConfig() {
    return fetchApi("/api/demo-config");
  },

  // Auth
  async login(username: string, password: string): Promise<{ sessionToken: string; user: User & { clinicDetails: Clinic } }> {
    return fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },

  async registerClinic(data: any): Promise<{ sessionToken: string; user: User & { clinicDetails: Clinic } }> {
    return fetchApi("/api/auth/register-clinic", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Patients
  async getPatients(clinicId: string): Promise<{ results: Patient[] }> {
    return fetchApi(`/api/patients?clinicId=${clinicId}`);
  },

  async createPatient(data: Partial<Patient>): Promise<Patient> {
    return fetchApi("/api/patients", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    return fetchApi(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  async deletePatient(id: string): Promise<{ success: boolean }> {
    return fetchApi(`/api/patients/${id}`, {
      method: "DELETE"
    });
  },

  // Appointments
  async getAppointments(clinicId: string, patientId?: string): Promise<{ results: Appointment[] }> {
    const query = patientId ? `clinicId=${clinicId}&patientId=${patientId}` : `clinicId=${clinicId}`;
    return fetchApi(`/api/appointments?${query}`);
  },

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    return fetchApi("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return fetchApi(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  // Medical Records
  async getMedicalRecords(patientId: string, clinicId: string): Promise<{ results: MedicalRecord[] }> {
    const query = patientId ? `patientId=${patientId}&clinicId=${clinicId}` : `clinicId=${clinicId}`;
    return fetchApi(`/api/medical-records?${query}`);
  },

  async createMedicalRecord(data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    return fetchApi("/api/medical-records", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Payments
  async getPayments(clinicId: string): Promise<{ results: Payment[] }> {
    return fetchApi(`/api/payments?clinicId=${clinicId}`);
  },

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    return fetchApi("/api/payments", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Team
  async getTeamMembers(clinicId: string): Promise<{ results: User[] }> {
    return fetchApi(`/api/team?clinicId=${clinicId}`);
  },

  async createTeamMember(data: Partial<User> & { clinicId: string }): Promise<User> {
    return fetchApi("/api/team", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  async updateTeamMember(id: string, data: Partial<User>): Promise<User> {
    return fetchApi(`/api/team/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  // Public & Patients
  async getPublicClinics(): Promise<{ results: { objectId: string; name: string }[] }> {
    return fetchApi("/api/public/clinics");
  },

  async registerPatient(data: any): Promise<{ sessionToken: string; user: User & { clinicDetails: Clinic } }> {
    return fetchApi("/api/auth/register-patient", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Subscriptions & Checkout
  async createCheckoutSession(planName: string, priceId: string, priceAmount: number, clinicId: string) {
    return fetchApi("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ planName, priceId, priceAmount, clinicId })
    });
  },

  async createCustomerPortalSession(stripeCustomerId: string) {
    return fetchApi("/api/create-customer-portal-session", {
      method: "POST",
      body: JSON.stringify({ customerId: stripeCustomerId })
    });
  },

  async simulateCheckoutSuccess(clinicId: string, plan: string) {
    return fetchApi("/api/sim-checkout-success", {
      method: "POST",
      body: JSON.stringify({ clinicId, plan })
    });
  }
};
