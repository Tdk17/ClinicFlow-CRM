import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

// Standard port in AI Studio is 3000
const PORT = 3000;
const app = express();

// Middlewares
// Note: webhook needs raw body for signature verification, so we parse JSON only for other routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook" || req.originalUrl === "/api/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Lazy-loaded Stripe Client Helper
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null; // Gracefully handle missing key for demo purposes
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeClient;
}

// Memory-based database state for Demo/Simulated mode
// This ensures that the application is fully interactive even without Back4App!
let demoClinics: Record<string, any> = {
  "demo-clinic": {
    objectId: "demo-clinic",
    name: "Clínica Saúde & Vida",
    document: "12.345.678/0001-90",
    phone: "(11) 98765-4321",
    email: "contato@saudevida.com.br",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    subscriptionStatus: "trial", // trial, active, past_due, canceled, unpaid, expired
    currentPlan: "Starter",
    stripeCustomerId: "cus_demo123",
    stripeSubscriptionId: "sub_demo123",
    subscriptionEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
};

let demoUsers: Record<string, any> = {
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
    workDays: [2, 4], // Terça e Quinta (twice a week)
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
    isActive: true,
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
    workDays: [1, 3], // Segunda e Quarta (twice a week)
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
    isActive: true,
  }
};

let demoPatients: any[] = [
  {
    objectId: "p1",
    fullName: "Ana Maria de Souza",
    cpf: "123.456.789-00",
    birthDate: "1985-04-12",
    gender: "Feminino",
    phone: "(11) 98888-5555",
    whatsapp: "(11) 98888-5555",
    email: "ana.maria@gmail.com",
    address: "Rua das Flores, 123 - São Paulo - SP",
    emergencyContact: "Carlos Souza (Marido) - (11) 97777-6666",
    notes: "Paciente com hipertensão leve. Alérgica a Dipirona.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
    address: "Alameda Santos, 450 - Cerqueira César, São Paulo - SP",
    emergencyContact: "Marta Costa (Mãe) - (11) 96666-5555",
    notes: "Asmático. Pratica esportes de alto rendimento.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
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
    address: "Rua Augusta, 800 - Consolação, São Paulo - SP",
    emergencyContact: "Felipe Rocha (Irmão) - (11) 95555-4444",
    notes: "Diabetes tipo 2 controlado com metformina.",
    status: "active",
    clinicId: "demo-clinic",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let demoAppointments: any[] = [
  {
    objectId: "a1",
    clinicId: "demo-clinic",
    patientId: "p1",
    professionalId: "demo-admin",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "09:30",
    status: "confirmed", // scheduled, confirmed, attended, canceled, no_show
    reason: "Retorno pós-exames cardiológicos",
    notes: "Verificar exames de ecocardiograma.",
    createdBy: "demo-admin"
  },
  {
    objectId: "a2",
    clinicId: "demo-clinic",
    patientId: "p2",
    professionalId: "demo-doctor",
    date: new Date().toISOString().split("T")[0],
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
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "10:30",
    status: "scheduled",
    reason: "Consulta periódica de controle de glicemia",
    notes: "Paciente trará diário alimentar recente.",
    createdBy: "demo-receptionist"
  }
];

let demoMedicalRecords: any[] = [
  {
    objectId: "m1",
    clinicId: "demo-clinic",
    patientId: "p1",
    professionalId: "demo-admin",
    appointmentId: "a1",
    complaint: "Paciente relata cansaço leve e palpitações esporádicas à noite.",
    diagnosis: "Hipertensão controlada, estresse moderado.",
    prescription: "Manter Losartana 50mg pela manhã. Recomendo atividade física leve.",
    exams: "Solicitado Holter de 24h e teste ergométrico.",
    observations: "Retornar em 30 dias com os exames solicitados.",
    privateNotes: "Verificar se paciente está dormindo bem.",
    createdAt: new Date().toISOString()
  }
];

let demoPayments: any[] = [
  {
    objectId: "f1",
    clinicId: "demo-clinic",
    patientId: "p1",
    appointmentId: "a1",
    amount: 250.0,
    method: "pix", // dinheiro, pix, cartão, convênio
    status: "paid", // pending, paid, canceled
    dueDate: new Date().toISOString().split("T")[0],
    paidAt: new Date().toISOString(),
    description: "Consulta presencial cardiologia",
    createdAt: new Date().toISOString()
  },
  {
    objectId: "f2",
    clinicId: "demo-clinic",
    patientId: "p2",
    appointmentId: "a2",
    amount: 300.0,
    method: "cartão",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    paidAt: null,
    description: "Avaliação de medicina esportiva",
    createdAt: new Date().toISOString()
  }
];

// Helper to simulate standard Parse REST API responses
app.get("/api/demo-config", (req, res) => {
  res.json({
    hasRealStripe: !!process.env.STRIPE_SECRET_KEY,
    hasRealParse: !!process.env.PARSE_APP_ID,
    frontendUrl: process.env.APP_URL || `http://localhost:${PORT}`
  });
});

// Create Stripe Checkout Session
const createCheckoutSessionHandler = async (req: express.Request, res: express.Response) => {
  const { planName, priceId, priceAmount, clinicId } = req.body;
  const frontendUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  console.log("Criando sessão checkout:", { planName, priceId, priceAmount, clinicId });

  const stripe = getStripe();
  if (!stripe) {
    // Demo Mode Simulation
    console.log("Stripe não configurado. Simulando sessão.");
    // We return a simulated URL which the frontend can handle to trigger direct success
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
          price: priceId, // Standard Stripe Price ID (e.g. price_123)
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${frontendUrl}/#/success?session_id={CHECKOUT_SESSION_ID}&clinicId=${clinicId}`,
      cancel_url: `${frontendUrl}/#/cancel?clinicId=${clinicId}`,
      metadata: {
        clinicId: clinicId,
        planName: planName,
      },
    });

    res.json({ url: session.url, id: session.id, isDemo: false });
  } catch (error: any) {
    console.error("Erro Stripe Checkout:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post("/create-checkout-session", createCheckoutSessionHandler);
app.post("/api/create-checkout-session", createCheckoutSessionHandler);

// Create Customer Portal Session
const createCustomerPortalSessionHandler = async (req: express.Request, res: express.Response) => {
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
      return_url: `${frontendUrl}/#/configuracoes`,
    });
    res.json({ url: session.url, isDemo: false });
  } catch (error: any) {
    console.error("Erro Portal Stripe:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post("/create-customer-portal-session", createCustomerPortalSessionHandler);
app.post("/api/create-customer-portal-session", createCustomerPortalSessionHandler);

// Handle Stripe Webhooks
const handleWebhook = async (req: express.Request, res: express.Response) => {
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
      // Need raw body for validation
      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });
      req.on("end", async () => {
        try {
          event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
          await processStripeEvent(event);
          res.json({ received: true });
        } catch (err: any) {
          console.error("Erro validação webhook:", err.message);
          res.status(400).send(`Webhook Error: ${err.message}`);
        }
      });
    } else {
      // Direct parsing fallback (non-production or local test without signature verification)
      let bodyString = "";
      req.on("data", (chunk) => {
        bodyString += chunk;
      });
      req.on("end", async () => {
        try {
          event = JSON.parse(bodyString);
          await processStripeEvent(event);
          res.json({ received: true });
        } catch (err: any) {
          res.status(400).send("Failed to parse request body");
        }
      });
    }
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

app.post("/webhook", handleWebhook);
app.post("/api/webhook", handleWebhook);

// Process Stripe Events to update Back4App Parse DB
async function processStripeEvent(event: any) {
  console.log("Recebendo evento Stripe:", event.type);

  const parseAppId = process.env.PARSE_APP_ID;
  const parseMasterKey = process.env.PARSE_MASTER_KEY;
  const parseServerUrl = process.env.PARSE_SERVER_URL || "https://parseapi.back4app.com";

  if (!parseAppId) {
    console.log("Back4App não configurado. Salvando em memória para Demo.");
    // In demo mode, we mock the outcome.
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const clinicId = session.metadata?.clinicId || "demo-clinic";
      const planName = session.metadata?.planName || "Pro";
      if (demoClinics[clinicId]) {
        demoClinics[clinicId].subscriptionStatus = "active";
        demoClinics[clinicId].currentPlan = planName;
        demoClinics[clinicId].stripeCustomerId = session.customer || "cus_demo123";
        demoClinics[clinicId].stripeSubscriptionId = session.subscription || "sub_demo123";
        demoClinics[clinicId].subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }
    return;
  }

  // Live Back4App Updates
  const updateClinicSubscription = async (clinicId: string, subscriptionData: any) => {
    try {
      const url = `${parseServerUrl}/classes/Clinic/${clinicId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Master-Key": parseMasterKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptionData),
      });
      if (response.ok) {
        console.log(`Clínica ${clinicId} atualizada com sucesso no Back4App.`);
      } else {
        console.error("Falha ao atualizar clínica no Back4App:", await response.text());
      }
    } catch (e) {
      console.error("Erro conectando ao Back4App:", e);
    }
  };

  const createSubscriptionLog = async (logData: any) => {
    try {
      const url = `${parseServerUrl}/classes/Subscription`;
      await fetch(url, {
        method: "POST",
        headers: {
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Master-Key": parseMasterKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
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
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        await createSubscriptionLog({
          clinic: { __type: "Pointer", className: "Clinic", objectId: clinicId },
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          status: "active",
          planName: planName,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "brl",
        });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer;
      // Query Clinic by CustomerID to update
      try {
        const queryUrl = `${parseServerUrl}/classes/Clinic?where=${encodeURIComponent(
          JSON.stringify({ stripeCustomerId: stripeCustomerId })
        )}`;
        const qRes = await fetch(queryUrl, {
          headers: {
            "X-Parse-Application-Id": parseAppId,
            "X-Parse-Master-Key": parseMasterKey || "",
          },
        });
        if (qRes.ok) {
          const body: any = await qRes.json();
          const clinic = body.results?.[0];
          if (clinic) {
            const statusMap: Record<string, string> = {
              active: "active",
              trialing: "trial",
              past_due: "past_due",
              canceled: "canceled",
              unpaid: "unpaid",
              incomplete: "unpaid",
              incomplete_expired: "expired",
            };
            const appletStatus = statusMap[sub.status] || "active";

            await updateClinicSubscription(clinic.objectId, {
              subscriptionStatus: appletStatus,
              stripeSubscriptionId: sub.id,
              subscriptionEndsAt: new Date(sub.current_period_end * 1000).toISOString(),
            });
          }
        }
      } catch (e) {
        console.error("Erro localizando clínica no webhook:", e);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const stripeCustomerId = sub.customer;
      try {
        const queryUrl = `${parseServerUrl}/classes/Clinic?where=${encodeURIComponent(
          JSON.stringify({ stripeCustomerId: stripeCustomerId })
        )}`;
        const qRes = await fetch(queryUrl, {
          headers: {
            "X-Parse-Application-Id": parseAppId,
            "X-Parse-Master-Key": parseMasterKey || "",
          },
        });
        if (qRes.ok) {
          const body: any = await qRes.json();
          const clinic = body.results?.[0];
          if (clinic) {
            await updateClinicSubscription(clinic.objectId, {
              subscriptionStatus: "canceled",
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

// -------------------------------------------------------------
// Back4App / Parse CRM Integration Helpers
// -------------------------------------------------------------
const useParse = !!process.env.PARSE_APP_ID;
const parseAppId = process.env.PARSE_APP_ID;
const parseRestKey = process.env.PARSE_REST_KEY;
const parseMasterKey = process.env.PARSE_MASTER_KEY;
const parseServerUrl = process.env.PARSE_SERVER_URL || "https://parseapi.back4app.com";

async function parseFetch(endpoint: string, options: any = {}) {
  const headers = {
    "X-Parse-Application-Id": parseAppId || "",
    "X-Parse-REST-API-Key": parseRestKey || "",
    ...(parseMasterKey ? { "X-Parse-Master-Key": parseMasterKey } : {}),
    "Content-Type": "application/json",
    ...(options.headers || {})
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

const db = {
  async getClinics() {
    if (useParse) {
      const data = await parseFetch("/classes/Clinic");
      return data.results;
    }
    return Object.values(demoClinics);
  },
  async getClinic(id: string) {
    if (useParse) {
      try {
        return await parseFetch(`/classes/Clinic/${id}`);
      } catch (e) {
        return null;
      }
    }
    return demoClinics[id] || null;
  },
  async createClinic(clinic: any) {
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
  async updateClinic(id: string, clinic: any) {
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

  async getUsers(queryObj: any = {}) {
    if (useParse) {
      const safeQuery: any = {};
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
    return Object.values(demoUsers).filter((u: any) => {
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
  async getUser(id: string) {
    if (useParse) {
      try {
        return await parseFetch(`/classes/TeamMember/${id}`);
      } catch (e) {
        return null;
      }
    }
    return demoUsers[id] || null;
  },
  async createUser(user: any) {
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
  async updateUser(id: string, user: any) {
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

  async getPatients(queryObj: any = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Patient?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoPatients.filter((p: any) => {
      for (const key in queryObj) {
        if (p[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createPatient(patient: any) {
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
  async updatePatient(id: string, patient: any) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = patient;
      await parseFetch(`/classes/Patient/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...patient, objectId: id };
    }
    const idx = demoPatients.findIndex((p: any) => p.objectId === id);
    if (idx !== -1) {
      demoPatients[idx] = { ...demoPatients[idx], ...patient };
      return demoPatients[idx];
    }
    return null;
  },
  async deletePatient(id: string) {
    if (useParse) {
      await parseFetch(`/classes/Patient/${id}`, {
        method: "DELETE"
      });
      return true;
    }
    demoPatients = demoPatients.filter((p: any) => p.objectId !== id);
    return true;
  },

  async getAppointments(queryObj: any = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Appointment?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoAppointments.filter((a: any) => {
      for (const key in queryObj) {
        if (a[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createAppointment(appt: any) {
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
  async updateAppointment(id: string, appt: any) {
    if (useParse) {
      const { objectId, createdAt, updatedAt, ...body } = appt;
      await parseFetch(`/classes/Appointment/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      return { ...appt, objectId: id };
    }
    const idx = demoAppointments.findIndex((a: any) => a.objectId === id);
    if (idx !== -1) {
      demoAppointments[idx] = { ...demoAppointments[idx], ...appt };
      return demoAppointments[idx];
    }
    return null;
  },

  async getMedicalRecords(queryObj: any = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/MedicalRecord?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoMedicalRecords.filter((m: any) => {
      for (const key in queryObj) {
        if (m[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createMedicalRecord(record: any) {
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

  async getPayments(queryObj: any = {}) {
    if (useParse) {
      const data = await parseFetch(`/classes/Payment?where=${encodeURIComponent(JSON.stringify(queryObj))}`);
      return data.results;
    }
    return demoPayments.filter((f: any) => {
      for (const key in queryObj) {
        if (f[key] !== queryObj[key]) return false;
      }
      return true;
    });
  },
  async createPayment(payment: any) {
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

// -------------------------------------------------------------
// Auto Bootstrap & Seeder for Back4App Parse Classes
// -------------------------------------------------------------
async function bootstrapBack4App() {
  if (!useParse) return;
  
  console.log("Iniciando verificação de bootstrap para Back4App...");
  try {
    // 1. Clinics
    const existingClinics = await db.getClinics();
    const clinicIdMap: Record<string, string> = {};
    if (existingClinics.length === 0) {
      console.log("Nenhuma clínica encontrada no Back4App. Semeando clínicas padrão...");
      for (const c of Object.values(demoClinics)) {
        const created = await db.createClinic(c);
        clinicIdMap[c.objectId] = created.objectId;
      }
    } else {
      // Map existing demo-clinic to its found objectId
      const foundDemo = existingClinics.find((c: any) => c.name === "Clínica Saúde & Vida");
      if (foundDemo) {
        clinicIdMap["demo-clinic"] = foundDemo.objectId;
      }
    }
    
    // Fallback if map is empty
    if (!clinicIdMap["demo-clinic"]) {
      const allClinics = await db.getClinics();
      if (allClinics.length > 0) {
        clinicIdMap["demo-clinic"] = allClinics[0].objectId;
      }
    }
    
    const targetClinicId = clinicIdMap["demo-clinic"] || "demo-clinic";

    // 2. Users
    const existingUsers = await db.getUsers();
    const userIdMap: Record<string, string> = {};
    if (existingUsers.length === 0) {
      console.log("Nenhum usuário/profissional encontrado no Back4App. Semeando usuários padrão...");
      for (const u of Object.values(demoUsers)) {
        const userToCreate = { ...u };
        userToCreate.clinicId = targetClinicId;
        userToCreate.clinic = { __type: "Pointer", className: "Clinic", objectId: targetClinicId };
        const created = await db.createUser(userToCreate);
        userIdMap[u.objectId] = created.objectId;
      }
    } else {
      // Map demo users
      const foundAdmin = existingUsers.find((u: any) => u.username === "peidinho16@gmail.com");
      if (foundAdmin) {
        userIdMap["demo-admin"] = foundAdmin.objectId;
      }
      const foundRecep = existingUsers.find((u: any) => u.username === "recepcao@clinicflow.com");
      if (foundRecep) {
        userIdMap["recepcao-demo"] = foundRecep.objectId;
      }
    }

    // 3. Patients
    const existingPatients = await db.getPatients();
    const patientIdMap: Record<string, string> = {};
    if (existingPatients.length === 0) {
      console.log("Nenhum paciente encontrado no Back4App. Semeando pacientes padrão...");
      for (const p of demoPatients) {
        const patientToCreate = { ...p };
        patientToCreate.clinicId = targetClinicId;
        const created = await db.createPatient(patientToCreate);
        patientIdMap[p.objectId] = created.objectId;
      }
    } else {
      // Map patients
      for (const p of existingPatients) {
        const originDemo = demoPatients.find((dp: any) => dp.email === p.email || dp.fullName === p.fullName);
        if (originDemo) {
          patientIdMap[originDemo.objectId] = p.objectId;
        }
      }
    }

    // 4. Appointments
    const existingAppointments = await db.getAppointments();
    if (existingAppointments.length === 0) {
      console.log("Nenhuma consulta encontrada no Back4App. Semeando consultas padrão...");
      for (const a of demoAppointments) {
        const apptToCreate = { ...a };
        apptToCreate.clinicId = targetClinicId;
        apptToCreate.patientId = patientIdMap[a.patientId] || a.patientId;
        apptToCreate.professionalId = userIdMap[a.professionalId] || a.professionalId;
        apptToCreate.createdBy = userIdMap[a.createdBy] || a.createdBy;
        await db.createAppointment(apptToCreate);
      }
    }
    
    // 5. Medical Records
    const existingMedicalRecords = await db.getMedicalRecords();
    if (existingMedicalRecords.length === 0) {
      console.log("Nenhum prontuário encontrado no Back4App. Semeando prontuários padrão...");
      for (const m of demoMedicalRecords) {
        const recordToCreate = { ...m };
        recordToCreate.clinicId = targetClinicId;
        recordToCreate.patientId = patientIdMap[m.patientId] || m.patientId;
        recordToCreate.professionalId = userIdMap[m.professionalId] || m.professionalId;
        await db.createMedicalRecord(recordToCreate);
      }
    }
    
    // 6. Payments
    const existingPayments = await db.getPayments();
    if (existingPayments.length === 0) {
      console.log("Nenhum pagamento/financeiro encontrado no Back4App. Semeando pagamentos padrão...");
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

// -------------------------------------------------------------
// REST API Mock/Live Unified Endpoints
// -------------------------------------------------------------
app.get("/api/public/clinics", async (req, res) => {
  try {
    const clinics = (await db.getClinics()) || [];
    const list = clinics.map((c: any) => ({
      objectId: c.objectId,
      name: c.name
    }));
    res.json({ results: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const users = await db.getUsers();
    const user = users.find(
      (u: any) => (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
      if (!user.isActive && user.role !== "patient") {
        return res.status(403).json({ error: "Esta conta está temporariamente desativada." });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/register-patient", async (req, res) => {
  const { fullName, cpf, birthDate, gender, phone, email, password, clinicId, role } = req.body;
  const finalFullName = fullName || req.body.name || (email ? email.split("@")[0] : "");
  
  if (!finalFullName || !email || !password || !clinicId) {
    return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios." });
  }

  try {
    const users = await db.getUsers();
    const emailExists = users.some((u: any) => u.email === email);
    if (emailExists) {
      return res.status(400).json({ error: "Este e-mail já está sendo utilizado." });
    }

    const assignedRole = role || "patient";
    const prefix = assignedRole === "patient" ? "patient_" : "user_";
    const userId = prefix + Date.now();

    const newUser: any = {
      objectId: userId,
      username: email,
      email: email,
      fullName: finalFullName,
      phone: phone || "",
      role: assignedRole,
      clinicId: clinicId,
      clinic: { __type: "Pointer", className: "Clinic", objectId: clinicId },
      password: password,
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
  } catch (error: any) {
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
    address: "Endereço comercial preenchido nas configurações",
    subscriptionStatus: "trial",
    currentPlan: "Starter",
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/patients", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = await db.getPatients({ clinicId: clinicId as string });
    res.json({ results: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const patientData = {
      objectId: "p_" + Date.now(),
      ...req.body,
      status: "active",
      createdAt: new Date().toISOString()
    };
    const created = await db.createPatient(patientData);
    res.json(created);
  } catch (error: any) {
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
      res.status(404).json({ error: "Paciente não encontrado" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.deletePatient(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/appointments", async (req, res) => {
  const { clinicId, patientId } = req.query;
  try {
    const queryObj: any = { clinicId: clinicId as string };
    if (patientId) {
      queryObj.patientId = patientId as string;
    }
    const list = (await db.getAppointments(queryObj)) || [];
    const patients = (await db.getPatients({ clinicId: clinicId as string })) || [];
    const users = (await db.getUsers()) || [];

    const result = list.map((a: any) => {
      const patient = patients.find((p: any) => p.objectId === a.patientId);
      const professional = users.find((u: any) => u.objectId === a.professionalId) || { fullName: "Profissional Geral" };
      return { ...a, patient, professional };
    });
    res.json({ results: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  const appt = {
    objectId: "a_" + Date.now(),
    ...req.body,
  };

  try {
    const users = await db.getUsers();
    const doctor = users.find((u: any) => u.objectId === appt.professionalId);
    if (doctor) {
      const dateObj = new Date(appt.date + "T00:00:00");
      const dayOfWeek = dateObj.getDay();

      if (doctor.workDays && Array.isArray(doctor.workDays)) {
        if (!doctor.workDays.includes(dayOfWeek)) {
          const weekdaysNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
          const allowedDays = doctor.workDays.map((d: number) => weekdaysNames[d]).join(", ");
          return res.status(400).json({ 
            error: `O(A) ${doctor.fullName} não atende neste dia da semana (${weekdaysNames[dayOfWeek]}). Dias disponíveis: ${allowedDays}.` 
          });
        }
      }

      if (doctor.workStartHour && doctor.workEndHour) {
        if (appt.startTime < doctor.workStartHour || appt.startTime > doctor.workEndHour) {
          return res.status(400).json({ 
            error: `Horário fora da escala de atendimento do(a) ${doctor.fullName} (${doctor.workStartHour} às ${doctor.workEndHour}).` 
          });
        }
      }
    }

    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const startMins = toMinutes(appt.startTime);
    const endMins = toMinutes(appt.endTime);

    if (endMins <= startMins) {
      return res.status(400).json({
        error: "O horário de término deve ser posterior ao horário de início."
      });
    }

    if (endMins - startMins < 30) {
      return res.status(400).json({
        error: "A consulta deve ter uma duração mínima de 30 a 40 minutos para garantir o tempo de atendimento e evitar marcações em cima da outra."
      });
    }

    const appointments = await db.getAppointments({ professionalId: appt.professionalId, date: appt.date });
    const isConflict = appointments.some((a: any) => {
      if (a.status === "canceled") return false;
      const aStart = toMinutes(a.startTime);
      const aEnd = toMinutes(a.endTime);
      return startMins < aEnd && aStart < endMins;
    });

    if (isConflict) {
      return res.status(400).json({ 
        error: "O médico já possui uma consulta agendada que coincide ou conflita com este período. Mantenha um intervalo protetivo de pelo menos 30 a 40 minutos." 
      });
    }

    const created = await db.createAppointment(appt);
    res.json(created);
  } catch (error: any) {
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
      res.status(404).json({ error: "Consulta não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/medical-records", async (req, res) => {
  const { patientId, clinicId } = req.query;
  try {
    const queryObj: any = { clinicId: clinicId as string };
    if (patientId) {
      queryObj.patientId = patientId as string;
    }
    const list = (await db.getMedicalRecords(queryObj)) || [];
    const users = (await db.getUsers()) || [];

    const result = list.map((m: any) => {
      const professional = users.find((u: any) => u.objectId === m.professionalId) || { fullName: "Profissional" };
      return { ...m, professional };
    });
    res.json({ results: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/medical-records", async (req, res) => {
  try {
    const record = {
      objectId: "m_" + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const created = await db.createMedicalRecord(record);
    res.json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/payments", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = (await db.getPayments({ clinicId: clinicId as string })) || [];
    const patients = (await db.getPatients({ clinicId: clinicId as string })) || [];

    const result = list.map((f: any) => {
      const patient = patients.find((p: any) => p.objectId === f.patientId);
      return { ...f, patient };
    });
    res.json({ results: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const p = {
      objectId: "f_" + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    const created = await db.createPayment(p);
    res.json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/team", async (req, res) => {
  const { clinicId } = req.query;
  try {
    const list = (await db.getUsers(clinicId ? { clinicId } : {})) || [];
    const filtered = list.filter((u: any) => 
      (!clinicId || u.clinicId === clinicId || u.clinic?.objectId === clinicId) &&
      u.role !== "patient"
    );
    res.json({ results: filtered });
  } catch (error: any) {
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
  } catch (error: any) {
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
      res.status(404).json({ error: "Membro da equipe não encontrado." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sync / Update simulated subscription direct success (via Stripe redirect)
app.post("/api/sim-checkout-success", async (req, res) => {
  const { clinicId, plan } = req.body;
  try {
    const clinic = await db.getClinic(clinicId);
    if (clinic) {
      const updated = await db.updateClinic(clinicId, {
        subscriptionStatus: "active",
        currentPlan: plan || "Pro",
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      res.json({ success: true, clinic: updated });
    } else {
      res.status(404).json({ error: "Clínica não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});



// Vite Dev Server / Static Ingress configuration
const startServer = async () => {
  // Bootstrap Back4App if configured
  if (process.env.PARSE_APP_ID) {
    await bootstrapBack4App();
  }

  // Vite dev server middleware in non-production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ClinicFlow CRM Server rodando em http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Erro iniciando o ClinicFlow Server:", err);
});
