import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_BASE =
  process.env.FRONTEND_BASE_URL || (isProd ? "https://pcu.com.do" : "http://localhost:5173");
const SERVER_BASE =
  process.env.SERVER_PUBLIC_BASE_URL ||
  (isProd
    ? "https://playcenter-universal.onrender.com"
    : "http://localhost:5000");
const CARDNET_BASE = isProd
  ? "https://ecommerce.cardnet.com.do"
  : "https://lab.cardnet.com.do";

// Merchant configuration (use env in prod)
const ACQUIRER_CODE = process.env.CARDNET_ACQUIRER_CODE || "349";
const MERCHANT_TYPE = process.env.CARDNET_MERCHANT_TYPE || "7997";
const MERCHANT_NUMBER = process.env.CARDNET_MERCHANT_NUMBER || "349000000";
const MERCHANT_TERMINAL = process.env.CARDNET_MERCHANT_TERMINAL || "58585858";
const MERCHANT_TERMINAL_AMEX = process.env.CARDNET_MERCHANT_TERMINAL_AMEX || "00000001";
const MERCHANT_NAME =
  (process.env.CARDNET_MERCHANT_NAME || "PLAYCENTER UNIVERSAL DO").toUpperCase();

// Guardar SESSION → session-key en memoria (⚠️ se borra si Render reinicia el server)
const sessions = {};

// Health check endpoint - respuesta mínima y rápida
router.get("/health", (req, res) => {
  res.status(200).end(); // Sin JSON, solo 200 OK
});

// Crear sesión con CardNet - OPTIMIZADO
router.post("/create-session", async (req, res) => {
  try {
    const { total } = req.body;
    const now = Date.now();
    const ordId = `ORD${now}`;
    const txId = String(Math.floor(100000 + Math.random() * 900000)); // 6 dígitos

    // Timeout de 10 segundos para evitar esperas largas
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${CARDNET_BASE}/sessions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Connection": "keep-alive"
        },
        body: JSON.stringify({
          TransactionType: "0200",
          CurrencyCode: "214",
          AcquiringInstitutionCode: ACQUIRER_CODE,
          MerchantType: MERCHANT_TYPE,
          MerchantNumber: MERCHANT_NUMBER,
          MerchantTerminal: MERCHANT_TERMINAL,
          MerchantTerminal_amex: MERCHANT_TERMINAL_AMEX,
          ReturnUrl: `${SERVER_BASE}/cardnet/return`,
          CancelUrl: `${SERVER_BASE}/cardnet/cancel`,
          PageLanguaje: "ESP",
          OrdenId: ordId,
          TransactionId: txId,
          Tax: "000000000000",
          MerchantName: MERCHANT_NAME,
          AVS: "SANTO DOMINGO DO",
          Amount: String(total),
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Cardnet HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.SESSION && data["session-key"]) {
        sessions[data.SESSION] = data["session-key"];
        // Respuesta rápida sin data extra
        return res.json({ SESSION: data.SESSION });
      } else {
        return res.status(400).json({ error: "Sesión inválida" });
      }
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: "Timeout conectando con Cardnet" });
      }
      throw fetchError;
    }
  } catch (error) {
    return res.status(500).json({ error: "Error del servidor" });
  }
});

// Obtener session-key guardado
router.get("/get-sk/:session", (req, res) => {
  const sk = sessions[req.params.session];
  if (sk) {
    res.json({ sk });
  } else {
    res.status(404).json({ error: "Session-key no encontrado" });
  }
});

// Verificar transacción en CardNet
router.get("/verify/:session/:sk", async (req, res) => {
  try {
    const { session, sk } = req.params;
    const response = await fetch(
      `${CARDNET_BASE}/sessions/${session}?sk=${sk}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error verificando transacción:", error);
    res.status(500).json({ error: "Error verificando transacción" });
  }
});

// ✅ Endpoints que CardNet llama (Render → redirige al frontend en Vercel)
router.post("/return", express.urlencoded({ extended: true }), (req, res) => {
  const session = req.body.SESSION || req.query.SESSION;
  console.log("<< Return de CardNet:", req.body);

  if (session) {
    res.redirect(`${FRONTEND_BASE}/payment/pending?session=${session}`);
  } else {
    res.redirect(`${FRONTEND_BASE}/payment/cancel`);
  }
});

router.post("/cancel", express.urlencoded({ extended: true }), (req, res) => {
  const session = req.body.SESSION || req.query.SESSION;
  console.log("<< Cancel de CardNet:", req.body);

  if (session) {
    res.redirect(`${FRONTEND_BASE}/payment/cancel?session=${session}`);
  } else {
    res.redirect(`${FRONTEND_BASE}/payment/cancel`);
  }
});

export default router;
