import React, { useState, useEffect } from "react";
import { User, Clinic, Appointment, MedicalRecord } from "../types";
import { apiService } from "../utils/api";
import { 
  Calendar, Clock, User as UserIcon, LogOut, FileText, CheckCircle, 
  AlertCircle, Plus, CalendarDays, Loader2, ArrowRight, Printer, Download, X
} from "lucide-react";

interface PatientViewProps {
  user: User;
  clinic: Clinic | null;
  appointments: Appointment[];
  medicalRecords?: MedicalRecord[];
  onLogout: () => void;
  onLoadAppointments: () => void;
}

export function PatientView({ user, clinic, appointments, medicalRecords, onLogout, onLoadAppointments }: PatientViewProps) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Document print state
  const [printingDoc, setPrintingDoc] = useState<{
    type: "atestado" | "receita" | "exame";
    record: MedicalRecord;
  } | null>(null);

  // Booking Form States
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");

  // Loaded appointments of THIS patient specifically
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    loadDoctors();
    loadPatientAppointments();
  }, [user.clinicId]);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const res = await apiService.getTeamMembers(user.clinicId);
      // Filter only doctors
      const docs = res.results.filter(m => m.role === "doctor" && m.isActive);
      setDoctors(docs);
      if (docs.length > 0) {
        setSelectedDoctorId(docs[0].objectId);
      }
    } catch (err: any) {
      console.error("Erro ao carregar médicos:", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadPatientAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await apiService.getAppointments(user.clinicId, user.objectId);
      setMyAppointments(res.results);
    } catch (err: any) {
      console.error("Erro ao carregar consultas:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Generate 30-minute time slots between 08:00 and 18:00
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = 8;
    let currentMin = 0;

    while (currentHour < 18) {
      const hrStr = currentHour.toString().padStart(2, "0");
      const minStr = currentMin.toString().padStart(2, "0");
      slots.push(`${hrStr}:${minStr}`);

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Helper: Get weekday name from index
  const getWeekdayName = (dayIdx: number) => {
    const weekdaysNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return weekdaysNames[dayIdx];
  };

  // Get active doctor schedule rules
  const selectedDoctor = doctors.find(d => d.objectId === selectedDoctorId);

  // Validate if a slot is available
  const getSlotStatus = (time: string) => {
    if (!selectedDate || !selectedDoctor) return { available: true, reason: "" };

    // 1. Check doctor's work days
    const dateObj = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = dateObj.getDay(); // 0-6

    if (selectedDoctor.workDays && Array.isArray(selectedDoctor.workDays)) {
      if (!selectedDoctor.workDays.includes(dayOfWeek)) {
        return { 
          available: false, 
          reason: `Não atende em ${getWeekdayName(dayOfWeek)}s` 
        };
      }
    }

    // 2. Check doctor's work hours
    if (selectedDoctor.workStartHour && selectedDoctor.workEndHour) {
      if (time < selectedDoctor.workStartHour || time >= selectedDoctor.workEndHour) {
        return { 
          available: false, 
          reason: "Fora do horário" 
        };
      }
    }

    // 3. Check for existing appointments overlapping this 30-min slot
    // Calculate slot end time (add 30 mins)
    const [h, m] = time.split(":").map(Number);
    let eh = h;
    let em = m + 30;
    if (em >= 60) {
      em = 0;
      eh += 1;
    }
    const endTime = `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;

    // Compare with appointments loaded for this clinic
    // (We also check local myAppointments and global clinic schedule if possible, but let's check against ALL bookings)
    // Wait, let's check if there's any appointment for this doctor on this day overlapping
    // Since we don't have all doctor appointments loaded client-side (as we are a patient), we will rely on the backend check.
    // However, to make client experience amazing, let's also mark locally known conflicts:
    const localConflict = appointments.some(a => {
      return (
        a.professionalId === selectedDoctorId &&
        a.date === selectedDate &&
        a.status !== "canceled" &&
        (
          (time >= a.startTime && time < a.endTime) ||
          (endTime > a.startTime && endTime <= a.endTime)
        )
      );
    });

    if (localConflict) {
      return { available: false, reason: "Horário reservado" };
    }

    return { available: true, reason: "" };
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedDoctorId || !selectedDate || !selectedTime || !reason.trim()) {
      setErrorMsg("Por favor, preencha todos os campos e selecione um horário.");
      return;
    }

    // Calculate end time (30 mins duration)
    const [h, m] = selectedTime.split(":").map(Number);
    let eh = h;
    let em = m + 30;
    if (em >= 60) {
      em = 0;
      eh += 1;
    }
    const endTime = `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;

    setBookingLoading(true);
    try {
      await apiService.createAppointment({
        clinicId: user.clinicId,
        patientId: user.objectId,
        professionalId: selectedDoctorId,
        date: selectedDate,
        startTime: selectedTime,
        endTime: endTime,
        status: "scheduled",
        reason: reason,
        createdBy: user.objectId
      });

      setSuccessMsg("Sua consulta foi agendada com sucesso!");
      setReason("");
      setSelectedTime("");
      // Reload both patient and global lists
      loadPatientAppointments();
      onLoadAppointments();
    } catch (err: any) {
      setErrorMsg(err.message || "Não foi possível agendar. Verifique os conflitos.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;

    try {
      await apiService.updateAppointment(apptId, { status: "canceled" });
      setSuccessMsg("Consulta cancelada com sucesso.");
      loadPatientAppointments();
      onLoadAppointments();
    } catch (err: any) {
      alert("Erro ao cancelar consulta: " + err.message);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-sky-50 text-sky-600 border-sky-100";
      case "confirmed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "attended": return "bg-slate-50 text-slate-600 border-slate-100";
      case "canceled": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled": return "Agendado";
      case "confirmed": return "Confirmado";
      case "attended": return "Atendido";
      case "canceled": return "Cancelado";
      default: return status;
    }
  };

  // Filter medical records belonging to this patient that contain at least one document
  const myRecords = (medicalRecords || []).filter(
    (r) => r.patientId === user.objectId && (r.prescription || r.exams || r.certificate)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Patient Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">Portal do Paciente</h1>
            <p className="text-xs text-slate-400 font-medium">{clinic?.name || "ClinicFlow"}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user.fullName || user.email || "Paciente"}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user.email}</p>
          </div>
          <button 
            id="patient-logout"
            onClick={onLogout}
            className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair do Portal</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Side: Appointment List */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Minhas Consultas</h2>
              </div>
              <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] px-2.5 py-1 rounded-full">
                {myAppointments.length} consulta(s)
              </span>
            </div>

            {loadingAppointments ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs">Carregando histórico de consultas...</p>
              </div>
            ) : myAppointments.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Nenhuma consulta agendada</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Use o formulário ao lado para agendar um horário com nossos profissionais de forma rápida e segura.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAppointments.map((appt) => {
                  const formattedDate = new Date(appt.date + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  });

                  return (
                    <div key={appt.objectId} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all space-y-3.5 relative overflow-hidden group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold capitalize">{formattedDate}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-extrabold text-slate-700">{appt.startTime} - {appt.endTime}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(appt.status)}`}>
                          {getStatusLabel(appt.status)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                            🩺
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Profissional</p>
                            <p className="text-xs font-bold text-slate-700">{appt.professional?.fullName || "Profissional Geral"}</p>
                          </div>
                        </div>

                        <div className="max-w-xs text-right sm:text-left">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Motivo</p>
                          <p className="text-xs text-slate-600 font-medium truncate">{appt.reason}</p>
                        </div>
                      </div>

                      {appt.status === "scheduled" && (
                        <div className="absolute right-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleCancelAppointment(appt.objectId)}
                            className="text-[10px] font-extrabold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Clinical Documents */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Meus Documentos Clínicos</h2>
              </div>
              <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] px-2.5 py-1 rounded-full">
                {myRecords.length} registro(s)
              </span>
            </div>

            {myRecords.length === 0 ? (
              <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500">Nenhum documento disponível</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Suas receitas de remédios, atestados médicos e solicitações de exames emitidos pelo médico aparecerão aqui para download em PDF.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRecords.map((rec) => {
                  const formattedDate = new Date(rec.createdAt).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  });

                  return (
                    <div key={rec.objectId} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-250 transition-all space-y-3.5 relative overflow-hidden group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold capitalize">{formattedDate}</p>
                          <p className="text-xs font-extrabold text-slate-800">Atendimento Médico Integrado</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profissional: <span className="text-slate-700">Dr(a). {rec.professional?.fullName || "Profissional da Saúde"}</span></p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                        {rec.prescription && (
                          <button
                            type="button"
                            onClick={() => setPrintingDoc({ type: "receita", record: rec })}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg border border-emerald-150 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Visualizar Receita</span>
                          </button>
                        )}
                        {rec.exams && (
                          <button
                            type="button"
                            onClick={() => setPrintingDoc({ type: "exame", record: rec })}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold rounded-lg border border-amber-150 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Solicitação de Exame</span>
                          </button>
                        )}
                        {rec.certificate && (
                          <button
                            type="button"
                            onClick={() => setPrintingDoc({ type: "atestado", record: rec })}
                            className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-bold rounded-lg border border-sky-150 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Atestado Médico</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Appointment Booking Form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2.5 mb-5 border-b border-slate-100 pb-4">
              <Plus className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Agendar Consulta</h2>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-start gap-2.5 mb-4 font-medium animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-start gap-2.5 mb-4 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {loadingDoctors ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* 1. Select Doctor */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Escolha o Profissional *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => {
                        setSelectedDoctorId(e.target.value);
                        setSelectedTime("");
                        setErrorMsg("");
                      }}
                      required
                      className="w-full bg-slate-50 pl-10 pr-3 py-3 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 transition-all cursor-pointer"
                    >
                      {doctors.map(doc => (
                        <option key={doc.objectId} value={doc.objectId}>
                          {doc.fullName} ({doc.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedDoctor && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      📅 Atendimento: <span className="text-slate-600">
                        {selectedDoctor.workDays ? selectedDoctor.workDays.map(getWeekdayName).join(", ") : "Segunda a Sexta"}
                      </span>
                      <br />
                      ⏰ Horário: <span className="text-slate-600">
                        {selectedDoctor.workStartHour || "08:00"} às {selectedDoctor.workEndHour || "18:00"}
                      </span>
                    </p>
                  )}
                </div>

                {/* 2. Select Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Data Desejada *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                      setErrorMsg("");
                    }}
                    className="w-full bg-slate-50 px-3.5 py-3 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 transition-all"
                  />
                </div>

                {/* 3. Choose Time Slot */}
                {selectedDate && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Horários Disponíveis *</label>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      {timeSlots.map((time) => {
                        const status = getSlotStatus(time);
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={!status.available}
                            onClick={() => setSelectedTime(time)}
                            title={status.reason || "Disponível"}
                            className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer relative ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm scale-105"
                                : status.available
                                ? "bg-white border-slate-150 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/20"
                                : "bg-slate-100/50 border-slate-100 text-slate-350 cursor-not-allowed opacity-40 line-through"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Reason for appointment */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sintomas / Motivo da Consulta *</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Ex: Dor de cabeça recorrente há 3 dias..."
                      rows={3}
                      className="w-full bg-slate-50 pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Agendando...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar Agendamento</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      {/* PRINT DIALOG OVERLAY */}
      {printingDoc && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 no-print overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            {/* Header for preview modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between no-print">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Visualização do Documento Clínico</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingDoc(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="p-8 bg-slate-100 max-h-[70vh] overflow-y-auto flex justify-center no-print">
              {/* Paper Layout */}
              <div className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-md border border-slate-200 text-slate-800 text-xs font-serif leading-relaxed printable-document">
                {/* Clinic Header */}
                <div className="flex flex-col items-center text-center border-b-2 border-emerald-500 pb-5 mb-8">
                  <span className="text-xl font-bold tracking-tight text-slate-950 font-sans uppercase">
                    ⚕️ {clinic?.name || "Clínica Integrada"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-widest mt-1">
                    {clinic?.address || "Centro Médico e Diagnósticos"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-sans font-medium">
                    Contato: {clinic?.phone || "Não informado"} | Email: {clinic?.email || "Não informado"}
                  </p>
                </div>

                {/* Title */}
                <h2 className="text-center text-sm font-sans font-black tracking-widest text-slate-900 uppercase border-b border-slate-200 pb-2 mb-8">
                  {printingDoc.type === "receita" && "RECEITUÁRIO MÉDICO"}
                  {printingDoc.type === "atestado" && "ATESTADO MÉDICO"}
                  {printingDoc.type === "exame" && "SOLICITAÇÃO DE EXAMES"}
                </h2>

                {/* Patient Section */}
                <div className="mb-8 border border-slate-150 p-4 rounded-xl font-sans bg-slate-50/50">
                  <table className="w-full text-left text-[11px]">
                    <tbody>
                      <tr>
                        <td className="font-bold text-slate-400 uppercase w-20 py-0.5">Paciente:</td>
                        <td className="font-black text-slate-900 py-0.5">{printingDoc.record.patient?.fullName || user.fullName}</td>
                      </tr>
                      {printingDoc.record.patient?.cpf && (
                        <tr>
                          <td className="font-bold text-slate-400 uppercase py-0.5">CPF:</td>
                          <td className="font-bold text-slate-700 py-0.5">{printingDoc.record.patient.cpf}</td>
                        </tr>
                      )}
                      {printingDoc.record.patient?.birthDate && (
                        <tr>
                          <td className="font-bold text-slate-400 uppercase py-0.5">Data Nasc:</td>
                          <td className="font-bold text-slate-700 py-0.5">
                            {new Date(printingDoc.record.patient.birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Main Content */}
                <div className="min-h-[350px] text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-wrap px-2 text-justify">
                  {printingDoc.type === "receita" && printingDoc.record.prescription}
                  {printingDoc.type === "atestado" && printingDoc.record.certificate}
                  {printingDoc.type === "exame" && printingDoc.record.exams}
                </div>

                {/* Date & Signature section */}
                <div className="mt-16 pt-8 border-t border-slate-150 flex flex-col items-center text-center font-sans">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-12">
                    Emitido em: {new Date(printingDoc.record.createdAt).toLocaleDateString("pt-BR", { dateStyle: "long" })}
                  </p>
                  
                  <div className="w-64 border-b border-slate-350 mb-1.5"></div>
                  <p className="text-xs font-black text-slate-900 font-sans">Dr(a). {printingDoc.record.professional?.fullName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    CRM: {printingDoc.record.professional?.crm || "Não informado"} {printingDoc.record.professional?.specialty && `| ${printingDoc.record.professional.specialty}`}
                  </p>
                </div>

                {/* Footer with legal info */}
                <div className="absolute bottom-8 left-12 right-12 text-center text-[8px] text-slate-400 font-sans font-semibold uppercase tracking-wider border-t border-slate-100 pt-2 no-print">
                  Este documento foi assinado eletronicamente e possui validade jurídica nacional.
                </div>
              </div>
            </div>

            {/* Bottom Actions for Preview Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-end gap-3 no-print">
              <button
                type="button"
                onClick={() => setPrintingDoc(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Baixar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
