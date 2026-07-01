import React, { useState, useEffect } from "react";
import { LogOut, Activity, User as UserIcon, HelpCircle, ShieldAlert, Lock, CreditCard } from "lucide-react";
import { apiService } from "./utils/api";
import { User, Clinic, Patient, Appointment, MedicalRecord, Payment } from "./types";

// Modular Views
import { PwaBanner } from "./components/PwaBanner";
import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { PatientsView } from "./components/PatientsView";
import { AgendaView } from "./components/AgendaView";
import { ProntuariosView } from "./components/ProntuariosView";
import { FinanceiroView } from "./components/FinanceiroView";
import { PlanosView } from "./components/PlanosView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";
import { AdminGlobalView } from "./components/AdminGlobalView";
import { LoginView } from "./components/LoginView";
import { SuccessView } from "./components/SuccessView";
import { CancelView } from "./components/CancelView";
import { PatientView } from "./components/PatientView";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);

  // Core CRM collections
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [globalClinics, setGlobalClinics] = useState<Clinic[]>([]);

  // Hash change routing listener
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || "#/dashboard");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Restore Session
  useEffect(() => {
    const storedUser = localStorage.getItem("clinicflow_user");
    const storedClinic = localStorage.getItem("clinicflow_clinic");
    if (storedUser && storedClinic) {
      setUser(JSON.parse(storedUser));
      setClinic(JSON.parse(storedClinic));
    }
  }, []);

  // Fetch collections when user and clinic are available
  const loadCrmData = async () => {
    if (!user || !clinic) return;
    try {
      if (user.role === "patient") {
        // Patient role: ONLY load their own medical records and appointments
        const [appointmentsRes, recordsRes] = await Promise.all([
          apiService.getAppointments(clinic.objectId, user.objectId),
          apiService.getMedicalRecords(user.objectId, clinic.objectId)
        ]);

        setAppointments(appointmentsRes.results || []);
        setMedicalRecords(recordsRes.results || []);
        
        // Clear other records that patient shouldn't see
        setPatients([]);
        setPayments([]);
        setTeamMembers([]);
        return;
      }

      // Clinic staff role (doctor, receptionist, owner, admin)
      const [patientsRes, appointmentsRes, paymentsRes, teamRes] = await Promise.all([
        apiService.getPatients(clinic.objectId),
        apiService.getAppointments(clinic.objectId),
        apiService.getPayments(clinic.objectId),
        apiService.getTeamMembers(clinic.objectId)
      ]);

      setPatients(patientsRes.results || []);
      setAppointments(appointmentsRes.results || []);
      setPayments(paymentsRes.results || []);
      setTeamMembers(teamRes.results || []);

      // Now fetch all medical records for this clinic
      const recordsRes = await apiService.getMedicalRecords("", clinic.objectId);
      setMedicalRecords(recordsRes.results || []);
    } catch (err) {
      console.error("Error loading CRM data:", err);
    }
  };

  // Trigger loads
  useEffect(() => {
    if (user && clinic) {
      loadCrmData();
    }
  }, [user, clinic]);

  // If role is Global Admin, load list of all registered clinics
  useEffect(() => {
    if (user && (user.role === "admin" || user.username === "admin")) {
      apiService.getConfig().then(cfg => {
        // We can fetch global clinics using custom admin call or load from demo clinics
        // For admin simulation we populate it with demo clinics from memory
        setGlobalClinics([
          {
            objectId: "demo-clinic",
            name: "Clínica Saúde & Vida",
            document: "12.345.678/0001-90",
            phone: "(11) 98765-4321",
            email: "contato@saudevida.com.br",
            address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
            subscriptionStatus: "trial",
            currentPlan: "Starter",
            stripeCustomerId: "cus_demo123"
          }
        ]);
      });
    }
  }, [user]);

  // Route Guard - STRICT role permissions redirect to prevent unauthorized access
  useEffect(() => {
    if (user) {
      const isOwnerOrAdmin = user.role === "clinic_owner" || user.role === "admin";
      const isDoctor = user.role === "doctor";
      const isReceptionist = user.role === "receptionist";

      // receptionist and doctor cannot see financeiro, planos, and configuracoes
      if (!isOwnerOrAdmin) {
        if (
          currentHash.startsWith("#/financeiro") || 
          currentHash.startsWith("#/planos") || 
          currentHash.startsWith("#/configuracoes") || 
          currentHash.startsWith("#/admin-global")
        ) {
          window.location.hash = "#/dashboard";
        }
      }

      // receptionist cannot see prontuarios
      if (isReceptionist && currentHash.startsWith("#/prontuarios")) {
        window.location.hash = "#/dashboard";
      }
    }
  }, [currentHash, user]);

  // AUTH ACTIONS
  const handleLogin = async (email: string, pass: string) => {
    const res = await apiService.login(email, pass);
    if (res && res.user) {
      setUser(res.user);
      setClinic(res.user.clinicDetails);
      localStorage.setItem("clinicflow_user", JSON.stringify(res.user));
      localStorage.setItem("clinicflow_clinic", JSON.stringify(res.user.clinicDetails));
      window.location.hash = "#/dashboard";
    }
  };

  const handleRegister = async (
    clinicName: string, 
    document: string, 
    phone: string, 
    email: string, 
    adminName: string, 
    adminEmail: string, 
    pass: string
  ) => {
    const res = await apiService.registerClinic({
      clinicName,
      document,
      phone,
      email,
      adminName,
      adminEmail,
      password: pass
    });
    if (res && res.user) {
      setUser(res.user);
      setClinic(res.user.clinicDetails);
      localStorage.setItem("clinicflow_user", JSON.stringify(res.user));
      localStorage.setItem("clinicflow_clinic", JSON.stringify(res.user.clinicDetails));
      window.location.hash = "#/dashboard";
    }
  };

  const handleRegisterPatient = async (patientData: any) => {
    const res = await apiService.registerPatient(patientData);
    if (res && res.user) {
      setUser(res.user);
      setClinic(res.user.clinicDetails);
      localStorage.setItem("clinicflow_user", JSON.stringify(res.user));
      localStorage.setItem("clinicflow_clinic", JSON.stringify(res.user.clinicDetails));
      window.location.hash = "#/dashboard";
    }
  };

  const handleLogout = () => {
    setUser(null);
    setClinic(null);
    localStorage.removeItem("clinicflow_user");
    localStorage.removeItem("clinicflow_clinic");
    localStorage.removeItem("clinicflow_token");
    window.location.hash = "#/dashboard";
  };

  // CLIENT REFRESH HELPER FOR STRIPE SUCCESS
  const handleRefreshClinic = async () => {
    if (!user || !clinic) return;
    try {
      const res = await apiService.login(user.username, "demo123"); // Refresh session
      if (res && res.user) {
        setClinic(res.user.clinicDetails);
        localStorage.setItem("clinicflow_clinic", JSON.stringify(res.user.clinicDetails));
      }
    } catch (e) {
      // Direct update of simulated status
      setClinic(prev => prev ? { ...prev, subscriptionStatus: "active", currentPlan: "Pro" } : null);
    }
  };

  // PATIENT ACTIONS
  const handleAddPatient = async (patientData: any) => {
    if (!clinic || !user) return;
    try {
      const newPatient = await apiService.createPatient({
        ...patientData,
        clinicId: clinic.objectId,
        createdBy: user.objectId
      });
      setPatients(prev => [newPatient, ...prev]);
    } catch (err: any) {
      alert("Erro ao cadastrar paciente: " + err.message);
    }
  };

  const handleUpdatePatient = async (patientId: string, updatedFields: any) => {
    try {
      const updated = await apiService.updatePatient(patientId, updatedFields);
      setPatients(prev => prev.map(p => p.objectId === patientId ? { ...p, ...updated } : p));
    } catch (err: any) {
      alert("Erro ao atualizar paciente: " + err.message);
    }
  };

  // APPOINTMENT ACTIONS
  const handleAddAppointment = async (appointmentData: any) => {
    if (!clinic || !user) return;
    try {
      const newAppt = await apiService.createAppointment({
        clinicId: clinic.objectId,
        patientId: appointmentData.patient.objectId,
        professionalId: appointmentData.professional.objectId,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: appointmentData.status,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        createdBy: user.objectId
      });
      
      // Load joins
      newAppt.patient = appointmentData.patient;
      newAppt.professional = appointmentData.professional;

      setAppointments(prev => [newAppt, ...prev]);
    } catch (err: any) {
      alert("Erro ao agendar consulta: " + err.message);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const updated = await apiService.updateAppointment(appointmentId, { status } as any);
      setAppointments(prev => prev.map(a => {
        if (a.objectId === appointmentId) {
          return { ...a, status: updated.status || status };
        }
        return a;
      }));
    } catch (err: any) {
      alert("Erro ao atualizar status da consulta: " + err.message);
    }
  };

  // MEDICAL RECORD ACTIONS
  const handleAddMedicalRecord = async (recordData: any) => {
    if (!clinic || !user) return;
    try {
      const newRecord = await apiService.createMedicalRecord({
        clinicId: clinic.objectId,
        patientId: recordData.patient.objectId,
        professionalId: user.objectId,
        appointmentId: recordData.appointment?.objectId || "",
        complaint: recordData.complaint,
        diagnosis: recordData.diagnosis,
        prescription: recordData.prescription,
        exams: recordData.exams,
        certificate: recordData.certificate,
        observations: recordData.observations,
        privateNotes: recordData.privateNotes
      });

      newRecord.professional = user;

      setMedicalRecords(prev => [newRecord, ...prev]);
    } catch (err: any) {
      alert("Erro ao salvar prontuário: " + err.message);
    }
  };

  // PAYMENT ACTIONS
  const handleAddPayment = async (paymentData: any) => {
    if (!clinic) return;
    try {
      const newPayment = await apiService.createPayment({
        clinicId: clinic.objectId,
        patientId: paymentData.patient.objectId,
        appointmentId: paymentData.appointment?.objectId || "",
        amount: paymentData.amount,
        method: paymentData.method,
        status: paymentData.status,
        dueDate: paymentData.dueDate,
        paidAt: paymentData.paidAt,
        description: paymentData.description
      });

      newPayment.patient = paymentData.patient;

      setPayments(prev => [newPayment, ...prev]);
    } catch (err: any) {
      alert("Erro ao lançar receita: " + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, status: "pending" | "paid" | "canceled") => {
    try {
      // Using standard update for payments
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paidAt: status === "paid" ? new Date().toISOString() : null })
      });
      if (response.ok) {
        setPayments(prev => prev.map(p => p.objectId === paymentId ? { ...p, status, paidAt: status === "paid" ? new Date().toISOString() : null } : p));
      }
    } catch (err) {
      // Fallback
      setPayments(prev => prev.map(p => p.objectId === paymentId ? { ...p, status, paidAt: status === "paid" ? new Date().toISOString() : null } : p));
    }
  };

  // CLINIC AND TEAM ACTIONS
  const handleUpdateClinic = async (updatedFields: any) => {
    if (!clinic) return;
    try {
      const response = await fetch(`/api/clinics/${clinic.objectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (response.ok) {
        setClinic(prev => prev ? { ...prev, ...updatedFields } : null);
        localStorage.setItem("clinicflow_clinic", JSON.stringify({ ...clinic, ...updatedFields }));
      }
    } catch (e) {
      setClinic(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };

  const handleAddClinicMember = async (memberData: any) => {
    if (!clinic) return;
    try {
      const newMember = await apiService.createTeamMember({
        ...memberData,
        clinicId: clinic.objectId
      });
      setTeamMembers(prev => [...prev, newMember]);
      alert("Membro adicionado à equipe com sucesso!");
    } catch (e: any) {
      alert("Erro ao adicionar membro à equipe: " + e.message);
    }
  };

  const handleToggleMemberActive = async (memberId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive })
      });
      if (response.ok) {
        setTeamMembers(prev => prev.map(t => t.objectId === memberId ? { ...t, isActive } : t));
      }
    } catch (e) {
      setTeamMembers(prev => prev.map(t => t.objectId === memberId ? { ...t, isActive } : t));
    }
  };

  // STRIPE ACTIONS
  const handleCheckout = async (planName: string, priceId: string) => {
    if (!clinic) return;
    try {
      const res = await apiService.createCheckoutSession(planName, priceId, 149.00, clinic.objectId);
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert("Erro ao iniciar assinatura: " + err.message);
    }
  };

  const handleManagePortal = async () => {
    if (!clinic || !clinic.stripeCustomerId) return;
    try {
      const res = await apiService.createCustomerPortalSession(clinic.stripeCustomerId);
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert("Erro ao acessar faturamento: " + err.message);
    }
  };

  // ADMIN OPERATIONS
  const handleTriggerWebhook = async (clinicId: string, eventType: string) => {
    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: eventType,
          data: {
            object: {
              customer: "cus_demo123",
              subscription: "sub_demo123",
              amount_total: 29900,
              currency: "brl",
              metadata: { clinicId, planName: "Pro" }
            }
          }
        })
      });
      if (res.ok) {
        alert("Evento Stripe Webhook simulado com sucesso! Atualizando tela...");
        handleRefreshClinic();
      }
    } catch (e: any) {
      alert("Erro ao disparar webhook: " + e.message);
    }
  };

  const handleUpdateClinicPlan = async (clinicId: string, plan: string, status: string) => {
    try {
      const response = await fetch(`/api/clinics/${clinicId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPlan: plan, subscriptionStatus: status })
      });
      if (response.ok) {
        alert(`Plano da clínica atualizado para ${plan} (${status}) com sucesso!`);
        if (clinic && clinic.objectId === clinicId) {
          setClinic(prev => prev ? { ...prev, currentPlan: plan, subscriptionStatus: status as any } : null);
        }
      }
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  // AUTH GUARDIAN SCREEN
  if (!user) {
    return <LoginView onLogin={handleLogin} onRegister={handleRegister} onRegisterPatient={handleRegisterPatient} />;
  }

  if (user.role === "patient") {
    return (
      <PatientView 
        user={user} 
        clinic={clinic} 
        appointments={appointments} 
        medicalRecords={medicalRecords}
        onLogout={handleLogout} 
        onLoadAppointments={loadCrmData}
      />
    );
  }

  // Doctors and specialists
  const doctorsList = teamMembers.filter(t => t.role === "doctor" || t.role === "clinic_owner");

  // Check if clinic's plan has expired
  const isExpired = clinic?.subscriptionStatus === "expired" || 
    clinic?.subscriptionStatus === "canceled" || 
    !!(clinic?.subscriptionStatus === "trial" && clinic.subscriptionEndsAt && new Date(clinic.subscriptionEndsAt) < new Date());

  const showExpiredBlock = !!(isExpired && 
    user && 
    user.role !== "admin" && 
    !currentHash.startsWith("#/planos") && 
    !currentHash.startsWith("#/success") && 
    !currentHash.startsWith("#/cancel"));

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Top Smart PWA Installation invite bar */}
      <PwaBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Responsive, Role-based Left Sidebar navigation */}
        <Sidebar 
          user={user} 
          clinic={clinic} 
          currentHash={currentHash} 
          onManagePortal={handleManagePortal} 
        />

        {/* Content Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Integrated Header */}
          <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 select-none shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {clinic?.name || "Clínica Geral"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors cursor-help" title="Ajuda do ClinicFlow">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-semibold hidden md:inline">Suporte</span>
              </div>
              
              <button 
                id="header-btn-logout"
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer border border-slate-100 hover:border-rose-100 px-3 py-1.5 rounded-xl bg-slate-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </header>

          {/* Interactive Routing Body Frame */}
          <main className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto h-full">
              {showExpiredBlock ? (
                <div className="flex flex-col items-center justify-center min-h-[65vh] bg-white border border-rose-100 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs animate-fade-in my-auto mt-6">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] bg-rose-500/10 text-rose-600 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest">
                      Assinatura Requerida
                    </span>
                    <h3 className="font-bold text-slate-900 text-xl tracking-tight">Período de Testes Expirado</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      O período de avaliação de 14 dias ou a assinatura ativa da clínica <strong>{clinic?.name || "sua clínica"}</strong> expirou. O acesso às tabelas, cadastros, consultas, financeiro e prontuários está suspenso até que um plano seja escolhido.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full max-w-md text-left text-[11px] text-slate-500 space-y-1.5 mx-auto">
                    <p>• <strong>Clínica:</strong> {clinic?.name || "Geral"}</p>
                    <p>• <strong>Status da Conta:</strong> Suspenso por expiração</p>
                    <p>• <strong>Seus Dados:</strong> Fique tranquilo, seus pacientes e prontuários estão salvos com segurança.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2 w-full max-w-xs mx-auto">
                    <a 
                      href="#/planos" 
                      className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Escolher Plano & Assinar</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {currentHash.startsWith("#/dashboard") && (
                    <DashboardView 
                      user={user} 
                      patients={patients} 
                      appointments={appointments} 
                      payments={payments} 
                      clinic={clinic}
                    />
                  )}

                  {currentHash.startsWith("#/pacientes") && (
                    <PatientsView 
                      user={user} 
                      patients={patients} 
                      onAddPatient={handleAddPatient} 
                      onUpdatePatient={handleUpdatePatient} 
                    />
                  )}

                  {currentHash.startsWith("#/agenda") && (
                    <AgendaView 
                      user={user} 
                      appointments={appointments} 
                      patients={patients} 
                      doctors={doctorsList} 
                      onAddAppointment={handleAddAppointment} 
                      onUpdateAppointmentStatus={handleUpdateAppointmentStatus} 
                    />
                  )}

                  {currentHash.startsWith("#/prontuarios") && (
                    <ProntuariosView 
                      user={user} 
                      medicalRecords={medicalRecords} 
                      patients={patients} 
                      appointments={appointments} 
                      onAddMedicalRecord={handleAddMedicalRecord} 
                    />
                  )}

                  {currentHash.startsWith("#/financeiro") && (
                    <FinanceiroView 
                      user={user} 
                      payments={payments} 
                      patients={patients} 
                      appointments={appointments} 
                      onAddPayment={handleAddPayment} 
                      onUpdatePaymentStatus={handleUpdatePaymentStatus} 
                    />
                  )}

                  {currentHash.startsWith("#/planos") && (
                    <PlanosView 
                      user={user} 
                      clinic={clinic} 
                      onCheckout={handleCheckout} 
                      onManagePortal={handleManagePortal} 
                    />
                  )}

                  {currentHash.startsWith("#/configuracoes") && (
                    <ConfiguracoesView 
                      user={user} 
                      clinic={clinic} 
                      clinicMembers={teamMembers} 
                      onUpdateClinic={handleUpdateClinic} 
                      onAddClinicMember={handleAddClinicMember} 
                      onToggleMemberActive={handleToggleMemberActive} 
                    />
                  )}

                  {currentHash.startsWith("#/admin-global") && (
                    <AdminGlobalView 
                      user={user} 
                      clinics={globalClinics} 
                      onTriggerWebhook={handleTriggerWebhook} 
                      onUpdateClinicPlan={handleUpdateClinicPlan} 
                    />
                  )}

                  {currentHash.startsWith("#/success") && (
                    <SuccessView onRefreshClinic={handleRefreshClinic} />
                  )}

                  {currentHash.startsWith("#/cancel") && (
                    <CancelView />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
