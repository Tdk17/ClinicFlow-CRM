import React from "react";
import { 
  Activity, Users, Calendar, Clipboard, DollarSign, 
  Settings, CreditCard, Shield, UserPlus 
} from "lucide-react";
import { User, Clinic } from "../types";

interface SidebarProps {
  user: User;
  clinic: Clinic | null;
  currentHash: string;
  onManagePortal: () => void;
}

export function Sidebar({ user, clinic, currentHash, onManagePortal }: SidebarProps) {
  // Check role access helpers
  const canAccessFinanceAndSettings = user.role === "clinic_owner" || user.role === "admin";
  const canAccessProntuarios = user.role === "doctor" || user.role === "clinic_owner" || user.role === "admin";

  return (
    <aside id="app-sidebar" className="w-64 bg-slate-900 flex flex-col h-full select-none shrink-0 border-r border-slate-800/50">
      {/* Brand logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
          <Activity className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">ClinicFlow</span>
      </div>

      {/* User Quick Info */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-xs border border-slate-700/50">
          {(user.fullName || user.email || "US").substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">{user.fullName || user.email || "Usuário"}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            {user.role === "clinic_owner" ? "Gestor" : user.role === "receptionist" ? "Recepção" : user.role === "doctor" ? "Médico" : user.role}
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {/* Dashboard */}
        <a 
          id="nav-dashboard"
          href="#/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
            currentHash.startsWith("#/dashboard") 
              ? "bg-emerald-500/10 text-emerald-400 font-bold" 
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard</span>
        </a>

        {/* Pacientes */}
        <a 
          id="nav-pacientes"
          href="#/pacientes" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
            currentHash.startsWith("#/pacientes") 
              ? "bg-emerald-500/10 text-emerald-400 font-bold" 
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Pacientes</span>
        </a>

        {/* Agenda */}
        <a 
          id="nav-agenda"
          href="#/agenda" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
            currentHash.startsWith("#/agenda") 
              ? "bg-emerald-500/10 text-emerald-400 font-bold" 
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda</span>
        </a>

        {/* Prontuários - only Doctor, Owner, Admin */}
        {canAccessProntuarios && (
          <a 
            id="nav-prontuarios"
            href="#/prontuarios" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              currentHash.startsWith("#/prontuarios") 
                ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Prontuários</span>
          </a>
        )}

        {/* Financeiro - only clinic_owner or admin */}
        {canAccessFinanceAndSettings && (
          <a 
            id="nav-financeiro"
            href="#/financeiro" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              currentHash.startsWith("#/financeiro") 
                ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financeiro</span>
          </a>
        )}

        {/* Planos - only clinic_owner or admin */}
        {canAccessFinanceAndSettings && (
          <a 
            id="nav-planos"
            href="#/planos" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              currentHash.startsWith("#/planos") 
                ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Planos de Assinatura</span>
          </a>
        )}

        {/* Configurações - strictly limited to clinic_owner or admin */}
        {canAccessFinanceAndSettings && (
          <a 
            id="nav-configuracoes"
            href="#/configuracoes" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              currentHash.startsWith("#/configuracoes") 
                ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </a>
        )}

        {/* Global Admin Link */}
        {(user.role === "admin" || user.username === "admin") && (
          <a 
            id="nav-admin-global"
            href="#/admin-global" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              currentHash.startsWith("#/admin-global") 
                ? "bg-violet-500/10 text-violet-400 font-bold" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Global</span>
          </a>
        )}
      </nav>

      {/* Subscription/Trial Status docked at bottom */}
      {clinic && (user.role === "clinic_owner" || user.role === "admin") && (
        <div className="mx-4 mb-4 p-3.5 bg-slate-800/50 border border-slate-700/40 rounded-xl space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assinatura</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
              clinic.subscriptionStatus === "trial" 
                ? "bg-amber-500/10 text-amber-400" 
                : "bg-emerald-500/10 text-emerald-400"
            }`}>
              {clinic.subscriptionStatus === "trial" ? "Teste" : "Ativo"}
            </span>
          </div>
          <div>
            <p className="text-xs font-extrabold text-white truncate">{clinic.currentPlan || "Starter"}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {clinic.subscriptionStatus === "trial" ? (
                <span>Restam {Math.max(0, Math.ceil((new Date(clinic.subscriptionEndsAt || "").getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias</span>
              ) : (
                <span>Ativo</span>
              )}
            </p>
          </div>
          <a 
            id="sidebar-btn-planos"
            href="#/planos"
            className="block text-center w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] rounded-lg transition-all"
          >
            Mudar Plano
          </a>
        </div>
      )}
    </aside>
  );
}
