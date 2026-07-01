import React, { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

export function PwaBanner() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div id="pwa-install-banner" className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 text-white flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-tight text-white">Instale o ClinicFlow CRM no seu Celular</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-normal max-w-2xl hidden sm:block">
            Acesse como um aplicativo nativo (PWA). No Android, toque no menu de 3 pontos do navegador e selecione <strong className="text-white">"Instalar"</strong>. No iPhone, clique no botão <strong className="text-white">Compartilhar</strong> e selecione <strong className="text-white">"Adicionar à Tela de Início"</strong>.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          id="btn-pwa-dismiss"
          onClick={() => setIsOpen(false)}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-3 py-1.5"
        >
          Dispensar
        </button>
      </div>
    </div>
  );
}
