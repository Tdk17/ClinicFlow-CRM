export type UserRole = "admin" | "clinic_owner" | "doctor" | "receptionist" | "patient";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled" | "unpaid" | "expired";
export type AppointmentStatus = "scheduled" | "confirmed" | "attended" | "canceled" | "no_show";
export type PaymentMethod = "dinheiro" | "pix" | "cartão" | "convênio";
export type PaymentStatus = "pending" | "paid" | "canceled";

export interface Clinic {
  objectId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address?: string;
  logoUrl?: string;
  subscriptionStatus: SubscriptionStatus;
  currentPlan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionEndsAt?: string;
  trialEndsAt?: string;
}

export interface User {
  objectId: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  clinicId: string;
  isActive: boolean;
  clinic?: Clinic | null;
  // Schedule and security fields
  workDays?: number[];
  workStartHour?: string;
  workEndHour?: string;
  password?: string;
  crm?: string;
  specialty?: string;
}

export interface Patient {
  objectId: string;
  clinicId: string;
  fullName: string;
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  status: "active" | "inactive";
  createdBy: string;
  createdAt: string;
}

export interface Appointment {
  objectId: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdBy: string;
  
  // Joined fields for easy display
  patient?: Patient;
  professional?: User;
}

export interface MedicalRecord {
  objectId: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  appointmentId: string;
  complaint: string;
  diagnosis: string;
  prescription: string;
  exams?: string;
  certificate?: string;
  observations?: string;
  privateNotes?: string;
  createdAt: string;
  
  // Joined
  professional?: User;
  patient?: Patient;
}

export interface Payment {
  objectId: string;
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string | null;
  description: string;
  createdAt: string;
  
  // Joined
  patient?: Patient;
}

export interface SubscriptionLog {
  objectId: string;
  clinicId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  planName: string;
  amount: number;
  currency: string;
}
