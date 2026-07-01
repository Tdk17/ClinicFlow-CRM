import React, { useState } from "react";
import { Calendar, Search, Plus, Clock, User, Clipboard, Check, X, Filter, AlertTriangle } from "lucide-react";
import { Appointment, Patient, User as UserType } from "../types";

interface AgendaViewProps {
  user: UserType;
  appointments: Appointment[];
  patients: Patient[];
  doctors: UserType[];
  onAddAppointment: (appointmentData: {
    patient: Patient;
    professional: UserType;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    reason: string;
    notes: string;
  }) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: string) => void;
}

export function AgendaView({ user, appointments, patients, doctors, onAddAppointment, onUpdateAppointmentStatus }: AgendaViewProps) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterProfessional, setFilterProfessional] = useState("all");
  const [isScheduling, setIsScheduling] = useState(false);

  // Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [apptDate, setApptDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [apptDuration, setApptDuration] = useState("30"); // "30", "40", "60", "custom"
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const addMinutesToTime = (timeStr: string, minsToAdd: number): string => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const totalMins = h * 60 + m + minsToAdd;
    const newH = Math.floor(totalMins / 60) % 24;
    const newM = totalMins % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    if (apptDuration !== "custom") {
      setEndTime(addMinutesToTime(val, Number(apptDuration)));
    }
  };

  const handleDurationChange = (val: string) => {
    setApptDuration(val);
    if (val !== "custom") {
      setEndTime(addMinutesToTime(startTime, Number(val)));
    }
  };

  const activePatients = patients.filter(p => p.status === "active");

  const filteredAppointments = appointments.filter(appt => {
    const matchesDate = appt.date === filterDate;
    const matchesProf = filterProfessional === "all" || appt.professional?.objectId === filterProfessional;
    return matchesDate && matchesProf;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !apptDate || !startTime || !endTime) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);

    if (endMins <= startMins) {
      alert("O horário de término deve ser posterior ao horário de início.");
      return;
    }

    const durationMins = endMins - startMins;
    if (durationMins < 30) {
      alert("A consulta deve ter uma duração mínima de 30 minutos para garantir o tempo adequado de atendimento e evitar atrasos.");
      return;
    }

    // Check conflicts/overlaps with existing non-canceled appointments on same day for same professional
    const hasConflict = appointments.some(appt => {
      if (appt.status === "canceled") return false;
      if (appt.date !== apptDate) return false;
      if (appt.professional?.objectId !== selectedDoctorId) return false;

      const aStart = toMinutes(appt.startTime);
      const aEnd = toMinutes(appt.endTime);

      // Overlap occurs if: start1 < end2 AND start2 < end1
      return startMins < aEnd && aStart < endMins;
    });

    if (hasConflict) {
      alert("Atenção: Este profissional já possui uma consulta agendada que coincide ou conflita com o horário selecionado. Mantenha um intervalo de pelo menos 30 a 40 minutos entre cada início.");
      return;
    }

    const patient = patients.find(p => p.objectId === selectedPatientId);
    const professional = doctors.find(d => d.objectId === selectedDoctorId);

    if (!patient || !professional) return;

    onAddAppointment({
      patient,
      professional,
      date: apptDate,
      startTime,
      endTime,
      status: "scheduled",
      reason,
      notes
    });

    // Reset fields
    setSelectedPatientId("");
    setSelectedDoctorId("");
    setReason("");
    setNotes("");
    setIsScheduling(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agenda Médica</h2>
          <p className="text-xs text-slate-500">Agende e gerencie os horários de atendimento da clínica.</p>
        </div>
        <button 
          id="btn-schedule-toggle"
          onClick={() => setIsScheduling(true)}
          className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Filters Panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        {/* Date Selector */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filtrar por Data</label>
          <input 
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full sm:w-48 bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-700"
          />
        </div>

        {/* Doctor Selector */}
        <div className="w-full sm:w-auto flex-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filtrar Profissional</label>
          <select 
            id="filter-professional"
            value={filterProfessional}
            onChange={(e) => setFilterProfessional(e.target.value)}
            className="w-full bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-700"
          >
            <option value="all">Todos os Profissionais</option>
            {doctors.map(doc => (
              <option key={doc.objectId} value={doc.objectId}>
                {doc.fullName} ({doc.role === "doctor" ? `Médico${doc.specialty ? ` - ${doc.specialty}` : ""}` : doc.role})
              </option>
            ))}
          </select>
        </div>

        {/* Calendar Nav Quick Actions */}
        <div className="flex items-center gap-2 self-end w-full sm:w-auto">
          <button 
            id="btn-agenda-today"
            onClick={() => setFilterDate(new Date().toISOString().split("T")[0])}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Hoje
          </button>
          <button 
            id="btn-agenda-tomorrow"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setFilterDate(tomorrow.toISOString().split("T")[0]);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Amanhã
          </button>
        </div>
      </div>

      {/* Appointment Cards and Timeline Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>Agenda para o dia {new Date(filterDate).toLocaleDateString("pt-BR", { timeZone: "UTC", dateStyle: "long" })}</span>
        </h3>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium border border-dashed border-slate-100 rounded-xl">
              Nenhuma consulta agendada para este dia ou profissional.
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const statusColors: any = {
                scheduled: "bg-blue-50 text-blue-700 border-blue-100",
                confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
                attended: "bg-slate-100 text-slate-700 border-slate-200",
                canceled: "bg-rose-50 text-rose-700 border-rose-100",
                no_show: "bg-amber-50 text-amber-700 border-amber-100"
              };

              const labelMap: any = {
                scheduled: "Agendado",
                confirmed: "Confirmado",
                attended: "Atendido",
                canceled: "Cancelado",
                no_show: "Faltou"
              };

              return (
                <div key={appt.objectId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-700 mt-0.5">{appt.startTime}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{appt.patient?.fullName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Profissional: {appt.professional?.fullName}{appt.professional?.role === "doctor" ? ` (Médico${appt.professional.specialty ? ` - ${appt.professional.specialty}` : ""}${appt.professional.crm ? `, CRM: ${appt.professional.crm}` : ""})` : ""}</span>
                        {appt.reason && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span>Motivo: {appt.reason}</span>
                          </>
                        )}
                      </p>
                      {appt.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1 bg-white px-2 py-1 rounded-md border border-slate-100 max-w-xl">
                          Nota: {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`px-2.5 py-0.5 text-[10px] border font-bold rounded-full uppercase tracking-wider ${statusColors[appt.status]}`}>
                      {labelMap[appt.status]}
                    </span>

                    {/* Quick State Update triggers */}
                    {appt.status !== "attended" && appt.status !== "canceled" && (
                      <div className="flex items-center gap-1">
                        {appt.status === "scheduled" && (
                          <button 
                            id={`btn-confirm-${appt.objectId}`}
                            onClick={() => onUpdateAppointmentStatus(appt.objectId, "confirmed")}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                          >
                            Confirmar
                          </button>
                        )}
                        {appt.status === "confirmed" && (
                          <button 
                            id={`btn-attend-${appt.objectId}`}
                            onClick={() => onUpdateAppointmentStatus(appt.objectId, "attended")}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                          >
                            Atender
                          </button>
                        )}
                        <button 
                          id={`btn-noshow-${appt.objectId}`}
                          onClick={() => onUpdateAppointmentStatus(appt.objectId, "no_show")}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                        >
                          Faltou
                        </button>
                        <button 
                          id={`btn-cancel-${appt.objectId}`}
                          onClick={() => onUpdateAppointmentStatus(appt.objectId, "canceled")}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer uppercase"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: New Appointment Form */}
      {isScheduling && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Agendar Consulta</h3>
              <button 
                id="btn-close-schedule-modal"
                onClick={() => setIsScheduling(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Patient selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Paciente *</label>
                  <select 
                    required 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  >
                    <option value="">Selecione o Paciente...</option>
                    {activePatients.map(p => (
                      <option key={p.objectId} value={p.objectId}>{p.fullName} (CPF: {p.cpf || "não informado"})</option>
                    ))}
                  </select>
                </div>

                {/* Professional selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Profissional / Médico *</label>
                  <select 
                    required 
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                  >
                    <option value="">Selecione o Profissional...</option>
                    {doctors.map(d => (
                      <option key={d.objectId} value={d.objectId}>
                        {d.fullName} ({d.role === "doctor" ? `Médico${d.specialty ? ` - ${d.specialty}` : ""}${d.crm ? ` (CRM: ${d.crm})` : ""}` : d.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration of Consultation selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Duração do Atendimento *</label>
                  <select 
                    value={apptDuration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-700"
                  >
                    <option value="30">30 minutos (Recomendado)</option>
                    <option value="40">40 minutos</option>
                    <option value="60">1 hora (60 minutos)</option>
                    <option value="custom">Personalizado (Digitar Horário Fim)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Garante um intervalo protetivo de 30 a 40 minutos para evitar consultas sobrepostas.</p>
                </div>

                {/* Date & Time fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data *</label>
                    <input 
                      type="date" 
                      required 
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Horário Início *</label>
                    <input 
                      type="time" 
                      required 
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Horário Fim *</label>
                    <input 
                      type="time" 
                      required 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={apptDuration !== "custom"}
                      className={`w-full px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white ${
                        apptDuration !== "custom" ? "bg-slate-100 text-slate-500 cursor-not-allowed font-medium" : "bg-slate-50"
                      }`}
                    />
                  </div>
                </div>

                {/* Reason of visit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Motivo do Agendamento</label>
                  <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Consulta Geral, Retorno de Exames, etc"
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observações do Agendamento</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações administrativas ou de atendimento"
                    rows={3}
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsScheduling(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Agendar Consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
