import React, { useState } from "react";
import { Settings, ShieldAlert, Check, X, UserPlus, Users, Building, Phone, Mail, MapPin, Clipboard } from "lucide-react";
import { User, Clinic } from "../types";

interface ConfiguracoesViewProps {
  user: User;
  clinic: Clinic | null;
  clinicMembers: User[];
  onUpdateClinic: (updatedFields: Partial<Clinic>) => void;
  onAddClinicMember: (memberData: {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    isActive: boolean;
    clinic?: Clinic | null;
    password?: string;
    workDays?: number[];
    workStartHour?: string;
    workEndHour?: string;
    crm?: string;
    specialty?: string;
  }) => void;
  onToggleMemberActive: (memberId: string, isActive: boolean) => void;
}

export function ConfiguracoesView({ 
  user, 
  clinic, 
  clinicMembers, 
  onUpdateClinic, 
  onAddClinicMember, 
  onToggleMemberActive 
}: ConfiguracoesViewProps) {
  
  // Defensive check: only owner or admin can render this view.
  const isOwnerOrAdmin = user.role === "clinic_owner" || user.role === "admin";
  
  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Acesso Restrito</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Você não possui permissão para visualizar as configurações da clínica. Esta área é exclusiva para proprietários e gestores autorizados.
        </p>
        <a href="#/dashboard" className="inline-block px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
          Voltar ao Dashboard
        </a>
      </div>
    );
  }

  // Clinic fields
  const [clinicName, setClinicName] = useState(clinic?.name || "");
  const [clinicDoc, setClinicDoc] = useState(clinic?.document || "");
  const [clinicPhone, setClinicPhone] = useState(clinic?.phone || "");
  const [clinicEmail, setClinicEmail] = useState(clinic?.email || "");
  const [clinicAddress, setClinicAddress] = useState(clinic?.address || "");

  // Member form fields
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState("doctor");
  const [memberCrm, setMemberCrm] = useState("");
  const [memberSpecialty, setMemberSpecialty] = useState("");

  // New states for doctor custom schedules
  const [memberWorkDays, setMemberWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [memberStartHour, setMemberStartHour] = useState("08:00");
  const [memberEndHour, setMemberEndHour] = useState("18:00");

  const handleUpdateClinicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinic({
      name: clinicName,
      document: clinicDoc,
      phone: clinicPhone,
      email: clinicEmail,
      address: clinicAddress
    });
    alert("Dados da clínica atualizados com sucesso!");
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberEmail || !memberPassword) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    onAddClinicMember({
      username: memberEmail,
      email: memberEmail,
      fullName: memberName,
      phone: memberPhone,
      role: memberRole,
      isActive: true,
      password: memberPassword,
      workDays: memberWorkDays,
      workStartHour: memberStartHour,
      workEndHour: memberEndHour,
      crm: memberRole === "doctor" ? memberCrm : undefined,
      specialty: memberRole === "doctor" ? memberSpecialty : undefined
    });

    // Reset member fields
    setMemberName("");
    setMemberEmail("");
    setMemberPassword("");
    setMemberPhone("");
    setMemberRole("doctor");
    setMemberCrm("");
    setMemberSpecialty("");
    setMemberWorkDays([1, 2, 3, 4, 5]);
    setMemberStartHour("08:00");
    setMemberEndHour("18:00");
    setIsAddingMember(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configurações do Sistema</h2>
        <p className="text-xs text-slate-500">Ajuste os dados de cadastro da sua clínica e gerencie as permissões dos membros da equipe.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Clinic Info form */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-500" />
            <span>Dados da Clínica</span>
          </h3>

          <form onSubmit={handleUpdateClinicSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Fantasia *</label>
              <input 
                type="text" 
                required 
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Documento (CNPJ / CPF)</label>
                <input 
                  type="text" 
                  value={clinicDoc}
                  onChange={(e) => setClinicDoc(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Telefone de Contato</label>
                <input 
                  type="text" 
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">E-mail Administrativo</label>
              <input 
                type="email" 
                value={clinicEmail}
                onChange={(e) => setClinicEmail(e.target.value)}
                placeholder="adm@clinica.com"
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Endereço Físico</label>
              <input 
                type="text" 
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - UF"
                className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button 
              id="btn-save-clinic-details"
              type="submit"
              className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Clinic Members List */}
        <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Profissionais e Equipe</span>
              </h3>
              <button 
                id="btn-add-member-toggle"
                onClick={() => setIsAddingMember(true)}
                className="text-emerald-600 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar Membro</span>
              </button>
            </div>

            <div className="divide-y divide-slate-50 max-h-[350px] overflow-y-auto pr-1">
              {clinicMembers.map((member) => (
                <div key={member.objectId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {(member.fullName || member.email || "CF").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-800">{member.fullName || member.email || "Membro sem Nome"}</p>
                        {member.role === "doctor" && member.specialty && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold border border-emerald-100">
                            {member.specialty}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {member.role === "doctor" ? (
                          <span>Médico {member.crm ? `(CRM: ${member.crm})` : ""}</span>
                        ) : member.role === "receptionist" ? (
                          "Recepção"
                        ) : (
                          "Gestor / Admin"
                        )} • {member.email}
                      </p>
                    </div>
                  </div>

                  <button 
                    id={`btn-toggle-active-${member.objectId}`}
                    onClick={() => onToggleMemberActive(member.objectId, !member.isActive)}
                    className={`px-2 py-1 text-[9px] font-bold uppercase rounded-full transition-all cursor-pointer ${
                      member.isActive 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {member.isActive ? "Ativo" : "Bloqueado"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Clinic Member */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Membro à Equipe</h3>
              <button 
                id="btn-close-member-modal"
                onClick={() => setIsAddingMember(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    required 
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Ex: Dr. Carlos Silva"
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">E-mail de Login *</label>
                  <input 
                    type="email" 
                    required 
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="carlos@clinica.com"
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Senha Provisória *</label>
                  <input 
                    type="password" 
                    required 
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="Defina uma senha"
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Celular / Telefone</label>
                    <input 
                      type="text" 
                      value={memberPhone}
                      onChange={(e) => setMemberPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Função / Cargo</label>
                    <select 
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    >
                      <option value="doctor">Médico / Especialista</option>
                      <option value="receptionist">Recepcionista</option>
                      <option value="clinic_owner">Gestor / Dono da Clínica</option>
                    </select>
                  </div>
                </div>

                {memberRole === "doctor" && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dados Profissionais do Médico</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CRM *</label>
                        <input
                          type="text"
                          required
                          value={memberCrm}
                          onChange={(e) => setMemberCrm(e.target.value)}
                          placeholder="Ex: 123456-SP"
                          className="w-full bg-white px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Especialidade *</label>
                        <input
                          type="text"
                          required
                          value={memberSpecialty}
                          onChange={(e) => setMemberSpecialty(e.target.value)}
                          placeholder="Ex: Cardiologista"
                          className="w-full bg-white px-2 py-1.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1 border-t border-slate-100">Escala de Trabalho do Médico</p>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dias de Atendimento</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: 1, lbl: "Seg" },
                          { val: 2, lbl: "Ter" },
                          { val: 3, lbl: "Qua" },
                          { val: 4, lbl: "Qui" },
                          { val: 5, lbl: "Sex" },
                          { val: 6, lbl: "Sáb" },
                          { val: 0, lbl: "Dom" }
                        ].map(day => {
                          const checked = memberWorkDays.includes(day.val);
                          return (
                            <button
                              key={day.val}
                              type="button"
                              onClick={() => {
                                if (checked) {
                                  setMemberWorkDays(memberWorkDays.filter(d => d !== day.val));
                                } else {
                                  setMemberWorkDays([...memberWorkDays, day.val]);
                                }
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                checked 
                                  ? "bg-emerald-500 text-white border-emerald-500" 
                                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {day.lbl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Início</label>
                        <input
                          type="time"
                          value={memberStartHour}
                          onChange={(e) => setMemberStartHour(e.target.value)}
                          className="w-full bg-white px-2 py-1 text-xs rounded border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Término</label>
                        <input
                          type="time"
                          value={memberEndHour}
                          onChange={(e) => setMemberEndHour(e.target.value)}
                          className="w-full bg-white px-2 py-1 text-xs rounded border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddingMember(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Adicionar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
