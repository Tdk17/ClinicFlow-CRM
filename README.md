# ClinicFlow CRM - SaaS Completo para Gestão de Clínicas

Bem-vindo ao **ClinicFlow CRM**, uma solução de software como serviço (SaaS) robusta e altamente polida para consultórios, clínicas e profissionais de saúde. O sistema foi desenvolvido com uma arquitetura moderna que integra um frontend responsivo, aplicativo PWA instalável no Android/iPhone, back-end em Node.js/Express integrado ao Stripe Checkout, e banco de dados Parse Server hospedado no Back4App.

---

## 🚀 Estrutura Geral do Projeto

Este repositório está organizado para fornecer o MVP pronto para uso direto no navegador (versão React/TypeScript disponível para demonstração instantânea no Iframe da AI Studio) e o código completo preparado para o desenvolvimento e publicação de seu aplicativo em **Flutter Web** no **GitHub Pages**, com backend para webhooks Stripe.

### Divisão de Pastas no Repositório:
- `/` (Raiz): Código-fonte da aplicação de visualização interativa do CRM em React & Tailwind, servindo como protótipo comercial interativo.
- `/server.ts`: Servidor Express unificado responsável por gerenciar sessões de pagamento Stripe, Webhooks e fornecer dados rápidos para demonstração.
- `/.github/workflows/deploy.yml`: Workflow para publicação automática do seu aplicativo Flutter no GitHub Pages.
- `/flutter_app/`: Arquivos principais do seu app em Flutter (Models, Services e Rotas) detalhados abaixo.

---

## 🛠️ Stack Tecnológica e Serviços

1. **Frontend**: Flutter Web (PWA instalável, responsivo para desktop e mobile).
2. **Banco de Dados & Autenticação**: Back4App / Parse Server.
3. **Faturamento & Assinaturas**: Stripe Checkout e Billing Portal (Portal do Cliente).
4. **Hospedagem Frontend**: GitHub Pages (para o App Flutter Web).
5. **Hospedagem Webhook & APIs**: Render, Railway ou Vercel.

---

## 🛡️ Classes e Atributos no Back4App

Configure as seguintes tabelas em seu painel do Back4App (Dashboard -> Database Browser):

### Class `_User` (Estende a classe de usuário padrão do Parse):
* `username` (String, obrigatório)
* `email` (String, obrigatório)
* `fullName` (String)
* `phone` (String)
* `role` (String: `admin`, `clinic_owner`, `doctor`, `receptionist`)
* `clinic` (Pointer para a classe `Clinic`)
* `isActive` (Boolean)

### Class `Clinic`:
* `name` (String)
* `document` (String, CNPJ/CPF)
* `phone` (String)
* `email` (String)
* `address` (String)
* `subscriptionStatus` (String: `trial`, `active`, `past_due`, `canceled`, `unpaid`, `expired`)
* `currentPlan` (String)
* `stripeCustomerId` (String)
* `stripeSubscriptionId` (String)
* `subscriptionEndsAt` (Date)
* `trialEndsAt` (Date)

### Class `Patient`:
* `clinic` (Pointer para `Clinic`)
* `fullName` (String)
* `cpf` (String)
* `birthDate` (String)
* `gender` (String)
* `phone` (String)
* `whatsapp` (String)
* `email` (String)
* `address` (String)
* `emergencyContact` (String)
* `notes` (String)
* `status` (String: `active`, `inactive`)
* `createdBy` (Pointer para `_User`)

### Class `Appointment`:
* `clinic` (Pointer para `Clinic`)
* `patient` (Pointer para `Patient`)
* `professional` (Pointer para `_User`)
* `date` (String, YYYY-MM-DD)
* `startTime` (String, HH:MM)
* `endTime` (String, HH:MM)
* `status` (String: `scheduled`, `confirmed`, `attended`, `canceled`, `no_show`)
* `reason` (String)
* `notes` (String)
* `createdBy` (Pointer para `_User`)

### Class `MedicalRecord`:
* `clinic` (Pointer para `Clinic`)
* `patient` (Pointer para `Patient`)
* `professional` (Pointer para `_User`)
* `appointment` (Pointer para `Appointment`)
* `complaint` (String)
* `diagnosis` (String)
* `prescription` (String)
* `exams` (String)
* `observations` (String)
* `privateNotes` (String)

### Class `Payment`:
* `clinic` (Pointer para `Clinic`)
* `patient` (Pointer para `Patient`)
* `appointment` (Pointer para `Appointment`)
* `amount` (Number)
* `method` (String: `dinheiro`, `pix`, `cartão`, `convênio`)
* `status` (String: `pending`, `paid`, `canceled`)
* `dueDate` (String, YYYY-MM-DD)
* `paidAt` (Date)
* `description` (String)

---

## ⚡ Cloud Code no Back4App (`main.js`)

Adicione essas funções no seu Cloud Code (Back4App Server Side JavaScript) para executar transações seguras do lado do servidor:

```javascript
Parse.Cloud.define("registerClinic", async (request) => {
  const { clinicName, document, phone, email, adminName, adminEmail, password } = request.params;
  
  // 1. Criar a Clínica
  const Clinic = Parse.Object.extend("Clinic");
  const clinic = new Clinic();
  clinic.set("name", clinicName);
  clinic.set("document", document);
  clinic.set("phone", phone);
  clinic.set("email", email);
  clinic.set("subscriptionStatus", "trial");
  clinic.set("currentPlan", "Starter");
  clinic.set("trialEndsAt", new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)); // 15 dias de trial
  await clinic.save(null, { useMasterKey: true });

  // 2. Criar usuário Admin Dono da Clínica
  const user = new Parse.User();
  user.set("username", adminEmail);
  user.set("email", adminEmail);
  user.set("password", password);
  user.set("fullName", adminName);
  user.set("phone", phone);
  user.set("role", "clinic_owner");
  user.set("clinic", clinic);
  user.set("isActive", true);
  
  await user.signUp(null, { useMasterKey: true });
  return { user, clinic };
});

Parse.Cloud.define("getDashboardData", async (request) => {
  const { clinicId } = request.params;
  const clinicPointer = { __type: "Pointer", className: "Clinic", objectId: clinicId };

  const queryPatients = new Parse.Query("Patient");
  queryPatients.equalTo("clinic", clinicPointer);
  queryPatients.equalTo("status", "active");
  const activePatients = await queryPatients.count({ useMasterKey: true });

  const queryAppointments = new Parse.Query("Appointment");
  queryAppointments.equalTo("clinic", clinicPointer);
  // Filtrar por data de hoje, etc.
  
  return { activePatients };
});
```

---

## 🚀 Como Executar Localmente o Servidor Express (Stripe Webhook)

### Variáveis de Ambiente necessárias (`.env`):
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PARSE_APP_ID="seu_app_id"
PARSE_MASTER_KEY="sua_master_key"
PARSE_SERVER_URL="https://parseapi.back4app.com"
APP_URL="http://localhost:3000"
```

### Comandos para rodar:
```bash
npm install
npm run dev
```

---

## 📱 PWA (Progressive Web App) para Celulares

O projeto já vem configurado com um arquivo `manifest.json` e suporte a Service Worker (`sw.js`). Quando acessado do celular Android ou iPhone, o ClinicFlow exibirá um banner inteligente e moderno convidando o profissional de saúde a "Instalar o Aplicativo" em sua tela inicial, garantindo acesso ultra rápido com design otimizado para toque de no mínimo 44px de área de contato.
