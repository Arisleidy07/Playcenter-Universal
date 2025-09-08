// server/cardnetRoutes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const sessions = {}; // Guardar SESSION → session-key

// Crear sesión
router.post("/create-session", async (req, res) => {
  try {
    const { total } = req.body;

    const response = await fetch("https://lab.cardnet.com.do/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        TransactionType: "0200",
        CurrencyCode: "214",
        AcquiringInstitutionCode: "349",
        MerchantType: "7997",
        MerchantNumber: "349000000",
        MerchantTerminal: "58585858",
        MerchantTerminal_amex: "00000001",
        ReturnUrl: "https://www.pcu.com.do/cardnet/return",
        CancelUrl: "https://www.pcu.com.do/cardnet/cancel",
        PageLanguaje: "ESP",
        OrdenId: "ORD12345",
        TransactionId: "TX1234",
        Tax: "000000000000",
        MerchantName: "PLAYCENTER UNIVERSAL DO",
        AVS: "SANTO DOMINGO DO",
        Amount: String(total),
      }),
    });

    const data = await response.json();
    if (data.SESSION && data["session-key"]) {
      sessions[data.SESSION] = data["session-key"];
      res.json({ SESSION: data.SESSION });
    } else {
      res.status(400).json({ error: "No se pudo crear la sesión", raw: data });
    }
  } catch (error) {
    console.error("Error creando sesión:", error);
    res.status(500).json({ error: "Error creando sesión" });
  }
});

// Obtener session-key guardado
router.get("/get-sk/:session", (req, res) => {
  const sk = sessions[req.params.session];
  if (sk) res.json({ sk });
  else res.status(404).json({ error: "Session-key no encontrado" });
});

// Verificar transacción
router.get("/verify/:session/:sk", async (req, res) => {
  try {
    const { session, sk } = req.params;
    const response = await fetch(
      `https://lab.cardnet.com.do/sessions/${session}?sk=${sk}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error verificando transacción:", error);
    res.status(500).json({ error: "Error verificando transacción" });
  }
});

// ✅ Nuevos endpoints
router.post("/return", (req, res) => {
  const session = req.body.SESSION || req.query.SESSION;
  if (session) {
    res.redirect(`https://www.pcu.com.do/payment/pending?session=${session}`);
  } else {
    res.redirect("https://www.pcu.com.do/payment/cancel");
  }
});

router.post("/cancel", (req, res) => {
  res.redirect("https://www.pcu.com.do/payment/cancel");
});

export default router;
