import React, { useState, useEffect } from "react";
import { Activity, Mail, Lock, User, Phone, Briefcase, Building, ChevronRight, Calendar, Users, Clipboard } from "lucide-react";
import { apiService } from "../utils/api";

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (clinicName: string, document: string, phone: string, email: string, adminName: string, adminEmail: string, pass: string) => Promise<void>;
  onRegisterPatient: (data: any) => Promise<void>;
}

export function LoginView({ onLogin, onRegister, onRegisterPatient }: LoginViewProps) {
  const [userType, setUserType] = useState<"professional" | "patient">("professional");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clinics list for Patient registration
  const [clinics, setClinics] = useState<{ objectId: string; name: string }[]>([]);

  // Login Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Professional Register Fields
  const [clinicName, setClinicName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");

  // Patient Register Fields
  const [pName, setPName] = useState("");
  const [pCpf, setPCpf] = useState("");
  const [pBirthDate, setPBirthDate] = useState("");
  const [pGender, setPGender] = useState("M");
  const [pPhone, setPPhone] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pPassword, setPPassword] = useState("");
  const [pClinicId, setPClinicId] = useState("");
  const [pRole, setPRole] = useState<"patient" | "doctor" | "receptionist">("patient");

  useEffect(() => {
    // Load public clinics for patient signup selection
    apiService.getPublicClinics()
      .then(res => {
        setClinics(res.results);
        if (res.results.length > 0) {
          setPClinicId(res.results[0].objectId);
        }
      })
      .catch(err => console.error("Erro ao carregar clínicas:", err));
  }, [isRegistering, userType]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (err: any) {
      alert(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userType === "professional") {
        if (!clinicName || !adminName || !adminEmail || !password) {
          alert("Por favor, preencha todos os campos obrigatórios.");
          setLoading(false);
          return;
        }
        await onRegister(clinicName, document, phone, email || adminEmail, adminName, adminEmail, password);
        alert("Clínica registrada com sucesso! Use o e-mail cadastrado para fazer login.");
      } else {
        if (!pName || !pEmail || !pPassword || !pClinicId) {
          alert("Por favor, preencha todos os campos obrigatórios.");
          setLoading(false);
          return;
        }
        await onRegisterPatient({
          fullName: pName,
          cpf: pCpf,
          birthDate: pBirthDate,
          gender: pGender,
          phone: pPhone,
          email: pEmail,
          password: pPassword,
          clinicId: pClinicId,
          role: pRole
        });
        if (pRole === "patient") {
          alert("Cadastro de paciente realizado com sucesso! Faça login para agendar suas consultas.");
        } else if (pRole === "doctor") {
          alert("Cadastro de médico realizado com sucesso! Faça login para gerenciar sua agenda.");
        } else {
          alert("Cadastro de recepcionista realizado com sucesso! Faça login para gerenciar a recepção.");
        }
      }
      setIsRegistering(false);
    } catch (err: any) {
      alert(err.message || "Erro durante o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 md:p-8 select-none font-sans overflow-y-auto">
      
      {/* Fullscreen Background Image with Mix Blend & Low Opacity */}
      <img 
        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80" 
        className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" 
        alt="Clinic Workspace" 
        referrerPolicy="no-referrer" 
      />
      
      {/* Glowing Deep Teal & Emerald Medical/Tech Theme Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950/90 opacity-95"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>

      {/* Elegant Content Wrapper */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 my-auto animate-fade-in">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
              ClinicFlow
            </h1>
            <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest mt-0.5">Painel de Saúde Integrado</p>
          </div>
        </div>

        <div className="w-full bg-white rounded-3xl border border-slate-100/80 shadow-2xl overflow-hidden transition-all hover:shadow-emerald-500/10 duration-500">
          
          {/* Form Banner Header */}
          <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col items-center text-center relative overflow-hidden">
            <h2 className="text-lg font-extrabold tracking-tight z-10">
              {isRegistering 
                ? (userType === "patient" ? "Cadastro de Usuário" : "Criar Conta de Clínica") 
                : "Acesse o ClinicFlow"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 z-10 max-w-xs">
              {isRegistering 
                ? "Preencha os dados e comece a operar em instantes." 
                : (userType === "patient" ? "Agende consultas ou acesse o portal como profissional." : "Gerencie sua equipe, agenda e recepção.")}
            </p>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          </div>

          {/* Tab Selector (Professional vs Patient) */}
          {!isRegistering && (
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                id="tab-professional"
                type="button"
                onClick={() => { setUserType("professional"); setErrorFields(); }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  userType === "professional" 
                    ? "border-emerald-500 text-emerald-600 bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                💼 Médico / Clínica
              </button>
              <button
                id="tab-patient"
                type="button"
                onClick={() => { setUserType("patient"); setErrorFields(); }}
                className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all cursor-pointer ${
                  userType === "patient" 
                    ? "border-emerald-500 text-emerald-600 bg-white" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                👤 Paciente / Equipe
              </button>
            </div>
          )}

          {/* Content Form Area */}
          <div className="p-8">
            {!isRegistering ? (
              /* Login Form */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      id="login-email"
                      type="email" 
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={userType === "patient" ? "seu.email@paciente.com" : "dho@gesto.com"}
                      className="w-full bg-slate-50 pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sua Senha</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      id="login-password"
                      type="password" 
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    id="btn-login-submit"
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? "Entrando..." : "Entrar no Painel"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Não possui cadastro?</span>
                  <button 
                    id="btn-register-toggle"
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-emerald-600 hover:underline cursor-pointer font-bold"
                  >
                    {userType === "patient" ? "Cadastrar Paciente / Equipe" : "Registrar Clínica"}
                  </button>
                </div>

                {/* Secure Credentials Info Panel - styled nicely to match new colors */}
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50 mt-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider border-b border-emerald-100 pb-1">
                    <span>💡 Acessos Rápidos de Teste:</span>
                  </div>
                  <div className="text-[10.5px] text-slate-600 space-y-1.5 font-medium">
                    <p>👑 <b>Gestor Gesto:</b> <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">dho@gesto.com</code> / Senha: <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">gesto123</code></p>
                    <p>🩺 <b>Médico Sergio:</b> <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">sergiomedico@clinicflow.com</code> / Senha: <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">sergio123</code></p>
                    <p>📞 <b>Recepção:</b> <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">recepcao@clinicflow.com</code> / Senha: <code className="bg-white px-1 py-0.5 rounded border border-slate-100 font-mono">recepcao123</code></p>
                  </div>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[48vh] overflow-y-auto pr-1">
                {userType === "professional" ? (
                  /* Professional Clinic Signup */
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">1. Dados da Clínica</p>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Fantasia da Clínica *</label>
                      <input 
                        type="text" 
                        required
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Ex: Clínica Gesto Saúde"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CNPJ / CPF</label>
                        <input 
                          type="text" 
                          value={document}
                          onChange={(e) => setDocument(e.target.value)}
                          placeholder="00.000.000/0001-00"
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefone / Whats</label>
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail Comercial</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contato@suaclinica.com"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                      />
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1 pt-2">2. Conta do Gestor (Dono)</p>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seu Nome Completo *</label>
                      <input 
                        type="text" 
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Ex: Dr. Roberto Silva"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">E-mail de Acesso *</label>
                      <input 
                        type="email" 
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="seuemail@gesto.com"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Senha de Acesso *</label>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha segura"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  /* Patient Signup */
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">Dados de Cadastro do Usuário</p>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-extrabold text-slate-500">Selecione seu Perfil *</label>
                      <select
                        value={pRole}
                        onChange={(e) => setPRole(e.target.value as any)}
                        required
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800"
                      >
                        <option value="patient">👤 Sou Paciente</option>
                        <option value="doctor">🩺 Sou Médico / Especialista</option>
                        <option value="receptionist">📞 Sou Recepcionista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-extrabold text-slate-500">Escolha a Clínica Desejada *</label>
                      <select
                        value={pClinicId}
                        onChange={(e) => setPClinicId(e.target.value)}
                        required
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold text-slate-800"
                      >
                        {clinics.map(c => (
                          <option key={c.objectId} value={c.objectId}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seu Nome Completo *</label>
                      <input 
                        type="text" 
                        required
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder="Ex: Carlos de Souza"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CPF</label>
                        <input 
                          type="text" 
                          value={pCpf}
                          onChange={(e) => setPCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nascimento</label>
                        <input 
                          type="date" 
                          value={pBirthDate}
                          onChange={(e) => setPBirthDate(e.target.value)}
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gênero</label>
                        <select 
                          value={pGender}
                          onChange={(e) => setPGender(e.target.value)}
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-700"
                        >
                          <option value="M font-semibold">Masculino</option>
                          <option value="F font-semibold">Feminino</option>
                          <option value="Outro font-semibold">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefone Celular</label>
                        <input 
                          type="text" 
                          value={pPhone}
                          onChange={(e) => setPPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seu E-mail de Login *</label>
                      <input 
                        type="email" 
                        required
                        value={pEmail}
                        onChange={(e) => setPEmail(e.target.value)}
                        placeholder="exemplo@paciente.com"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Crie sua Senha *</label>
                      <input 
                        type="password" 
                        required
                        value={pPassword}
                        onChange={(e) => setPPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-50 px-3.5 py-2.5 text-xs rounded-xl border border-slate-100 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    id="btn-register-submit"
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{loading ? "Cadastrando..." : "Cadastrar e Criar Conta"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Já possui cadastro?</span>
                  <button 
                    id="btn-login-toggle"
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-emerald-600 hover:underline cursor-pointer font-bold"
                  >
                    Fazer Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Small Elegant Centered Footer */}
        <div className="text-[10px] text-slate-400 font-bold tracking-wide text-center">
          © 2026 ClinicFlow Inc. • Certificado Digitalmente 🛡️
        </div>

      </div>
    </div>
  );

  function setErrorFields() {
    setLoginEmail("");
    setLoginPassword("");
  }
}
