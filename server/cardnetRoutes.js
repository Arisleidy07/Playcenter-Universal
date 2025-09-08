import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Guardar SESSION → session-key en memoria (⚠️ se borra si Render reinicia el server)
const sessions = {};

// Crear sesión con CardNet
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

        // 👉 Render maneja estos endpoints
        ReturnUrl: "https://playcenter-universal.onrender.com/cardnet/return",
        CancelUrl: "https://playcenter-universal.onrender.com/cardnet/cancel",

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
      `https://lab.cardnet.com.do/sessions/${session}?sk=${sk}`
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
    res.redirect(`https://pcu.com.do/payment/pending?session=${session}`);
  } else {
    res.redirect("https://pcu.com.do/payment/cancel");
  }
});

router.post("/cancel", express.urlencoded({ extended: true }), (req, res) => {
  const session = req.body.SESSION || req.query.SESSION;
  console.log("<< Cancel de CardNet:", req.body);

  if (session) {
    res.redirect(`https://pcu.com.do/payment/cancel?session=${session}`);
  } else {
    res.redirect("https://pcu.com.do/payment/cancel");
  }
});

export default router;
