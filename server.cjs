var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_stripe = __toESM(require("stripe"), 1);
import_dotenv.default.config();
var PORT = 3e3;
var app = (0, import_express.default)();
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook" || req.originalUrl === "/api/webhook") {
    next();
  } else {
    import_express.default.json()(req, res, next);
  }
});
var stripeClient = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new import_stripe.default(key, {
      apiVersion: "2025-01-27.acacia"
    });
  }
  return stripeClient;
}
var demoClinics = {
  "demo-clinic": {
    objectId: "demo-clinic",
    name: "Cl\xEDnica Sa\xFAde & Vida",
    document: "12.345.678/0001-90",
    phone: "(11) 98765-4321",
    email: "contato@saudevida.com.br",
    address: "Av. Paulista, 1000 - Bela Vista, S\xE3o Paulo - SP",
    subscriptionStatus: "trial",
    // trial, active, past_due, canceled, unpaid, expired
    currentPlan: "Starter",
    stripeCustomerId: "cus_demo123",
    stripeSubscriptionId: "sub_demo123",
    subscriptionEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString(),
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString()
  }
};
var demoUsers = {
  "demo-admin": {
    objectId: "demo-admin",
    username: "peidinho16@gmail.com",
    fullName: "Dr. Roberto Silva",
    email: "peidinho16@gmail.com",
    password: "demo123",
    phone: "(11) 99999-1111",
    role: "clinic_owner",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true,
    workDays: [1, 2, 3, 4, 5],
    workStartHour: "08:00",
    workEndHour: "18:00"
  },
  "demo-doctor": {
    objectId: "demo-doctor",
    username: "carol@saudevida.com.br",
    fullName: "Dra. Carolina Castro",
    email: "carol@saudevida.com.br",
    password: "demo123",
    phone: "(11) 99999-2222",
    role: "doctor",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true,
    workDays: [2, 4],
    // Terça e Quinta (twice a week)
    workStartHour: "09:00",
    workEndHour: "17:00"
  },
  "demo-receptionist": {
    objectId: "demo-receptionist",
    username: "juliana@saudevida.com.br",
    fullName: "Juliana Santos",
    email: "juliana@saudevida.com.br",
    password: "demo123",
    phone: "(11) 99999-3333",
    role: "receptionist",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true
  },
  "dho-gesto": {
    objectId: "dho-gesto",
    username: "dho@gesto.com",
    fullName: "Gestor Gesto",
    email: "dho@gesto.com",
    password: "gesto123",
    phone: "(11) 98888-7777",
    role: "clinic_owner",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true,
    workDays: [1, 2, 3, 4, 5],
    workStartHour: "08:00",
    workEndHour: "18:00"
  },
  "sergio-medico": {
    objectId: "sergio-medico",
    username: "sergiomedico@clinicflow.com",
    fullName: "Dr. Sergio Santos",
    email: "sergiomedico@clinicflow.com",
    password: "sergio123",
    phone: "(11) 97777-6666",
    role: "doctor",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true,
    workDays: [1, 3],
    // Segunda e Quarta (twice a week)
    workStartHour: "08:00",
    workEndHour: "18:00"
  },
  "recepcao-demo": {
    objectId: "recepcao-demo",
    username: "recepcao@clinicflow.com",
    fullName: "Ana Cristina",
    email: "recepcao@clinicflow.com",
    password: "recepcao123",
    phone: "(11) 96666-5555",
    role: "receptionist",
    clinic: { __type: "Pointer", className: "Clinic", objectId: "demo-clinic" },
    isActive: true
  }
};
var demoPatients = [
  {
    objectId: "p1",
    fullName: "Ana Maria de Souza",
    cpf: "123.456.789-00",
    birthDate: "1985-04-12",
    gender: "Feminino",
    phone: "(11) 98888-5555",
    whatsapp: "(11) 98888-5555",
    email: "ana.maria@gmail.com",
    address: "Rua das Flores, 123 - S\xE3o Paulo - SP",
    emergencyContact: "Carlos Souza (Marido) - (11) 97777-6666",
    notes: "Paciente com hipertens\xE3o leve. Al\xE9rgica a Dipirona.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
  },
  {
    objectId: "p2",
    fullName: "Bruno Oliveira Costa",
    cpf: "987.654.321-11",
    birthDate: "1992-09-24",
    gender: "Masculino",
    phone: "(11) 97777-4444",
    whatsapp: "(11) 97777-4444",
    email: "bruno.costa@hotmail.com",
    address: "Alameda Santos, 450 - Cerqueira C\xE9sar, S\xE3o Paulo - SP",
    emergencyContact: "Marta Costa (M\xE3e) - (11) 96666-5555",
    notes: "Asm\xE1tico. Pratica esportes de alto rendimento.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1e3).toISOString()
  },
  {
    objectId: "p3",
    fullName: "Clara Mendes Rocha",
    cpf: "456.789.123-22",
    birthDate: "1978-11-05",
    gender: "Feminino",
    phone: "(11) 96666-3333",
    whatsapp: "(11) 96666-3333",
    email: "clara.rocha@outlook.com",
    address: "Rua Augusta, 800 - Consola\xE7\xE3o, S\xE3o Paulo - SP",
    emergencyContact: "Felipe Rocha (Irm\xE3o) - (11) 95555-4444",
    notes: "Diabetes tipo 2 controlado com metformina.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString()
  }
];
var demoAppointments = [
  {
    objectId: "a1",
    clinicId: "demo-clinic",
    patientId: "p1",
    professionalId: "demo-admin",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "09:30",
    status: "confirmed",
    // scheduled, confirmed, attended, canceled, no_show
    reason: "Retorno p\xF3s-exames cardiol\xF3gicos",
    notes: "Verificar exames de ecocardiograma.",
    createdBy: "demo-admin"
  },
  {
    objectId: "a2",
    clinicId: "demo-clinic",
    patientId: "p2",
    professionalId: "demo-doctor",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    startTime: "14:30",
    endTime: "15:00",
    status: "scheduled",
    reason: "Primeira consulta de rotina esportiva",
    notes: "Trazer lista de suplementos utilizados.",
    createdBy: "demo-admin"
  },
  {
    objectId: "a3",
    clinicId: "demo-clinic",
    patientId: "p3",
    professionalId: "demo-doctor",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "10:30",
    status: "scheduled",
    reason: "Consulta peri\xF3dica de controle de glicemia",
    notes: "Paciente trar\xE1 di\xE1rio alimentar recente.",
    createdBy: "demo-receptionist"
  }
];
var demoMedicalRecords = [
  {
    objectId: "m1",
    clinicId: "demo-clinic",
    patientId: "p1",
    professionalId: "demo-admin",
    appointmentId: "a1",
    complaint: "Paciente relata cansa\xE7o leve e palpita\xE7\xF5es espor\xE1dicas \xE0 noite.",
    diagnosis: "Hipertens\xE3o controlada, estresse moderado.",
    prescription: "Manter Losartana 50mg pela manh\xE3. Recomendo atividade f\xEDsica leve.",
    exams: "Solicitado Holter de 24h e teste ergom\xE9trico.",
    observations: "Retornar em 30 dias com os exames solicitados.",
    privateNotes: "Verificar se paciente est\xE1 dormindo bem.",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var demoPayments = [
  {
    objectId: "f1",
    clinicId: "demo-clinic",
    patientId: "p1",
    appointmentId: "a1",
    amount: 250,
    method: "pix",
    // dinheiro, pix, cartão, convênio
    status: "paid",
    // pending, paid, canceled
    dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    paidAt: (/* @__PURE__ */ new Date()).toISOString(),
    description: "Consulta presencial cardiologia",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    objectId: "f2",
    clinicId: "demo-clinic",
    patientId: "p2",
    appointmentId: "a2",
    amount: 300,
    method: "cart\xE3o",
    status: "pending",
    dueDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    paidAt: null,
    description: "Avalia\xE7\xE3o de medicina esportiva",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
app.get("/api/demo-config", (req, res) => {
  res.json({
    hasRealStripe: !!process.env.STRIPE_SECRET_KEY,
    hasRealParse: !!process.env.PARSE_APP_ID,
    frontendUrl: process.env.APP_URL || `http://localhost:${PORT}`
  });
});
var createCheckoutSessionHandler = async (req, res) => {
  const { planName, priceId, priceAmount, clinicId } = req.body;
  const frontendUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  console.log("Criando sess\xE3o checkout:", { planName, priceId, priceAmount, clinicId });
  const stripe = getStripe();
  if (!stripe) {
    console.log("Stripe n\xE3o configurado. Simulando sess\xE3o.");
    res.json({
      url: `${frontendUrl}/#/success?session_id=demo_session_${Date.now()}&plan=${planName}&clinicId=${clinicId}`,
      isDemo: true
    });
    return;
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          // Standard Stripe Price ID (e.g. price_123)
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${frontendUrl}/#/success?session_id={CHECKOUT_SESSION_ID}&clinicId=${clinicId}`,
      cancel_url: `${frontendUrl}/#/cancel?clinicId=${clinicId}`,
      metadata: {
        clinicId,
        planName
      }
    });
    res.json({ url: session.url, id: session.id, isDemo: false });
  } catch (error) {
    console.error("Erro Stripe Checkout:", error);
    res.status(500).json({ error: error.message });
  }
};
app.post("/create-checkout-session", createCheckoutSessionHandler);
app.post("/api/create-checkout-session", createCheckoutSessionHandler);
var createCustomerPortalSessionHandler = async (req, res) => {
  const { customerId } = req.body;
  const frontendUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const stripe = getStripe();
  if (!stripe || customerId === "cus_demo123" || !customerId) {
    res.json({
      url: `${frontendUrl}/#/configuracoes?portal=demo`,
      isDemo: true
    });
    return;
  }
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendUrl}/#/configuracoes`
    });
    res.json({ url: session.url, isDemo: false });
  } catch (error) {
    console.error("Erro Portal Stripe:", error);
    res.status(500).json({ error: error.message });
  }
};
app.post("/create-customer-portal-session", createCustomerPortalSessionHandler);
app.post("/api/create-customer-portal-session", createCustomerPortalSessionHandler);
var handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(400).send("Webhook ignored: Stripe client not configured");
    return;
  }
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    if (endpointSecret && sig) {
      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });
      req.on("end", async () => {
        try {
          event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
          await processStripeEvent(event);
          res.json({ received: true });
        } catch (err) {
          console.error("Erro valida\xE7\xE3o webhook:", err.message);
          res.status(400).send(`Webhook Error: ${err.message}`);
        }
      });
    } else {
      let bodyString = "";
      req.on("data", (chunk) => {
        bodyString += chunk;
      });
      req.on("end", async () => {
        try {
          event = JSON.parse(bodyString);
          await processStripeEvent(event);
          res.json({ received: true });
        } catch (err) {
          res.status(400).send("Failed to parse request body");
        }
      });
    }
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
app.post("/webhook", handleWebhook);
app.post("/api/webhook", handleWebhook);
async function processStripeEvent(event) {
  console.log("Recebendo evento Stripe:", event.type);
  const parseAppId2 = process.env.PARSE_APP_ID;
  const parseMasterKey2 = process.env.PARSE_MASTER_KEY;
  const parseServerUrl2 = process.env.PARSE_SERVER_URL || "https://parseapi.back4app.com";
  if (!parseAppId2) {
    console.log("Back4App n\xE3o configurado. Salvando em mem\xF3ria para Demo.");
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const clinicId = session.metadata?.clinicId || "demo-clinic";
      const planName = session.metadata?.planName || "Pro";
      if (demoClinics[clinicId]) {
        demoClinics[clinicId].subscriptionStatus = "active";
        demoClinics[clinicId].currentPlan = planName;
        demoClinics[clinicId].stripeCustomerId = session.customer || "cus_demo123";
        demoClinics[clinicId].stripeSubscriptionId = session.subscription || "sub_demo123";
        demoClinics[clinicId].subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
      }
    }
    return;
  }
  const updateClinicSubscription = async (clinicId, subscriptionData) => {
    try {
      const url = `${parseServerUrl2}/classes/Clinic/${clinicId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "X-Parse-Application-Id": parseAppId2,
          "X-Parse-Master-Key": parseMasterKey2 || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(subscriptionData)
      });
      if (response.ok) {
        console.log(`Cl\xEDnica ${clinicId} atualizada com sucesso no Back4App.`);
      } else {
        console.error("Falha ao atualizar cl\xEDnica no Back4App:", await response.text());
      }
    } catch (e) {
      console.error("Erro conectando ao Back4App:", e);
    }
  };
  const createSubscriptionLog = async (logData) => {
    try {
      const url = `${parseServerUrl2}/classes/Subscription`;
      await fetch(url, {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": parseAppId2,
          "X-Parse-Master-Key": parseMasterKey2 || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });
    } catch (e) {
      console.error("Erro criando log de assinatura:", e);
    }
  };
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const clinicId = session.metadata?.clinicId;
      const planName = session.metadata?.planName;
      if (clinicId) {
        await updateClinicSubscription(clinicId, {
          subscriptionStatus: "active",
          currentPlan: planName,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
        });
        await createSubscriptionLog({
          clinic: { __type: "Pointer", className: "Clinic", objectId: clinicId },
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: "active",
          planName,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "brl"
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer;
      try {
        const queryUrl = `${parseServerUrl2}/classes/Clinic?where=${encodeURIComponent(
          JSON.stringify({ stripeCustomerId })
        )}`;
        const qRes = await fetch(queryUrl, {
          headers: {
            "X-Parse-Application-Id": parseAppId2,
            "X-Parse-Master-Key": parseMasterKey2 || ""
          }
        });
        if (qRes.ok) {
          const body = await qRes.json();
          const clinic = body.results?.[0];
          if (clinic) {
            const statusMap = {
              active: "active",
              trialing: "trial",
              past_due: "past_due",
              canceled: "canceled",
              unpaid: "unpaid",
              incomplete: "unpaid",
              incomplete_expired: "expired"
            };
            const appletStatus = statusMap[sub.status] || "active";
            await updateClinicSubscription(clinic.objectId, {
              subscriptionStatus: appletStatus,
              stripeSubscriptionId: sub.id,
              subscriptionEndsAt: new Date(sub.current_period_end * 1e3).toISOString()
            });
          }
        }
      } catch (e) {
        console.error("Erro localizando cl\xEDnica no webhook:", e);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer;
      try {
        const queryUrl = `${parseServerUrl2}/classes/Clinic?where=${encodeURIComponent(
          JSON.stringify({ stripeCustomerId })
        )}`;
        const qRes = await fetch(queryUrl, {
          headers: {
            "X-Parse-Application-Id": parseAppId2,
            "X-Parse-Master-Key": parseMasterKey2 || ""
          }
        });
        if (qRes.ok) {
          const body = await qRes.json();
          const clinic = body.results?.[0];
          if (clinic) {
            await updateClinicSubscription(clinic.objectId, {
              subscriptionStatus: "canceled"
            });
          }
        }
      } catch (e) {
        console.error("Erro cancelando assinatura no webhook:", e);
      }
      break;
    }
  }
}
var useParse = !!process.env.PARSE_APP_ID;
var parseAppId = process.env.PARSE_APP_ID;
var parseRestKey = process.env.PARSE_REST_KEY;
var parseMasterKey = process.env.PARSE_MASTER_KEY;
var parseServerUrl = process.env.PARSE_SERVER_URL || "https://parseapi.back4app.com";
async function parseFetch(endpoint, options = {}) {
  const headers = {
    "X-Parse-Application-Id": parseAppId || "",
    "X-Parse-REST-API-Key": parseRestKey || "",
    ...parseMasterKey ? { "X-Parse-Master-Key": parseMasterKey } : {},
    "Content-Type": "application/json",
    ...options.headers || {}
  };
  const url = endpoint.startsWith("http") ? endpoint : `${parseServerUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`Parse API Error [${response.status}] for ${endpoint}:`, text);
    throw new Error(text || `Error ${response.status}`);
  }
  return response.json();
}
var db = {
  async getClinics() {
    if (useParse) {
      const data = await parseFetch("/classes/Clinic");
      return data.results;
    }
    return Object.values(demoClinics);
  },
  async getClinic(id) {
    if (useParse) {
      try {
        return await parseFetch(`/classes/Clinic/${id}`);
      } catch (e) {
        return null;
      }
    }
    return demoClinics[id] || null;
  },
  async createClinic(clinic) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = clinic;
      const res = await parseFetch("/classes/Clinic", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...clinic, objectId: res.objectId };
    }
    demoClinics[clinic.objectId] = clinic;
    return clinic;
  },
  async updateClinic(id, clinic) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = clinic;
      await parseFetch(`/classes/Clinic/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...clinic, objectId: id };
    }
    demoClinics[id] = { ...demoClinics[id], ...clinic };
    return demoClinics[id];
  },
  async getUsers(queryObj = {}) {
    if (useParse) {
      const safeQuery = {};
      for (const key in queryObj) {
        if (key === "clinicId") {
          safeQuery["$or"] = [
            { clinicId: queryObj[key] },
            { clinic: { __type: "Pointer", className: "Clinic", objectId: queryObj[key] } }
          ];
        } else {
          safeQuery[key] = queryObj[key];
        }
      }
      const data = await parseFetch(`/classes/TeamMember?where=${encodeURIComponent(JSON.stringify(safeQuery))}`);
      return data.results;
    }
    return Object.values(demoUsers).filter((u) => {
      for (const key in queryObj) {
        if (key === "clinicId") {
          const actualClinicId = u.clinicId || u.clinic?.objectId;
          if (actualClinicId !== queryObj[key]) return false;
        } else if (u[key] !== queryObj[key]) {
          return false;
        }
      }
      return true;
    });
  },
  async getUser(id) {
    if (useParse) {
      try {
        return await parseFetch(`/classes/TeamMember/${id}`);
      } catch (e) {
        return null;
      }
    }
    return demoUsers[id] || null;
  },
  async createUser(user) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = user;
      const res = await parseFetch("/classes/TeamMember", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...user, objectId: res.objectId };
    }
    demoUsers[user.objectId] = user;
    return user;
  },
  async updateUser(id, user) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = user;
      await parseFetch(`/classes/TeamMember/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...user, objectId: id };
    }
    demoUsers[id] = { ...demoUsers[id], ...user };
    return demoUsers[id];
  },
  async getPatients(queryObj = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Patient?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoPatients.filter((p) => {
      for (const key in queryObj) {
        if (p[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createPatient(patient) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = patient;
      const res = await parseFetch("/classes/Patient", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...patient, objectId: res.objectId };
    }
    demoPatients.push(patient);
    return patient;
  },
  async updatePatient(id, patient) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = patient;
      await parseFetch(`/classes/Patient/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...patient, objectId: id };
    }
    const idx = demoPatients.findIndex((p) => p.objectId === id);
    if (idx !== -1) {
      demoPatients[idx] = { ...demoPatients[idx], ...patient };
      return demoPatients[idx];
    }
    return null;
  },
  async deletePatient(id) {
    if (useParse) {
      await parseFetch(`/classes/Patient/${id}`, {
        method: "DELETE"
      });
      return true;
    }
    demoPatients = demoPatients.filter((p) => p.objectId !== id);
    return true;
  },
  async getAppointments(queryObj = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Appointment?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoAppointments.filter((a) => {
      for (const key in queryObj) {
        if (a[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createAppointment(appt) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = appt;
      const res = await parseFetch("/classes/Appointment", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...appt, objectId: res.objectId };
    }
    demoAppointments.push(appt);
    return appt;
  },
  async updateAppointment(id, appt) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = appt;
      await parseFetch(`/classes/Appointment/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...appt, objectId: id };
    }
    const idx = demoAppointments.findIndex((a) => a.objectId === id);
    if (idx !== -1) {
      demoAppointments[idx] = { ...demoAppointments[idx], ...appt };
      return demoAppointments[idx];
    }
    return null;
  },
  async getMedicalRecords(queryObj = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/MedicalRecord?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoMedicalRecords.filter((m) => {
      for (const key in queryObj) {
        if (m[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createMedicalRecord(record) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = record;
      const res = await parseFetch("/classes/MedicalRecord", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...record, objectId: res.objectId };
    }
    demoMedicalRecords.push(record);
    return record;
  },
  async getPayments(queryObj = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Payment?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoPayments.filter((f) => {
      for (const key in queryObj) {
        if (f[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createPayment(payment) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = payment;
      const res = await parseFetch("/classes/Payment", {
        method: "POST",
        body: JSON.stringify(body)
      });
      return { ...payment, objectId: res.objectId };
    }
    demoPayments.push(payment);
    return payment;
  }
};
async function bootstrapBack4App() {
  if (!useParse) return;
  console.log("Iniciando verifica\xE7\xE3o de bootstrap para Back4App...");
  try {
    const existingClinics = await db.getClinics();
    const clinicIdMap = {};
    if (existingClinics.length === 0) {
      console.log("Nenhuma cl\xEDnica encontrada no Back4App. Semeando cl\xEDnicas padr\xE3o...");
      for (const c of Object.values(demoClinics)) {
        const created = await db.createClinic(c);
        clinicIdMap[c.objectId] = created.objectId;
      }
    } else {
      const foundDemo = existingClinics.find((c) => c.name === "Cl\xEDnica Sa\xFAde & Vida");
      if (foundDemo) {
        clinicIdMap["demo-clinic"] = foundDemo.objectId;
      }
    }
    if (!clinicIdMap["demo-clinic"]) {
      const allClinics = await db.getClinics();
      if (allClinics.length > 0) {
        clinicIdMap["demo-clinic"] = allClinics[0].objectId;
      }
    }
    const targetClinicId = clinicIdMap["demo-clinic"] || "demo-clinic";
    const existingUsers = await db.getUsers();
    const userIdMap = {};
    if (existingUsers.length === 0) {
      console.log("Nenhum usu\xE1rio/profissional encontrado no Back4App. Semeando usu\xE1rios padr\xE3o...");
      for (const u of Object.values(demoUsers)) {
        const userToCreate = { ...u };
        userToCreate.clinicId = targetClinicId;
        userToCreate.clinic = { __type: "Pointer", className: "Clinic", objectId: targetClinicId };
        const created = await db.createUser(userToCreate);
        userIdMap[u.objectId] = created.objectId;
      }
    } else {
      const foundAdmin = existingUsers.find((u) => u.username === "peidinho16@gmail.com");
      if (foundAdmin) {
        userIdMap["demo-admin"] = foundAdmin.objectId;
      }
      const foundRecep = existingUsers.find((u) => u.username === "recepcao@clinicflow.com");
      if (foundRecep) {
        userIdMap["recepcao-demo"] = foundRecep.objectId;
      }
    }
    const existingPatients = await db.getPatients();
    const patientIdMap = {};
    if (existingPatients.length === 0) {
      console.log("Nenhum paciente encontrado no Back4App. Semeando pacientes padr\xE3o...");
      for (const p of demoPatients) {
        const patientToCreate = { ...p };
        patientToCreate.clinicId = targetClinicId;
        const created = await db.createPatient(patientToCreate);
        patientIdMap[p.objectId] = created.objectId;
      }
    } else {
      for (const p of existingPatients) {
        const originDemo = demoPatients.find((dp) => dp.email === p.email || dp.fullName === p.fullName);
        if (originDemo) {
          patientIdMap[originDemo.objectId] = p.objectId;
        }
      }
    }
    const existingAppointments = await db.getAppointments();
    if (existingAppointments.length === 0) {
      console.log("Nenhuma consulta encontrada no Back4App. Semeando consultas padr\xE3o...");
      for (const a of demoAppointments) {
        const apptToCreate = { ...a };
        apptToCreate.clinicId = targetClinicId;
        apptToCreate.patientId = patientIdMap[a.patientId] || a.patientId;
        apptToCreate.professionalId = userIdMap[a.professionalId] || a.professionalId;
        apptToCreate.createdBy = userIdMap[a.createdBy] || a.createdBy;
        await db.createAppointment(apptToCreate);
      }
    }
    const existingMedicalRecords = await db.getMedicalRecords();
    if (existingMedicalRecords.length === 0) {
      console.log("Nenhum prontu\xE1rio encontrado no Back4App. Semeando prontu\xE1rios padr\xE3o...");
      for (const m of demoMedicalRecords) {
        const recordToCreate = { ...m };
        recordToCreate.clinicId = targetClinicId;
        recordToCreate.patientId = patientIdMap[m.patientId] || m.patientId;
        recordToCreate.professionalId = userIdMap[m.professionalId] || m.professionalId;
        await db.createMedicalRecord(recordToCreate);
      }
    }
    const existingPayments = await db.getPayments();
    if (existingPayments.length === 0) {
      console.log("Nenhum pagamento/financeiro encontrado no Back4App. Semeando pagamentos padr\xE3o...");
      for (const f of demoPayments) {
        const paymentToCreate = { ...f };
        paymentToCreate.clinicId = targetClinicId;
        paymentToCreate.patientId = patientIdMap[f.patientId] || f.patientId;
        await db.createPayment(paymentToCreate);
      }
    }
    console.log("Bootstrap do Back4App finalizado com sucesso!");
  } catch (error) {
    console.error("Erro durante bootstrap do Back4App:", error);
  }
}
app.get("/api/public/clinics", async (req, res) => {
  try {
    const clinics = await db.getClinics() || [];
    const list = clinics.map((c) => ({
      objectId: c.objectId,
      name: c.name
    }));
    res.json({ results: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await db.getUsers();
    const user = users.find(
      (u) => (u.username === username || u.email === username) && u.password === password
    );
    if (user) {
      if (!user.isActive && user.role !== "patient") {
        return res.status(403).json({ error: "Esta conta est\xE1 temporariamente desativada." });
      }
      const clinicId = user.clinicId || user.clinic?.objectId;
      const clinic = await db.getClinic(clinicId);
      res.json({
        sessionToken: "session_" + user.objectId,
        user: { ...user, clinicDetails: clinic }
      });
    } else {
      res.status(401).json({ error: "E-mail ou senha incorretos." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/register-patient", async (req, res) => {
  const { fullName, cpf, birthDate, gender, phone, email, password, clinicId, role } = req.body;
  const finalFullName = fullName || req.body.name || (email ? email.split("@")[0] : "");
  if (!finalFullName || !email || !password || !clinicId) {
    return res.status(400).json({ error: "Por favor, preencha todos os campos obrigat\xF3rios." });
  }
  try {
    const users = await db.getUsers();
    const emailExists = users.some((u) => u.email === email);
    if (emailExists) {
      return res.status(400).json({ error: "Este e-mail j\xE1 est\xE1 sendo utilizado." });
    }
    const assignedRole = role || "patient";
    const prefix = assignedRole === "patient" ? "patient_" : "user_";
    const userId = prefix + Date.now();
    const newUser = {
      objectId: userId,
      username: email,
      email,
      fullName: finalFullName,
      phone: phone || "",
      role: assignedRole,
      clinicId,
      clinic: { __type: "Pointer", className: "Clinic", objectId: clinicId },
      password,
      isActive: true
    };
    if (assignedRole === "doctor") {
      newUser.workDays = [1, 2, 3, 4, 5];
      newUser.workStartHour = "08:00";
      newUser.workEndHour = "18:00";
    }
    const createdUser = await db.createUser(newUser);
    if (assignedRole === "patient") {
      const newPatient = {
        objectId: userId,
        fullName,
        cpf: cpf || "",
        birthDate: birthDate || "",
        gender: gender || "",
        phone: phone || "",
        whatsapp: phone || "",
        email,
        status: "active",
        clinicId,
        createdBy: userId
      };
      await db.createPatient(newPatient);
    }
    const clinic = await db.getClinic(clinicId);
    res.json({
      sessionToken: "session_" + createdUser.objectId,
      user: { ...createdUser, clinicDetails: clinic }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/auth/register-clinic", async (req, res) => {
  const { clinicName, document, phone, email, adminName, adminEmail, password } = req.body;
  const clinicId = "clinic_" + Date.now();
  const userId = "user_" + Date.now();
  const newClinic = {
    objectId: clinicId,
    name: clinicName,
    document,
    phone,
    email,
    address: "Endere\xE7o comercial preenchido nas configura\xE7\xF5es",
    subscriptionStatus: "trial",
    currentPlan: "Starter",
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1e3).toISOString()
  };
  try {
    const createdClinic = await db.createClinic(newClinic);
    const actualClinicId = createdClinic.objectId || clinicId;
    const newUser = {
      objectId: userId,
      username: adminEmail,
      fullName: adminName || req.body.fullName || req.body.name || (adminEmail ? adminEmail.split("@")[0] : "Gestor"),
      email: adminEmail,
      password: password || "demo123",
      phone,
      role: "clinic_owner",
      clinicId: actualClinicId,
      clinic: { __type: "Pointer", className: "Clinic", objectId: actualClinicId },
      isActive: true,
      workDays: [1, 2, 3, 4, 5],
      workStartHour: "08:00",
      workEndHour: "18:00"
    };
    const createdUser = await db.createUser(newUser);
    res.json({
      sessionToken: "session_" + createdUser.objectId,
      user: { ...createdUser, clinicDetails: createdClinic }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/patients", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = await db.getPatients({ clinicId });
    res.json({ results: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/patients", async (req, res) => {
  try {
    const patientData = {
      objectId: "p_" + Date.now(),
      ...req.body,
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const created = await db.createPatient(patientData);
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.updatePatient(id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Paciente n\xE3o encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.deletePatient(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/appointments", async (req, res) => {
  const { clinicId, patientId } = req.query;
  try {
    const queryObj = { clinicId };
    if (patientId) {
      queryObj.patientId = patientId;
    }
    const list = await db.getAppointments(queryObj) || [];
    const patients = await db.getPatients({ clinicId }) || [];
    const users = await db.getUsers() || [];
    const result = list.map((a) => {
      const patient = patients.find((p) => p.objectId === a.patientId);
      const professional = users.find((u) => u.objectId === a.professionalId) || { fullName: "Profissional Geral" };
      return { ...a, patient, professional };
    });
    res.json({ results: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/appointments", async (req, res) => {
  const appt = {
    objectId: "a_" + Date.now(),
    ...req.body
  };
  try {
    const users = await db.getUsers();
    const doctor = users.find((u) => u.objectId === appt.professionalId);
    if (doctor) {
      const dateObj = /* @__PURE__ */ new Date(appt.date + "T00:00:00");
      const dayOfWeek = dateObj.getDay();
      if (doctor.workDays && Array.isArray(doctor.workDays)) {
        if (!doctor.workDays.includes(dayOfWeek)) {
          const weekdaysNames = ["Domingo", "Segunda-feira", "Ter\xE7a-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "S\xE1bado"];
          const allowedDays = doctor.workDays.map((d) => weekdaysNames[d]).join(", ");
          return res.status(400).json({
            error: `O(A) ${doctor.fullName} n\xE3o atende neste dia da semana (${weekdaysNames[dayOfWeek]}). Dias dispon\xEDveis: ${allowedDays}.`
          });
        }
      }
      if (doctor.workStartHour && doctor.workEndHour) {
        if (appt.startTime < doctor.workStartHour || appt.startTime > doctor.workEndHour) {
          return res.status(400).json({
            error: `Hor\xE1rio fora da escala de atendimento do(a) ${doctor.fullName} (${doctor.workStartHour} \xE0s ${doctor.workEndHour}).`
          });
        }
      }
    }
    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const startMins = toMinutes(appt.startTime);
    const endMins = toMinutes(appt.endTime);
    if (endMins <= startMins) {
      return res.status(400).json({
        error: "O hor\xE1rio de t\xE9rmino deve ser posterior ao hor\xE1rio de in\xEDcio."
      });
    }
    if (endMins - startMins < 30) {
      return res.status(400).json({
        error: "A consulta deve ter uma dura\xE7\xE3o m\xEDnima de 30 a 40 minutos para garantir o tempo de atendimento e evitar marca\xE7\xF5es em cima da outra."
      });
    }
    const appointments = await db.getAppointments({ professionalId: appt.professionalId, date: appt.date });
    const isConflict = appointments.some((a) => {
      if (a.status === "canceled") return false;
      const aStart = toMinutes(a.startTime);
      const aEnd = toMinutes(a.endTime);
      return startMins < aEnd && aStart < endMins;
    });
    if (isConflict) {
      return res.status(400).json({
        error: "O m\xE9dico j\xE1 possui uma consulta agendada que coincide ou conflita com este per\xEDodo. Mantenha um intervalo protetivo de pelo menos 30 a 40 minutos."
      });
    }
    const created = await db.createAppointment(appt);
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.updateAppointment(id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Consulta n\xE3o encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/medical-records", async (req, res) => {
  const { patientId, clinicId } = req.query;
  try {
    const queryObj = { clinicId };
    if (patientId) {
      queryObj.patientId = patientId;
    }
    const list = await db.getMedicalRecords(queryObj) || [];
    const users = await db.getUsers() || [];
    const result = list.map((m) => {
      const professional = users.find((u) => u.objectId === m.professionalId) || { fullName: "Profissional" };
      return { ...m, professional };
    });
    res.json({ results: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/medical-records", async (req, res) => {
  try {
    const record = {
      objectId: "m_" + Date.now(),
      ...req.body,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const created = await db.createMedicalRecord(record);
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/payments", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = await db.getPayments({ clinicId }) || [];
    const patients = await db.getPatients({ clinicId }) || [];
    const result = list.map((f) => {
      const patient = patients.find((p) => p.objectId === f.patientId);
      return { ...f, patient };
    });
    res.json({ results: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/payments", async (req, res) => {
  try {
    const p = {
      objectId: "f_" + Date.now(),
      ...req.body,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const created = await db.createPayment(p);
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/team", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = await db.getUsers(clinicId ? { clinicId } : {}) || [];
    const filtered = list.filter(
      (u) => (!clinicId || u.clinicId === clinicId || u.clinic?.objectId === clinicId) && u.role !== "patient"
    );
    res.json({ results: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/team", async (req, res) => {
  try {
    const userId = "user_" + Date.now();
    const newUser = {
      objectId: userId,
      workDays: [1, 2, 3, 4, 5],
      workStartHour: "08:00",
      workEndHour: "18:00",
      ...req.body,
      fullName: req.body.fullName || req.body.name || (req.body.email ? req.body.email.split("@")[0] : "Profissional"),
      clinic: { __type: "Pointer", className: "Clinic", objectId: req.body.clinicId },
      isActive: true
    };
    const created = await db.createUser(newUser);
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/api/team/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.updateUser(id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: "Membro da equipe n\xE3o encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/sim-checkout-success", async (req, res) => {
  const { clinicId, plan } = req.body;
  try {
    const clinic = await db.getClinic(clinicId);
    if (clinic) {
      const updated = await db.updateClinic(clinicId, {
        subscriptionStatus: "active",
        currentPlan: plan || "Pro",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
      });
      res.json({ success: true, clinic: updated });
    } else {
      res.status(404).json({ error: "Cl\xEDnica n\xE3o encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
var startServer = async () => {
  if (process.env.PARSE_APP_ID) {
    await bootstrapBack4App();
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClinicFlow CRM Server rodando em http://0.0.0.0:${PORT}`);
  });
};
startServer().catch((err) => {
  console.error("Erro iniciando o ClinicFlow Server:", err);
});
//# sourceMappingURL=server.cjs.map
