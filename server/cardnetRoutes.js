import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Guardar SESSION → session-key
const sessions = {};

// Crear sesión
router.post("/create-session", async (req, res) => {
  console.log(">> Recibí petición a /cardnet/create-session", req.body);

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
        ReturnUrl: "https://pcu.com.do/api/cardnet-return",
        CancelUrl: "https://pcu.com.do/api/cardnet-return",
        PageLanguaje: "ESP",
        OrdenId: "ORD12345",
        TransactionId: "TX1234",
        Tax: "000000000000",
        MerchantName: "PLAYCENTER UNIVERSAL DO",
        AVS: "SANTO DOMINGO DO",
        Amount: String(total),
        "3DS_email": "cliente@correo.com",
        "3DS_mobilePhone": "8090000000",
        "3DS_workPhone": "8090000001",
        "3DS_homePhone": "8090000002",
        "3DS_billAddr_line1": "Direccion 1",
        "3DS_billAddr_line2": "Direccion 2",
        "3DS_billAddr_line3": "Direccion 3",
        "3DS_billAddr_city": "Santo Domingo",
        "3DS_billAddr_state": "DO",
        "3DS_billAddr_country": "DO",
        "3DS_billAddr_postCode": "10101"
      })
    });

    const data = await response.json();
    console.log("Respuesta CardNet:", data);

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

export default router;
