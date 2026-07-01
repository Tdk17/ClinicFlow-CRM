import React, { useState } from "react";
import { Shield, Sparkles, Building, Play, ToggleLeft, UserCheck, CreditCard } from "lucide-react";
import { Clinic, User } from "../types";

interface AdminGlobalViewProps {
  user: User;
  clinics: Clinic[];
  onTriggerWebhook: (clinicId: string, eventType: string) => void;
  onUpdateClinicPlan: (clinicId: string, plan: string, status: string) => void;
}

export function AdminGlobalView({ user, clinics, onTriggerWebhook, onUpdateClinicPlan }: AdminGlobalViewProps) {
  if (user.role !== "admin" && user.username !== "admin") {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-12">
        <h3 className="font-bold text-slate-900 text-base">Acesso Não Autorizado</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Área restrita de administração global da plataforma SaaS ClinicFlow.
        </p>
        <a href="#/dashboard" className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
          Voltar ao Dashboard
        </a>
      </div>
    );
  }

  const [simulatedPlan, setSimulatedPlan] = useState("Pro");
  const [simulatedStatus, setSimulatedStatus] = useState("active");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-violet-500" />
          <span>Console de Administração Global SaaS</span>
        </h2>
        <p className="text-xs text-slate-500">Gerencie as instâncias de clínicas, simule pagamentos Stripe e controle assinaturas da plataforma.</p>
      </div>

      {/* Grid of registered Clinics */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-4">Clínicas Cadastradas no SaaS ({clinics.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3">ID / Nome da Clínica</th>
                <th className="px-4 py-3">Documento / Contato</th>
                <th className="px-4 py-3">Plano Atual</th>
                <th className="px-4 py-3">Status Assinatura</th>
                <th className="px-4 py-3 text-right">Ações de Teste / Webhook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics.map(cli => (
                <tr key={cli.objectId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{cli.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono select-all">{cli.objectId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{cli.document || "Sem documento"}</p>
                    <p className="text-[10px] text-slate-400">{cli.email || cli.phone || "Sem contato"}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {cli.currentPlan || "Starter"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                      cli.subscriptionStatus === "active" || cli.subscriptionStatus === "trial"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-rose-50 text-rose-600 border border-rose-100"
                    }`}>
                      {cli.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-y-1.5">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={simulatedPlan}
                        onChange={(e) => setSimulatedPlan(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg p-1 text-[10px] font-bold"
                      >
                        <option value="Starter">Starter</option>
                        <option value="Pro">Pro</option>
                        <option value="Premium">Premium</option>
                      </select>

                      <select 
                        value={simulatedStatus}
                        onChange={(e) => setSimulatedStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-lg p-1 text-[10px] font-bold"
                      >
                        <option value="active">Ativa</option>
                        <option value="trial">Trial</option>
                        <option value="canceled">Cancelada</option>
                        <option value="expired">Expirada</option>
                      </select>

                      <button 
                        id={`btn-update-plan-${cli.objectId}`}
                        onClick={() => onUpdateClinicPlan(cli.objectId, simulatedPlan, simulatedStatus)}
                        className="p-1 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="Aplicar Alteração de Plano"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Atualizar</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        id={`btn-trigger-payment-${cli.objectId}`}
                        onClick={() => onTriggerWebhook(cli.objectId, "invoice.payment_succeeded")}
                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Simular webhook Stripe (Sucesso)</span>
                      </button>
                      <button 
                        id={`btn-trigger-cancel-${cli.objectId}`}
                        onClick={() => onTriggerWebhook(cli.objectId, "customer.subscription.deleted")}
                        className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Simular Cancelamento</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
