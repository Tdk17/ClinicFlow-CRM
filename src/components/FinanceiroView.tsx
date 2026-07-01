import React, { useState } from "react";
import { DollarSign, Search, Plus, Calendar, ArrowUpRight, ArrowDownRight, CreditCard, Check, X, ShieldAlert } from "lucide-react";
import { Payment, Patient, Appointment, User } from "../types";

interface FinanceiroViewProps {
  user: User;
  payments: Payment[];
  patients: Patient[];
  appointments: Appointment[];
  onAddPayment: (paymentData: {
    patient: Patient;
    appointment: Appointment | null;
    amount: number;
    method: string;
    status: "pending" | "paid" | "canceled";
    dueDate: string;
    paidAt: string | null;
    description: string;
  }) => void;
  onUpdatePaymentStatus: (paymentId: string, status: "pending" | "paid" | "canceled") => void;
}

export function FinanceiroView({ user, payments, patients, appointments, onAddPayment, onUpdatePaymentStatus }: FinanceiroViewProps) {
  // Defensive check: only owner or admin can render this view.
  const isOwnerOrAdmin = user.role === "clinic_owner" || user.role === "admin";
  
  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Acesso Restrito</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Você não possui permissão para visualizar o painel financeiro. Esta área é exclusiva para proprietários e gestores da clínica.
        </p>
        <a href="#/dashboard" className="inline-block px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
          Voltar ao Dashboard
        </a>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAdding, setIsAdding] = useState(false);

  // New Transaction Form Fields
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState("pix");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.patient?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activePatients = patients.filter(pt => pt.status === "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || amount <= 0) {
      alert("Por favor, selecione um paciente e insira um valor válido.");
      return;
    }

    const patient = patients.find(p => p.objectId === selectedPatientId);
    const appointment = appointments.find(a => a.objectId === selectedAppointmentId);

    if (!patient) return;

    onAddPayment({
      patient,
      appointment: appointment || null,
      amount,
      method,
      status: "pending",
      dueDate,
      paidAt: null,
      description: description || `Consulta com ${patient.fullName}`
    });

    // Reset Form
    setSelectedPatientId("");
    setSelectedAppointmentId("");
    setAmount(0);
    setMethod("pix");
    setDueDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setIsAdding(false);
  };

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Painel Financeiro</h2>
          <p className="text-xs text-slate-500">Monitore lançamentos, receitas de atendimentos e status de pagamentos.</p>
        </div>
        <button 
          id="btn-add-transaction-toggle"
          onClick={() => setIsAdding(true)}
          className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Receita</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Recebido (Mês)</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Previsão Pendente</p>
            <h3 className="text-2xl font-bold text-rose-500 mt-1 font-mono">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 font-mono">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and search row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="search-transactions"
            type="text"
            placeholder="Buscar por nome do paciente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800 transition-all"
          />
        </div>

        <div className="w-full sm:w-48">
          <select 
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 px-3 py-2 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-700"
          >
            <option value="all">Todos os Status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4">Paciente / Descrição</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Nenhum registro financeiro encontrado.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  return (
                    <tr key={p.objectId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{p.patient?.fullName}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.description}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-500">
                        {new Date(p.dueDate).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                      </td>
                      <td className="px-6 py-4 font-medium uppercase text-slate-600">
                        {p.method}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        R$ {p.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] border font-bold rounded-full uppercase tracking-wider ${
                          p.status === "paid" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : p.status === "pending"
                            ? "bg-rose-50 text-rose-700 border border-rose-100 font-mono"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                          {p.status === "paid" ? "Pago" : p.status === "pending" ? "Aberto" : "Cancelado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              id={`btn-pay-${p.objectId}`}
                              onClick={() => onUpdatePaymentStatus(p.objectId, "paid")}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-0.5 uppercase"
                            >
                              <Check className="w-3 h-3" />
                              <span>Receber</span>
                            </button>
                            <button 
                              id={`btn-cancel-pay-${p.objectId}`}
                              onClick={() => onUpdatePaymentStatus(p.objectId, "canceled")}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-0.5 uppercase"
                            >
                              <X className="w-3 h-3" />
                              <span>Estornar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: New Transaction */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Nova Receita / Faturamento</h3>
              <button 
                id="btn-close-transaction-modal"
                onClick={() => setIsAdding(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Patient */}
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
                      <option key={p.objectId} value={p.objectId}>{p.fullName}</option>
                    ))}
                  </select>
                </div>

                {/* Amount and Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Valor (R$) *</label>
                    <input 
                      type="number" 
                      required 
                      step="0.01"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Forma de Recebimento</label>
                    <select 
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                    >
                      <option value="pix">PIX</option>
                      <option value="cartão">Cartão de Crédito/Débito</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="convênio">Convênio Médico</option>
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Data de Vencimento *</label>
                  <input 
                    type="date" 
                    required 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Consulta Médica Particular, Procedimento estético"
                    className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
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
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
