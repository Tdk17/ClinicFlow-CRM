import React, { useState } from "react";
import { Users, Search, Plus, UserCheck, Trash, Eye, X, Mail, Phone, MapPin, CalendarDays, Edit3 } from "lucide-react";
import { Patient, User } from "../types";

interface PatientsViewProps {
  user: User;
  patients: Patient[];
  onAddPatient: (patientData: {
    fullName: string;
    cpf: string;
    birthDate: string;
    gender: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    emergencyContact: string;
    notes: string;
    status: "active" | "inactive";
  }) => void;
  onUpdatePatient: (patientId: string, updatedFields: Partial<Patient>) => void;
}

export function PatientsView({ user, patients, onAddPatient, onUpdatePatient }: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  
  // New Patient Form fields
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("Masculino");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [notes, setNotes] = useState("");

  // Edit Patient Form fields
  const [editFullName, setEditFullName] = useState("");
  const [editCpf, setEditCpf] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editGender, setEditGender] = useState("Masculino");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmergencyContact, setEditEmergencyContact] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleStartEdit = (p: Patient) => {
    setEditingPatient(p);
    setEditFullName(p.fullName || "");
    setEditCpf(p.cpf || "");
    setEditBirthDate(p.birthDate || "");
    setEditGender(p.gender || "Masculino");
    setEditPhone(p.phone || "");
    setEditWhatsapp(p.whatsapp || "");
    setEditEmail(p.email || "");
    setEditAddress(p.address || "");
    setEditEmergencyContact(p.emergencyContact || "");
    setEditNotes(p.notes || "");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    onUpdatePatient(editingPatient.objectId, {
      fullName: editFullName,
      cpf: editCpf,
      birthDate: editBirthDate,
      gender: editGender,
      phone: editPhone,
      whatsapp: editWhatsapp,
      email: editEmail,
      address: editAddress,
      emergencyContact: editEmergencyContact,
      notes: editNotes,
    });

    setEditingPatient(null);
  };

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cpf && p.cpf.includes(searchTerm)) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    onAddPatient({
      fullName,
      cpf,
      birthDate,
      gender,
      phone,
      whatsapp,
      email,
      address,
      emergencyContact,
      notes,
      status: "active"
    });

    // Reset Form
    setFullName("");
    setCpf("");
    setBirthDate("");
    setGender("Masculino");
    setPhone("");
    setWhatsapp("");
    setEmail("");
    setAddress("");
    setEmergencyContact("");
    setNotes("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gestão de Pacientes</h2>
          <p className="text-xs text-slate-500">Cadastre, gerencie e visualize o prontuário e ficha dos pacientes.</p>
        </div>
        <button 
          id="btn-add-patient-toggle"
          onClick={() => setIsAdding(true)}
          className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Paciente</span>
        </button>
      </div>

      {/* Filter and search row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="search-patients"
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800 transition-all"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Exibindo {filteredPatients.length} pacientes
        </div>
      </div>

      {/* Patients Grid/List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">CPF / Contato</th>
                <th className="px-6 py-4">Gênero / Idade</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum paciente cadastrado ou encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const age = p.birthDate 
                    ? new Date().getFullYear() - new Date(p.birthDate).getFullYear() 
                    : "Não informado";

                  return (
                    <tr key={p.objectId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">
                            {p.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{p.fullName}</p>
                            <p className="text-[11px] text-slate-400">{p.email || "Sem e-mail"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        <p>{p.cpf || "Sem CPF"}</p>
                        <p className="text-[11px] text-slate-400">{p.phone || p.whatsapp || "Sem telefone"}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        <p>{p.gender}</p>
                        <p className="text-[11px] text-slate-400">{p.birthDate ? `${age} anos` : "Sem nascimento"}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          p.status === "active" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {p.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          id={`btn-view-${p.objectId}`}
                          onClick={() => setViewingPatient(p)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          id={`btn-edit-${p.objectId}`}
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Editar Paciente"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          id={`btn-toggle-status-${p.objectId}`}
                          onClick={() => onUpdatePatient(p.objectId, { status: p.status === "active" ? "inactive" : "active" })}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                          title={p.status === "active" ? "Inativar" : "Ativar"}
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Patient Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Cadastrar Novo Paciente</h3>
              <button 
                id="btn-close-add-modal"
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nome do Paciente"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">CPF</label>
                    <input 
                      type="text" 
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Gênero</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    >
                      <option>Masculino</option>
                      <option>Feminino</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Celular / WhatsApp</label>
                    <input 
                      type="text" 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Telefone Fixo</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(00) 0000-0000"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">E-mail</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="paciente@exemplo.com"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Contato de Emergência</label>
                    <input 
                      type="text" 
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Nome - Parentesco - Telefone"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Histórico de Observações (Notas Clínicas Iniciais)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Alergias, restrições ou observações iniciais"
                      rows={3}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
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
                  Salvar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Patient Details */}
      {viewingPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Ficha Cadastral do Paciente</h3>
              <button 
                id="btn-close-view-modal"
                onClick={() => setViewingPatient(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 font-bold rounded-2xl flex items-center justify-center text-lg">
                  {viewingPatient.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{viewingPatient.fullName}</h4>
                  <span className={`inline-block px-2 py-0.5 mt-1 text-[9px] font-bold uppercase rounded-full tracking-wider ${
                    viewingPatient.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {viewingPatient.status === "active" ? "Cadastro Ativo" : "Cadastro Inativo"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs border-t border-slate-100 pt-5">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">CPF</span>
                  <span className="font-medium text-slate-700">{viewingPatient.cpf || "Não informado"}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data de Nascimento</span>
                  <span className="font-medium text-slate-700">
                    {viewingPatient.birthDate ? new Date(viewingPatient.birthDate).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "Não informada"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gênero</span>
                  <span className="font-medium text-slate-700">{viewingPatient.gender}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contato / WhatsApp</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {viewingPatient.whatsapp || viewingPatient.phone || "Não informado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-mail</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {viewingPatient.email || "Não informado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Endereço</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {viewingPatient.address || "Não informado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contato de Emergência</span>
                  <span className="font-medium text-slate-700 block mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {viewingPatient.emergencyContact || "Não informado"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Histórico de Observações (Notas)</span>
                  <span className="font-medium text-slate-600 block mt-0.5 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {viewingPatient.notes || "Nenhuma nota inserida."}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                id="btn-edit-from-view"
                onClick={() => {
                  const p = viewingPatient;
                  setViewingPatient(null);
                  handleStartEdit(p);
                }}
                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>
              <button 
                id="btn-close-view-modal-footer"
                onClick={() => setViewingPatient(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Patient Form */}
      {editingPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Editar Paciente: {editingPatient.fullName}</h3>
              <button 
                id="btn-close-edit-modal"
                onClick={() => setEditingPatient(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      required 
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Nome do Paciente"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">CPF</label>
                    <input 
                      type="text" 
                      value={editCpf}
                      onChange={(e) => setEditCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Gênero</label>
                    <select 
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    >
                      <option>Masculino</option>
                      <option>Feminino</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Celular / WhatsApp</label>
                    <input 
                      type="text" 
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Telefone Fixo</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="(00) 0000-0000"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">E-mail</label>
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="paciente@exemplo.com"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Endereço Completo</label>
                    <input 
                      type="text" 
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Contato de Emergência</label>
                    <input 
                      type="text" 
                      value={editEmergencyContact}
                      onChange={(e) => setEditEmergencyContact(e.target.value)}
                      placeholder="Nome - Parentesco - Telefone"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Histórico de Observações (Notas Clínicas Iniciais)</label>
                    <textarea 
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Alergias, restrições ou observações iniciais"
                      rows={3}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
