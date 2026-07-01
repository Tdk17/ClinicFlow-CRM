import React, { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { apiService } from "../utils/api";

interface SuccessViewProps {
  onRefreshClinic: () => Promise<void>;
}

export function SuccessView({ onRefreshClinic }: SuccessViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
    const clinicId = params.get("clinicId");
    const plan = params.get("plan") || "Pro";

    if (clinicId) {
      apiService.simulateCheckoutSuccess(clinicId, plan)
        .then(() => onRefreshClinic())
        .catch((err) => setError(err.message || "Erro ao atualizar assinatura"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [onRefreshClinic]);

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl text-center space-y-6 max-w-md mx-auto mt-16 animate-scale-in">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">Assinatura Ativada!</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {loading 
            ? "Processando transação com o Stripe..." 
            : error 
            ? `Erro: ${error}`
            : "O pagamento foi processado com sucesso. Sua clínica foi atualizada com todos os recursos contratados!"}
        </p>
      </div>
      <div className="pt-2">
        <a 
          href="#/dashboard" 
          className="inline-block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Ir para o Dashboard
        </a>
      </div>
    </div>
  );
}
