import React from "react";
import { CreditCard, Check, Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";
import { User, Clinic } from "../types";

interface PlanosViewProps {
  user: User;
  clinic: Clinic | null;
  onCheckout: (planName: string, priceId: string) => void;
  onManagePortal: () => void;
}

export function PlanosView({ user, clinic, onCheckout, onManagePortal }: PlanosViewProps) {
  // Defensive check: only owner or admin can render this view.
  const isOwnerOrAdmin = user.role === "clinic_owner" || user.role === "admin";
  
  if (!isOwnerOrAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-900 text-base">Acesso Restrito</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Você não possui permissão para visualizar os planos de assinatura. Esta área é exclusiva para proprietários e gestores da clínica.
        </p>
        <a href="#/dashboard" className="inline-block px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs">
          Voltar ao Dashboard
        </a>
      </div>
    );
  }

  const plans = [
    {
      name: "Starter",
      price: "R$ 149/mês",
      priceId: "price_starter_id", // Stripe price id
      description: "Ideal para consultórios individuais e novos profissionais.",
      features: [
        "Até 2 profissionais cadastrados",
        "Prontuário eletrônico completo (PEP)",
        "Agenda inteligente responsiva",
        "Gestão de até 150 pacientes ativos",
        "Acesso PWA para celular",
        "Suporte por e-mail"
      ]
    },
    {
      name: "Pro",
      price: "R$ 299/mês",
      priceId: "price_pro_id",
      description: "Melhor custo-benefício para clínicas em expansão.",
      popular: true,
      features: [
        "Até 6 profissionais cadastrados",
        "Prontuário eletrônico completo (PEP)",
        "Agenda inteligente e lembretes",
        "Gestão ilimitada de pacientes",
        "Acesso PWA e segurança MasterKey",
        "Painel Financeiro & Fluxo de Caixa",
        "Suporte priorizado WhatsApp/E-mail"
      ]
    },
    {
      name: "Premium",
      price: "R$ 499/mês",
      priceId: "price_premium_id",
      description: "A solução corporativa definitiva para grandes clínicas.",
      features: [
        "Profissionais e médicos ilimitados",
        "Tudo do plano Pro incluído",
        "Backup automático e MasterKey dedicada",
        "Suporte VIP por telefone 24/7",
        "Customização de relatórios",
        "Integrações de API exclusivas",
        "Auxílio de transição de prontuários"
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Planos de Assinatura</h2>
        <p className="text-xs text-slate-500">Escolha o plano perfeito para o tamanho da sua clínica e gerencie seus pagamentos com segurança.</p>
      </div>

      {/* Subscription Status Callout */}
      {clinic && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status da Assinatura</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">
                Sua clínica está no plano <strong className="text-emerald-600 uppercase">{clinic.currentPlan || "Starter"}</strong> (Status: {clinic.subscriptionStatus})
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {clinic.subscriptionStatus === "trial" 
                  ? "Seu período de avaliação gratuita está ativo." 
                  : "Assinatura ativa vinculada ao Stripe Billing."}
              </p>
            </div>
          </div>
          {clinic.stripeCustomerId && (
            <button 
              id="plan-btn-manage-portal"
              onClick={onManagePortal}
              className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              Gerenciar Assinatura (Portal Stripe)
            </button>
          )}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = clinic && clinic.currentPlan?.toLowerCase() === p.name.toLowerCase();

          return (
            <div 
              key={p.name} 
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all ${
                p.popular ? "border-emerald-500 scale-[1.02]" : "border-slate-100"
              }`}
            >
              {p.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Mais Escolhido</span>
                </div>
              )}

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{p.price}</span>
                </div>

                <div className="border-t border-slate-50 pt-5 space-y-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">O que está incluído</p>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <div className="w-full text-center py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold uppercase">
                    Seu Plano Atual
                  </div>
                ) : (
                  <button 
                    id={`btn-checkout-${p.name}`}
                    onClick={() => onCheckout(p.name, p.priceId)}
                    className={`w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      p.popular 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    Assinar {p.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
