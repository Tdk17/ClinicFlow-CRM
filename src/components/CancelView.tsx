import React from "react";
import { XCircle } from "lucide-react";

export function CancelView() {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl text-center space-y-6 max-w-md mx-auto mt-16 animate-scale-in">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-lg">Assinatura Cancelada</h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          O processo de checkout do Stripe foi interrompido ou cancelado. Nenhuma cobrança foi realizada no seu cartão.
        </p>
      </div>
      <div className="pt-2">
        <a 
          href="#/planos" 
          className="inline-block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Voltar aos Planos
        </a>
      </div>
    </div>
  );
}
