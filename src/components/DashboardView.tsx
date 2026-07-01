import React from "react";
import { 
  Users, Calendar, Check, AlertTriangle, TrendingUp, Sparkles, Clipboard, CheckCircle2 
} from "lucide-react";
import { User, Patient, Appointment, Payment, Clinic } from "../types";

interface DashboardViewProps {
  user: User;
  patients: Patient[];
  appointments: Appointment[];
  payments: Payment[];
  clinic?: Clinic | null;
}

export function DashboardView({ user, patients, appointments, payments, clinic }: DashboardViewProps) {
  const isOwnerOrAdmin = user.role === "clinic_owner" || user.role === "admin";

  // Calculations
  const totalPatients = patients.filter(p => p.status === "active").length;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const appointmentsToday = appointments.filter(a => a.date === todayStr);
  const appointmentsTodayCount = appointmentsToday.length;
  const attendedToday = appointmentsToday.filter(a => a.status === "attended").length;
  const pendingToday = appointmentsToday.filter(a => ["scheduled", "confirmed"].includes(a.status)).length;

  const thisMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  
  // Finance stats (Only accessible to clinic_owner or admin)
  const billingThisMonth = payments
    .filter(p => p.status === "paid" && p.paidAt && p.paidAt.startsWith(thisMonthStr))
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPaymentsAmount = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalClosedAppts = appointments.filter(a => ["attended", "no_show"].includes(a.status)).length;
  const totalNoShow = appointments.filter(a => a.status === "no_show").length;
  const attendanceRate = totalClosedAppts > 0 ? Math.round(((totalClosedAppts - totalNoShow) / totalClosedAppts) * 100) : 100;

  // Next upcoming appointments
  const upcomingAppointments = [...appointments]
    .filter(a => a.date >= todayStr && a.status !== "canceled")
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 4);

  const getSubscriptionInfo = () => {
    if (!clinic) return null;
    const endsAt = clinic.subscriptionEndsAt ? new Date(clinic.subscriptionEndsAt) : null;
    const now = new Date();
    
    let daysRemaining = 0;
    if (endsAt) {
      const diffTime = endsAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    const isExpired = clinic.subscriptionStatus === "expired" || clinic.subscriptionStatus === "canceled" || (clinic.subscriptionStatus === "trial" && daysRemaining <= 0);
    
    return {
      status: clinic.subscriptionStatus,
      planName: clinic.currentPlan || "Starter",
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: isExpired,
      endsAtFormatted: endsAt ? endsAt.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : ""
    };
  };

  const subInfo = getSubscriptionInfo();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Geral</h2>
          <p className="text-xs text-slate-500">Bem-vindo de volta, {user.fullName || user.email || "Usuário"}</p>
        </div>
      </div>

      {/* Subscription/Trial Status Widget */}
      {isOwnerOrAdmin && clinic && subInfo && (
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs ${
          subInfo.isExpired 
            ? "bg-rose-50 border-rose-200 text-rose-800" 
            : clinic.subscriptionStatus === "trial"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-emerald-50 border-emerald-100 text-emerald-800"
        }`}>
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              subInfo.isExpired 
                ? "bg-rose-100 text-rose-600" 
                : clinic.subscriptionStatus === "trial"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-emerald-100 text-emerald-600"
            }`}>
              {subInfo.isExpired ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : clinic.subscriptionStatus === "trial" ? (
                <Sparkles className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                {clinic.subscriptionStatus === "trial" ? "Período de Teste Gratuito" : "Assinatura Ativa"}
              </p>
              <h4 className="text-xs font-bold mt-0.5 leading-relaxed">
                {subInfo.isExpired ? (
                  <span>Seu plano <strong className="uppercase font-extrabold text-rose-700">{clinic.currentPlan}</strong> expirou! Assine agora para restabelecer os acessos da clínica.</span>
                ) : clinic.subscriptionStatus === "trial" ? (
                  <span>Você está no plano de avaliação <strong className="uppercase font-extrabold text-amber-700">{clinic.currentPlan}</strong> — restam <strong className="text-amber-700 font-extrabold">{subInfo.daysRemaining} dias</strong> de teste grátis (expira em {subInfo.endsAtFormatted}).</span>
                ) : (
                  <span>Sua assinatura do plano <strong className="uppercase font-extrabold text-emerald-700">{clinic.currentPlan}</strong> está ativa! Próxima cobrança em {subInfo.endsAtFormatted}.</span>
                )}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <a 
              href="#/planos" 
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap text-center ${
                subInfo.isExpired 
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs" 
                  : clinic.subscriptionStatus === "trial"
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              }`}
            >
              {subInfo.isExpired ? "Reativar / Assinar Plano" : "Gerenciar Planos"}
            </a>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pacientes Ativos */}
        <div id="stat-patients" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pacientes Ativos</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalPatients}</h3>
          <div className="flex items-center gap-1 mt-2 text-emerald-500 text-xs">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V14a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" />
            </svg>
            <span>+12% este mês</span>
          </div>
        </div>

        {/* Consultas Hoje */}
        <div id="stat-appointments" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Consultas Hoje</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{appointmentsTodayCount}</h3>
          <p className="text-xs text-slate-400 mt-2">
            {attendedToday} concluídas • {pendingToday} pendentes
          </p>
        </div>

        {/* If owner/admin: display billing and pending. If receptionist/doctor: display clinic efficiency and total scheduled */}
        {isOwnerOrAdmin ? (
          <>
            {/* Faturamento */}
            <div id="stat-billing" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Faturamento (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                R$ {billingThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-500 text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L11 6.414V14a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" />
                </svg>
                <span>8.4% crescimento</span>
              </div>
            </div>

            {/* Pendências Financeiras */}
            <div id="stat-pending" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pendentes Pag.</p>
              <h3 className="text-2xl font-bold text-rose-500 mt-1">
                R$ {pendingPaymentsAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Faturas abertas em aberto</p>
            </div>
          </>
        ) : (
          <>
            {/* Taxa de Comparecimento (Instead of Financeiro) */}
            <div id="stat-attendance" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Taxa de Presença</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{attendanceRate}%</h3>
              <p className="text-xs text-slate-400 mt-2">Média de comparecimento dos pacientes</p>
            </div>

            {/* Total Atendimentos na semana (Instead of Assinaturas) */}
            <div id="stat-efficiency" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Prontuários Preenchidos</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                {appointments.filter(a => a.status === "attended").length}
              </h3>
              <p className="text-xs text-slate-400 mt-2">Histórico total de atendimentos</p>
            </div>
          </>
        )}
      </div>

      {/* Tables and Side Column */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Appointments Table */}
        <div className="flex-1 lg:flex-[2] bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Próximos Atendimentos</h4>
            <a href="#/agenda" className="text-emerald-600 text-xs font-bold hover:underline">Ver Agenda Completa</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Data / Horário</th>
                  <th className="px-6 py-4">Profissional</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-700 divide-y divide-slate-50">
                {upcomingAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Nenhum atendimento agendado para os próximos dias.
                    </td>
                  </tr>
                ) : (
                  upcomingAppointments.map((appt) => {
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
                      <tr key={appt.objectId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {appt.patient?.fullName || "Paciente Geral"}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {new Date(appt.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })} às {appt.startTime}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {appt.professional?.fullName || "Profissional"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full uppercase tracking-wider ${statusColors[appt.status] || "bg-slate-100"}`}>
                            {labelMap[appt.status] || appt.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights Column */}
        <div className="flex-1 space-y-6">
          {/* Caixa Health widget - Only visible to Owner / Admin */}
          {isOwnerOrAdmin ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-4">Saúde do Caixa</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600">
                    <span>Taxa de Recebimento</span>
                    <span className="text-emerald-600 font-bold">
                      {payments.length > 0 ? Math.round((payments.filter(p => p.status === "paid").length / payments.length) * 100) : 100}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ 
                        width: `${payments.length > 0 ? Math.round((payments.filter(p => p.status === "paid").length / payments.length) * 100) : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Último Lançamento</span>
                    <span className="font-bold text-slate-800">
                      {payments.length > 0 ? `R$ ${payments[payments.length - 1].amount.toFixed(2)}` : "R$ 0,00"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                    {payments.length > 0 ? `${payments[payments.length - 1].description} • ${payments[payments.length - 1].method}` : "Sem lançamentos recentes"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Clinico Information / Guidelines Card for non-owners (receptionist/doctor) */
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm mb-3">Dica do Dia</h4>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Manter os prontuários dos pacientes atualizados e detalhados imediatamente após as consultas melhora a qualidade do atendimento e garante conformidade legal. Use o ClinicFlow para registrar exames e receitas com facilidade!
                </p>
              </div>
            </div>
          )}

          {/* Indigo App Install Promo */}
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-sm relative overflow-hidden text-white">
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1.5 leading-snug">Sempre Conectado</h4>
              <p className="text-indigo-100 text-xs mb-4 leading-relaxed opacity-90">
                Acesse sua agenda médica completa de qualquer lugar, direto do seu smartphone Android ou Apple como PWA.
              </p>
              <button 
                id="btn-install-promo"
                onClick={() => {
                  const banner = document.getElementById("pwa-install-banner");
                  if (banner) {
                    banner.scrollIntoView({ behavior: "smooth" });
                    banner.classList.add("bg-indigo-700");
                    setTimeout(() => banner.classList.remove("bg-indigo-700"), 1000);
                  }
                }}
                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm cursor-pointer"
              >
                Como Instalar PWA
              </button>
            </div>
            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
