import React, { useState } from "react";
import { Clipboard, Search, Plus, Calendar, User, Eye, X, FileText, Lock, Printer, Download } from "lucide-react";
import { MedicalRecord, Patient, Appointment, User as UserType } from "../types";

interface ProntuariosViewProps {
  user: UserType;
  medicalRecords: MedicalRecord[];
  patients: Patient[];
  appointments: Appointment[];
  onAddMedicalRecord: (recordData: {
    patient: Patient;
    professional: UserType;
    appointment: Appointment | null;
    complaint: string;
    diagnosis: string;
    prescription: string;
    exams: string;
    certificate: string;
    observations: string;
    privateNotes: string;
  }) => void;
}

export function ProntuariosView({ user, medicalRecords, patients, appointments, onAddMedicalRecord }: ProntuariosViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  // New Record Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [exams, setExams] = useState("");
  const [certificate, setCertificate] = useState("");
  const [observations, setObservations] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

  // Document print state
  const [printingDoc, setPrintingDoc] = useState<{
    type: "atestado" | "receita" | "exame";
    record: MedicalRecord;
  } | null>(null);

  const filteredRecords = medicalRecords.filter(rec => 
    rec.patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rec.diagnosis && rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (rec.professional?.fullName && rec.professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activePatients = patients.filter(p => p.status === "active");

  const availableAppointments = appointments.filter(appt => 
    appt.patient?.objectId === selectedPatientId && 
    appt.status === "attended"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Por favor, selecione um paciente.");
      return;
    }

    const patient = patients.find(p => p.objectId === selectedPatientId);
    const appointment = appointments.find(a => a.objectId === selectedAppointmentId);

    if (!patient) return;

    onAddMedicalRecord({
      patient,
      professional: user,
      appointment: appointment || null,
      complaint,
      diagnosis,
      prescription,
      exams,
      certificate,
      observations,
      privateNotes
    });

    // Reset Form
    setSelectedPatientId("");
    setSelectedAppointmentId("");
    setComplaint("");
    setDiagnosis("");
    setPrescription("");
    setExams("");
    setCertificate("");
    setObservations("");
    setPrivateNotes("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prontuários Eletrônicos (PEP)</h2>
          <p className="text-xs text-slate-500">Histórico de evoluções, receitas, exames e diagnósticos médicos.</p>
        </div>
        {user.role === "doctor" && (
          <button 
            id="btn-add-record-toggle"
            onClick={() => setIsAdding(true)}
            className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Evoluir Paciente (Novo Registro)</span>
          </button>
        )}
      </div>

      {/* Filter and search row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="search-records"
            type="text"
            placeholder="Buscar por nome do paciente, diagnóstico ou profissional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Exibindo {filteredRecords.length} registros
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4">Data / Hora</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Diagnóstico</th>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum prontuário médico encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.objectId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      {new Date(rec.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC", dateStyle: "short" })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{rec.patient?.fullName}</p>
                      <p className="text-[11px] text-slate-400">CPF: {rec.patient?.cpf || "Não informado"}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {rec.diagnosis || "Evolução de Rotina"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      Dr(a). {rec.professional?.fullName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        id={`btn-view-record-${rec.objectId}`}
                        onClick={() => setSelectedRecord(rec)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir Registro</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: New Medical Record Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Novo Registro de Evolução Médica (PEP)</h3>
              <button 
                id="btn-close-record-modal"
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Paciente *</label>
                    <select 
                      required 
                      value={selectedPatientId}
                      onChange={(e) => {
                        setSelectedPatientId(e.target.value);
                        setSelectedAppointmentId("");
                      }}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    >
                      <option value="">Selecione o Paciente...</option>
                      {activePatients.map(p => (
                        <option key={p.objectId} value={p.objectId}>{p.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Consulta Associada (Opcional)</label>
                    <select 
                      disabled={!selectedPatientId}
                      value={selectedAppointmentId}
                      onChange={(e) => setSelectedAppointmentId(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium disabled:opacity-50"
                    >
                      <option value="">Nenhuma ou Consulta Avulsa</option>
                      {availableAppointments.map(appt => (
                        <option key={appt.objectId} value={appt.objectId}>{new Date(appt.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às {appt.startTime} ({appt.reason})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Queixa Principal / Motivo Clínico *</label>
                    <textarea 
                      required
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="Relato de sintomas e histórico descrito pelo paciente"
                      rows={2}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Diagnóstico Clínico / CID / Hipótese Diagnóstica *</label>
                    <input 
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Diagnóstico do profissional para o caso"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Prescrição Médica (Receituário)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const pName = patients.find(p => p.objectId === selectedPatientId)?.fullName || "Paciente";
                          setPrescription(
                            `Receita para Uso Contínuo / Sintomáticos:\n\n1. Dipirona Monoidratada 500mg/mL ---------------- 1 frasco\n   Tomar 30 gotas via oral de 6 em 6 horas em caso de dor ou febre.\n\n2. Paracetamol 500mg ---------------------------- 1 blister\n   Tomar 1 comprimido de 8 em 8 horas se houver sintomas de mal-estar.`
                          );
                        }}
                        disabled={!selectedPatientId}
                        className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
                      >
                        🪄 Usar Modelo Receita de Rotina
                      </button>
                    </div>
                    <textarea 
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="Medicamentos, dosagens, frequência e período de tratamento"
                      rows={3}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Exames Solicitados</label>
                      <button
                        type="button"
                        onClick={() => {
                          setExams(
                            `Solicito para fins de avaliação clínica os seguintes exames:\n\n- Hemograma completo com plaquetas\n- Glicemia de jejum e Hemoglobina Glicada\n- Perfil lipídico completo (Colesterol Total, LDL, HDL, Triglicerídeos)\n- Creatinina e Ureia (Avaliação renal)\n- TGO e TGP (Função hepática)`
                          );
                        }}
                        disabled={!selectedPatientId}
                        className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded transition-all cursor-pointer disabled:opacity-50"
                      >
                        🪄 Usar Modelo de Exames de Rotina
                      </button>
                    </div>
                    <textarea 
                      value={exams}
                      onChange={(e) => setExams(e.target.value)}
                      placeholder="Exames laboratoriais, de imagem ou especializados solicitados"
                      rows={2}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">Atestado Médico</label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const pName = patients.find(p => p.objectId === selectedPatientId)?.fullName || "Paciente";
                            setCertificate(
                              `Atesto para os devidos fins de direito que o(a) Sr(a). ${pName} esteve sob meus cuidados profissionais na presente data, devendo afastar-se de suas atividades laborativas por um período de _____ (_______) dias, a contar desta data, por motivo de saúde.`
                            );
                          }}
                          disabled={!selectedPatientId}
                          className="text-[9px] font-extrabold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          📋 Afastamento
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pName = patients.find(p => p.objectId === selectedPatientId)?.fullName || "Paciente";
                            setCertificate(
                              `Atesto para os devidos fins que o(a) Sr(a). ${pName} compareceu a esta clínica para consulta médica na data de hoje, no período das ______ às ______, para atendimento de rotina.`
                            );
                          }}
                          disabled={!selectedPatientId}
                          className="text-[9px] font-extrabold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          📋 Comparecimento
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const pName = patients.find(p => p.objectId === selectedPatientId)?.fullName || "Paciente";
                            setCertificate(
                              `Atesto, após avaliação clínica detalhada na presente data, que o(a) Sr(a). ${pName} encontra-se em perfeitas condições de saúde física e mental, estando apto(a) para realizar práticas esportivas e atividades físicas.`
                            );
                          }}
                          disabled={!selectedPatientId}
                          className="text-[9px] font-extrabold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          📋 Aptidão Física
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={certificate}
                      onChange={(e) => setCertificate(e.target.value)}
                      placeholder="Redija o atestado médico aqui ou use um dos modelos rápidos acima."
                      rows={2.5}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Observações Gerais</label>
                    <textarea 
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Qualquer outro detalhe clínico importante"
                      rows={2}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-rose-500 uppercase mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Anotações Particulares do Médico (Confidencial)</span>
                    </label>
                    <textarea 
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      placeholder="Observações pessoais confidenciais do médico, visíveis apenas a ele."
                      rows={2}
                      className="w-full bg-rose-50/20 px-3.5 py-2.5 text-xs rounded-xl border border-rose-100 focus:outline-none focus:border-rose-400 focus:bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Salvar Prontuário (PEP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Medical Record Details */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Registro de Atendimento Médico</span>
              </h3>
              <button 
                id="btn-close-record-view"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Paciente</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRecord.patient?.fullName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Data Atendimento</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {new Date(selectedRecord.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC", dateStyle: "long" })}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Queixa Principal / Histórico</h4>
                  <p className="mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 whitespace-pre-wrap">{selectedRecord.complaint || "Não informado."}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Diagnóstico / CID</h4>
                  <p className="mt-1 leading-relaxed font-bold text-emerald-600 bg-emerald-50/20 p-3 rounded-lg border border-emerald-100/50">{selectedRecord.diagnosis || "Evolução de Rotina."}</p>
                </div>

                {selectedRecord.prescription && (
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Prescrição Médica (Receitas)</h4>
                    <p className="mt-1 leading-relaxed bg-blue-50/10 p-3 rounded-lg border border-blue-100/50 text-blue-800 whitespace-pre-wrap font-medium">{selectedRecord.prescription}</p>
                  </div>
                )}

                {selectedRecord.exams && (
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Exames Solicitados</h4>
                    <p className="mt-1 leading-relaxed bg-amber-50/10 p-3 rounded-lg border border-amber-100/50 text-amber-800 whitespace-pre-wrap">{selectedRecord.exams}</p>
                  </div>
                )}

                {selectedRecord.certificate && (
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Atestado Médico</h4>
                    <p className="mt-1 leading-relaxed bg-slate-50/80 p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap font-medium">{selectedRecord.certificate}</p>
                  </div>
                )}

                {selectedRecord.observations && (
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider">Observações do Profissional</h4>
                    <p className="mt-1 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100/50 whitespace-pre-wrap">{selectedRecord.observations}</p>
                  </div>
                )}

                {/* Print documents section */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[10px] text-slate-400 tracking-wider mb-2">Impressão / Emissão de Documentos</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.prescription && (
                      <button
                        type="button"
                        onClick={() => setPrintingDoc({ type: "receita", record: selectedRecord })}
                        className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg border border-emerald-200/55 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Receituário</span>
                      </button>
                    )}
                    {selectedRecord.exams && (
                      <button
                        type="button"
                        onClick={() => setPrintingDoc({ type: "exame", record: selectedRecord })}
                        className="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold rounded-lg border border-amber-200/55 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Solicitação Exame</span>
                      </button>
                    )}
                    {selectedRecord.certificate && (
                      <button
                        type="button"
                        onClick={() => setPrintingDoc({ type: "atestado", record: selectedRecord })}
                        className="px-3 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-bold rounded-lg border border-sky-200/55 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Atestado Médico</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Show Private Notes ONLY if the current logged-in user is a doctor and was the creator of this record, OR if owner/admin */}
                {selectedRecord.privateNotes && (user.role === "doctor" || user.role === "clinic_owner" || user.role === "admin") && (
                  <div className="bg-rose-50/20 border border-rose-100 p-4 rounded-xl">
                    <h4 className="font-bold text-rose-500 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Notas Médicas Particulares (Confidencial)</span>
                    </h4>
                    <p className="mt-2 text-rose-800 leading-relaxed whitespace-pre-wrap font-medium">{selectedRecord.privateNotes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
                <span>Registro Digital Assinado por</span>
                <span className="text-slate-800">Dr(a). {selectedRecord.professional?.fullName}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button 
                id="btn-close-record-view-footer"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT DIALOG OVERLAY */}
      {printingDoc && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 no-print overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
            {/* Header for preview modal */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between no-print">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Visualização de Impressão ({printingDoc.type})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
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
                    ⚕️ {user.clinic?.name || "Clínica Integrada"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-widest mt-1">
                    {user.clinic?.address || "Centro Médico e Diagnósticos"}
                  </p>
                  <p className="text-[9px] text-slate-400 font-sans font-medium">
                    Contato: {user.clinic?.phone || "Não informado"} | Email: {user.clinic?.email || "Não informado"}
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
                        <td className="font-black text-slate-900 py-0.5">{printingDoc.record.patient?.fullName}</td>
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
                  <p className="text-xs font-black text-slate-900">Dr(a). {printingDoc.record.professional?.fullName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    CRM: {printingDoc.record.professional?.crm || "Não informado"} {printingDoc.record.professional?.specialty && `| ${printingDoc.record.professional.specialty}`}
                  </p>
                </div>

                {/* Footer with legal info */}
                <div className="absolute bottom-8 left-12 right-12 text-center text-[8px] text-slate-400 font-sans font-semibold uppercase tracking-wider border-t border-slate-100 pt-2 no-print">
                  Este documento foi assinado eletronicamente pelo profissional médico registrado acima.
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
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
