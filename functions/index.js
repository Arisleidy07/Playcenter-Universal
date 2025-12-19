const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const sgMail = require("@sendgrid/mail");
const { Resend } = require("resend");

// Obtener configuración de Firebase
const config = functions.config();
sgMail.setApiKey(config.sendgrid?.apikey || process.env.SENDGRID_API_KEY);

// Inicializar Resend con API Key
const RESEND_API_KEY =
  config.resend?.apikey ||
  process.env.RESEND_API_KEY ||
  "re_dMpALXAH_DFC9Qp5XFkJ5kvKZJ533PUnm";
const resend = new Resend(RESEND_API_KEY);

// Configuración de email con dominio verificado pcu.com.do
const EMAIL_FROM =
  config.mail?.from || "Playcenter Universal <soporte@pcu.com.do>";
const SITE_URL = config.site?.url || "https://pcu.com.do";
// Logo URL - usar hosting de Firebase directamente
const LOGO_URL = "https://playcenter-universal.web.app/logo.JPEG";

const db = admin.firestore();
const messaging = admin.messaging();
const axios = require("axios");

// ============================================
// 1. CREAR SESIÓN DE CARDNET
// ============================================
exports.createCardnetSession = functions.https.onCall(async (data, context) => {
  try {
    const { amount, orderId } = data;

    if (!amount || amount <= 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Monto inválido"
      );
    }

    // Generar TransactionId único de 6 dígitos
    const transactionId = String(Date.now()).slice(-6);

    // Formatear monto en centavos (sin padding para LAB)
    const amountInCents = Math.round(amount * 100);
    const formattedAmount = String(amountInCents);

    // Calcular ITBIS (18%)
    const taxAmount = Math.round(amountInCents * 0.18);
    const formattedTax = String(taxAmount);

    // URLs según ambiente - usar origin del request (dominio de Vercel)
    const API_BASE =
      context.rawRequest?.headers?.origin ||
      context.rawRequest?.headers?.referer?.replace(/\/$/, "") ||
      "https://playcenter-universal.vercel.app";

    // Parámetros CORRECTOS según documentación Cardnet
    const requestBody = {
      TransactionType: "200", // Venta normal (sin el 0 inicial)
      CurrencyCode: "214", // DOP
      AcquiringInstitutionCode: "349",
      MerchantType: "7997", // LAB
      MerchantNumber: "349000000", // LAB
      MerchantTerminal: "58585858", // LAB
      MerchantTerminal_amex: "00000001",
      ReturnUrl: `${API_BASE}/payment/success`,
      CancelUrl: `${API_BASE}/payment/cancel`,
      PageLanguaje: "ESP",
      OrdenId: orderId || `ORD-${Date.now()}`,
      TransactionId: transactionId,
      Tax: formattedTax,
      MerchantName: "PLAYCENTER UNIVERSAL PRUEBAS DO",
      Amount: formattedAmount,
    };

    console.log("📤 Enviando solicitud a Cardnet:", requestBody);

    console.log("🔗 URL base detectada:", API_BASE);

    // Llamar al API de Cardnet con timeout reducido
    const response = await axios.post(
      "https://lab.cardnet.com.do/sessions",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000, // Reducir a 15 segundos
        validateStatus: function (status) {
          return status < 500; // Resolver si no es error de servidor
        },
      }
    );

    // Verificar respuesta de Cardnet
    if (!response.data || !response.data.SESSION) {
      console.error("❌ Respuesta inválida de Cardnet:", response.data);
      throw new Error(response.data?.error || "Cardnet no retornó SESSION");
    }

    console.log("✅ Respuesta de Cardnet:", response.data);

    return {
      success: true,
      session: response.data.SESSION,
      sessionKey: response.data["session-key"],
      orderId: requestBody.OrdenId,
      transactionId: requestBody.TransactionId,
    };
  } catch (error) {
    console.error("❌ Error creando sesión Cardnet:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    // Manejo específico de errores
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      throw new functions.https.HttpsError(
        "deadline-exceeded",
        "Cardnet tardó demasiado en responder. Intenta de nuevo."
      );
    }

    if (error.response?.status === 405) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Método HTTP no permitido por Cardnet"
      );
    }

    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error al crear sesión de pago",
      error.response?.data || { code: error.code }
    );
  }
});

// ============================================
// 2. VERIFICAR RESULTADO DE TRANSACCIÓN CARDNET
// ============================================
exports.verifyCardnetTransaction = functions.https.onCall(async (data) => {
  try {
    const { session, sessionKey } = data;

    if (!session || !sessionKey) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Sesión o clave inválida"
      );
    }

    console.log("🔍 Verificando transacción Cardnet:", session);

    // Consultar resultado
    const response = await axios.get(
      `https://lab.cardnet.com.do/sessions/${session}`,
      {
        params: { sk: sessionKey },
        timeout: 30000,
      }
    );

    console.log("✅ Resultado Cardnet:", response.data);

    return {
      success: true,
      ...response.data,
    };
  } catch (error) {
    console.error(
      "❌ Error verificando transacción:",
      error.response?.data || error.message
    );

    // Si la sesión no se encuentra (404), retornar info útil
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Session not found",
        message:
          "La sesión expiró o no existe. Las sesiones son válidas por 30 minutos.",
      };
    }

    throw new functions.https.HttpsError(
      "internal",
      "Error al verificar transacción",
      error.response?.data || error.message
    );
  }
});

// ============================================
// 3. ENVIAR EMAIL CUANDO SE CREA UNA ORDEN
// ============================================
exports.onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    // Evitar duplicados (idempotencia)
    if (order.emailSent) {
      console.log("Email ya enviado para pedido:", orderId);
      return null;
    }

    try {
      const to = order.email || order.customerEmail;
      if (!to) {
        console.error("No hay email en la orden:", orderId);
        return null;
      }

      const msg = {
        to,
        from: EMAIL_FROM,
        subject: `✅ Pedido recibido - #${orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 1.2em; font-weight: bold; color: #2563eb; margin-top: 10px; }
              .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; color: #6b7280; font-size: 0.9em; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎮 Playcenter Universal</h1>
                <p>¡Gracias por tu compra!</p>
              </div>
              <div class="content">
                <h2>Hola ${order.customerName || "Cliente"},</h2>
                <p>Hemos recibido tu pedido y lo estamos procesando.</p>
                
                <div class="order-details">
                  <h3>Detalles del pedido #${orderId}</h3>
                  <div class="item">
                    <span>Fecha:</span>
                    <span>${new Date(
                      order.createdAt?.toDate() || Date.now()
                    ).toLocaleDateString("es-DO")}</span>
                  </div>
                  <div class="item">
                    <span>Estado:</span>
                    <span><strong>${order.status || "Pendiente"}</strong></span>
                  </div>
                  <div class="item">
                    <span>Método de pago:</span>
                    <span>${order.paymentMethod || "Por confirmar"}</span>
                  </div>
                  ${
                    order.items
                      ? order.items
                          .map(
                            (item) => `
                    <div class="item">
                      <span>${item.name} x${item.quantity}</span>
                      <span>RD$${(item.price * item.quantity).toLocaleString(
                        "es-DO",
                        { minimumFractionDigits: 2 }
                      )}</span>
                    </div>
                  `
                          )
                          .join("")
                      : ""
                  }
                  <div class="total">
                    Total: RD$${(order.total || 0).toLocaleString("es-DO", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <p>Te notificaremos cuando tu pedido sea enviado.</p>
                <a href="${
                  config.site?.url || "https://pcu.com.do"
                }/perfil?seccion=pedidos" class="button">Ver mi pedido</a>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Playcenter Universal. Todos los derechos reservados.</p>
                <p>Si no realizaste este pedido, por favor contáctanos inmediatamente.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await sgMail.send(msg);
      console.log("✅ Email enviado a:", to);

      // Marcar como enviado
      await snap.ref.update({
        emailSent: true,
        emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("❌ Error al enviar email:", error);

      // Guardar error para reintento manual
      await snap.ref.update({
        emailError: error.message,
        emailAttempts: admin.firestore.FieldValue.increment(1),
      });

      return null;
    }
  });

// ============================================
// 2. ENVIAR PUSH NOTIFICATION CUANDO CAMBIA ESTADO DE ORDEN
// ============================================
exports.onOrderStatusChanged = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Solo si cambió el estado
    if (before.status === after.status) {
      return null;
    }

    const userId = after.userId;
    if (!userId) {
      console.log("No hay userId en la orden");
      return null;
    }

    try {
      // Obtener tokens FCM del usuario
      const tokensSnap = await db.collection(`users/${userId}/fcmTokens`).get();

      if (tokensSnap.empty) {
        console.log("Usuario no tiene tokens FCM");
        return null;
      }

      const tokens = tokensSnap.docs.map((doc) => doc.id);

      // Crear mensaje personalizado según el estado
      let title = "Actualización de pedido";
      let body = `Tu pedido #${orderId} ha sido actualizado`;

      switch (after.status?.toLowerCase()) {
        case "completado":
          title = "🎉 Pedido completado";
          body = `Tu pedido #${orderId} ha sido entregado`;
          break;
        case "enviado":
        case "en camino":
          title = "📦 Pedido en camino";
          body = `Tu pedido #${orderId} ya salió del almacén`;
          break;
        case "cancelado":
          title = "❌ Pedido cancelado";
          body = `Tu pedido #${orderId} ha sido cancelado`;
          break;
        case "procesando":
          title = "⏳ Pedido en proceso";
          body = `Estamos preparando tu pedido #${orderId}`;
          break;
      }

      const payload = {
        notification: {
          title,
          body,
          icon: "/logo192.png",
          badge: "/logo192.png",
          click_action: `${
            config.site?.url || "https://pcu.com.do"
          }/perfil?seccion=pedidos`,
        },
        data: {
          orderId,
          status: after.status,
          type: "order_update",
        },
      };

      const response = await messaging.sendToDevice(tokens, payload);

      // Limpiar tokens inválidos
      const tokensToRemove = [];
      response.results.forEach((result, index) => {
        if (result.error) {
          if (
            result.error.code ===
              "messaging/registration-token-not-registered" ||
            result.error.code === "messaging/invalid-registration-token"
          ) {
            tokensToRemove.push(tokens[index]);
          }
        }
      });

      // Eliminar tokens inválidos
      const removePromises = tokensToRemove.map((token) =>
        db.doc(`users/${userId}/fcmTokens/${token}`).delete()
      );
      await Promise.all(removePromises);

      console.log(
        "✅ Push notification enviada:",
        response.successCount,
        "exitosas"
      );

      return true;
    } catch (error) {
      console.error("❌ Error al enviar push notification:", error);
      return null;
    }
  });

// ============================================
// 3. FUNCIÓN HTTP PARA ENVIAR CAMPAÑAS DE EMAIL
// ============================================
exports.sendEmailCampaign = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Verificar API key (SEGURIDAD CRÍTICA)
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== config.admin?.apikey) {
    res.status(403).json({ error: "Forbidden - Invalid API Key" });
    return;
  }

  const { subject, html, batchSize = 100, testMode = false } = req.body;

  if (!subject || !html) {
    res.status(400).json({ error: "Subject and HTML are required" });
    return;
  }

  try {
    // Obtener usuarios con opt-in
    const usersSnap = await db
      .collection("users")
      .where("emailOptIn", "==", true)
      .where("email", "!=", null)
      .get();

    if (usersSnap.empty) {
      res.json({ message: "No users with email opt-in", sent: 0 });
      return;
    }

    const emails = usersSnap.docs
      .map((doc) => doc.data().email)
      .filter((email) => email && email.includes("@"));

    console.log(`📧 Enviando campaña a ${emails.length} usuarios`);

    let totalSent = 0;
    let totalFailed = 0;

    // Enviar en batches para no sobrecargar
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      // En modo test, solo enviar al primer email
      if (testMode && i > 0) break;

      try {
        const msgs = batch.map((email) => ({
          to: email,
          from: EMAIL_FROM,
          subject,
          html,
        }));

        await sgMail.send(msgs);
        totalSent += batch.length;

        console.log(
          `✅ Batch ${i / batchSize + 1} enviado: ${batch.length} emails`
        );

        // Pequeña pausa entre batches
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error en batch ${i / batchSize + 1}:`, error);
        totalFailed += batch.length;

        // Guardar errores en colección para revisar
        await db.collection("emailCampaignErrors").add({
          batch: i / batchSize + 1,
          error: error.message,
          emails: batch,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    res.json({
      success: true,
      totalSent,
      totalFailed,
      totalUsers: emails.length,
      testMode,
    });
  } catch (error) {
    console.error("❌ Error en campaña:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 4. FUNCIÓN HTTP PARA UNSUBSCRIBE
// ============================================
exports.unsubscribe = functions.https.onRequest(async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    res.status(400).send("Invalid request");
    return;
  }

  // TODO: Verificar token de seguridad (hash del email + secret)
  // const expectedToken = crypto.createHash('sha256').update(email + process.env.SECRET).digest('hex');
  // if (token !== expectedToken) { ... }

  try {
    // Buscar usuario por email
    const usersSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Unsubscribe</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>❌ Usuario no encontrado</h1>
          <p>No se encontró una cuenta con ese email.</p>
        </body>
        </html>
      `);
      return;
    }

    const userId = usersSnap.docs[0].id;

    // Actualizar opt-in
    await db.doc(`users/${userId}`).update({
      emailOptIn: false,
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Unsubscribed</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>✅ Cancelado exitosamente</h1>
        <p>Has sido removido de nuestra lista de correos promocionales.</p>
        <p>Aún recibirás emails importantes sobre tus pedidos.</p>
        <br>
        <a href="${
          config.site?.url || "https://pcu.com.do"
        }" style="color: #2563eb;">Volver al sitio</a>
      </body>
      </html>
    `);

    console.log("✅ Usuario desuscrito:", email);
  } catch (error) {
    console.error("❌ Error al desuscribir:", error);
    res.status(500).send("Error al procesar tu solicitud");
  }
});

// ============================================
// 5. GENERAR CUSTOM TOKEN PARA CAMBIO RÁPIDO DE CUENTA
// ============================================
exports.issueSwitchToken = functions.https.onCall(async (data, context) => {
  try {
    const { email } = data;

    if (!email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email requerido"
      );
    }

    console.log("🔄 Solicitando custom token para:", email);

    // Buscar usuario por email
    const usersSnap = await db
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (usersSnap.empty) {
      console.log("❌ Usuario no encontrado:", email);
      throw new functions.https.HttpsError(
        "not-found",
        "Usuario no encontrado"
      );
    }

    const uid = usersSnap.docs[0].id;
    console.log("✅ Usuario encontrado:", uid);

    // Generar Custom Token
    const customToken = await admin.auth().createCustomToken(uid);
    console.log("✅ Custom token generado exitosamente");

    return {
      customToken,
      uid,
      email: email.toLowerCase(),
    };
  } catch (error) {
    console.error("❌ Error generando custom token:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error al generar token"
    );
  }
});

// ============================================
// 6. FUNCIÓN PARA LIMPIAR TOKENS FCM VIEJOS
// ============================================
exports.cleanupOldFCMTokens = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    try {
      const usersSnap = await db.collection("users").get();
      let totalDeleted = 0;

      for (const userDoc of usersSnap.docs) {
        const tokensSnap = await db
          .collection(`users/${userDoc.id}/fcmTokens`)
          .where("createdAt", "<", oneMonthAgo)
          .get();

        const deletePromises = tokensSnap.docs.map((doc) => doc.ref.delete());
        await Promise.all(deletePromises);

        totalDeleted += tokensSnap.size;
      }

      console.log(`🧹 Limpieza FCM: ${totalDeleted} tokens viejos eliminados`);
      return null;
    } catch (error) {
      console.error("❌ Error en limpieza FCM:", error);
      return null;
    }
  });

// ============================================
// 7. ENVIAR EMAIL CON RESEND - SOLICITUD APROBADA
// ============================================
exports.sendStoreApprovedEmail = functions.https.onCall(
  async (data, context) => {
    try {
      const { email, nombreContacto, tiendaNombre, storeId } = data;

      if (!email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email requerido"
        );
      }

      console.log("📧 Enviando email de aprobación a:", email);

      const { data: emailData, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "🎉 ¡Tu tienda ha sido aprobada en Playcenter!",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .success-icon { font-size: 60px; margin-bottom: 20px; }
            .store-name { background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border-left: 4px solid #10b981; }
            .store-name h2 { margin: 0; color: #059669; font-size: 24px; }
            .steps { background: #f9fafb; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .steps h3 { margin: 0 0 15px; color: #374151; }
            .steps ol { margin: 0; padding-left: 20px; }
            .steps li { padding: 8px 0; color: #4b5563; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; margin-top: 20px; }
            .button:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f9fafb; }
            .footer a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <img src="${LOGO_URL}" alt="Playcenter Universal" style="height: 50px; margin-bottom: 15px;" />
                <div class="success-icon">🎉</div>
                <h1>¡Felicidades!</h1>
                <p>Tu solicitud ha sido aprobada</p>
              </div>
              <div class="content">
                <p>Hola <strong>${nombreContacto}</strong>,</p>
                <p>Nos complace informarte que tu solicitud para crear una tienda en Playcenter Universal ha sido <strong style="color: #10b981;">APROBADA</strong>.</p>
                
                <div class="store-name">
                  <h2>🏪 ${tiendaNombre}</h2>
                </div>

                <div class="steps">
                  <h3>📋 ¿Cómo acceder a tu Panel de Vendedor?</h3>
                  <ol>
                    <li>Inicia sesión en <a href="${SITE_URL}" style="color: #2563eb;">pcu.com.do</a> con tu cuenta</li>
                    <li><strong>En computadora:</strong> Verás el botón <strong>"Admin"</strong> en la barra superior, junto a tu perfil</li>
                    <li><strong>En teléfono:</strong> Abre el menú ☰ (hamburguesa) y verás la opción <strong>"Panel Admin"</strong></li>
                    <li>Personaliza tu tienda (logo, banner, descripción)</li>
                    <li>Sube tus productos y ¡comienza a vender!</li>
                  </ol>
                </div>

                <div style="background: #dbeafe; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2563eb;">
                  <p style="margin: 0; color: #1e40af;"><strong>💡 Tip:</strong> Tu tienda "${tiendaNombre}" ya está activa y visible para todos los usuarios de Playcenter Universal.</p>
                </div>

                <center>
                  <a href="${SITE_URL}/admin" class="button">Ir a mi Panel de Administración</a>
                </center>
                
                <p style="text-align: center; margin-top: 15px; font-size: 14px; color: #6b7280;">
                  O visita directamente: <a href="${SITE_URL}/admin" style="color: #2563eb;">pcu.com.do/admin</a>
                </p>
              </div>
              <div class="footer">
                <p>¿Tienes preguntas? Contáctanos en cualquier momento.</p>
                <p>© ${new Date().getFullYear()} <a href="${SITE_URL}">Playcenter Universal</a>. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      if (error) {
        console.error("❌ Error Resend:", error);
        throw new functions.https.HttpsError("internal", error.message);
      }

      console.log("✅ Email de aprobación enviado:", emailData);

      return { success: true, emailId: emailData?.id };
    } catch (error) {
      console.error("❌ Error al enviar email de aprobación:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Error al enviar email"
      );
    }
  }
);

// ============================================
// 8. ENVIAR EMAIL CON RESEND - SOLICITUD RECHAZADA
// ============================================
exports.sendStoreRejectedEmail = functions.https.onCall(
  async (data, context) => {
    try {
      const { email, nombreContacto, tiendaNombre, motivo } = data;

      if (!email) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email requerido"
        );
      }

      console.log("📧 Enviando email de rechazo a:", email);

      const { data: emailData, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "Actualización sobre tu solicitud de tienda - Playcenter",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .store-name { background: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border-left: 4px solid #6b7280; }
            .store-name h2 { margin: 0; color: #4b5563; font-size: 20px; }
            .reason-box { background: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b; }
            .reason-box h3 { margin: 0 0 10px; color: #92400e; }
            .reason-box p { margin: 0; color: #78350f; }
            .next-steps { background: #f0f9ff; padding: 25px; border-radius: 12px; margin: 25px 0; }
            .next-steps h3 { margin: 0 0 15px; color: #0369a1; }
            .next-steps ul { margin: 0; padding-left: 20px; }
            .next-steps li { padding: 5px 0; color: #0c4a6e; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; margin-top: 20px; }
            .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; background: #f9fafb; }
            .footer a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <img src="${LOGO_URL}" alt="Playcenter Universal" style="height: 50px; margin-bottom: 15px;" />
                <h1>Actualización de Solicitud</h1>
                <p>Información importante sobre tu tienda</p>
              </div>
              <div class="content">
                <p>Hola <strong>${nombreContacto}</strong>,</p>
                <p>Gracias por tu interés en vender en Playcenter Universal. Hemos revisado tu solicitud para la tienda:</p>
                
                <div class="store-name">
                  <h2>🏪 ${tiendaNombre}</h2>
                </div>

                <p>Lamentablemente, en esta ocasión no hemos podido aprobar tu solicitud.</p>

                ${
                  motivo
                    ? `
                <div class="reason-box">
                  <h3>📝 Motivo:</h3>
                  <p>${motivo}</p>
                </div>
                `
                    : ""
                }

                <div class="next-steps">
                  <h3>💡 ¿Qué puedes hacer?</h3>
                  <ul>
                    <li>Revisa los requisitos para vendedores en nuestra plataforma</li>
                    <li>Asegúrate de completar toda la información requerida</li>
                    <li>Puedes enviar una nueva solicitud cuando estés listo</li>
                    <li>Contáctanos si tienes dudas sobre el proceso</li>
                  </ul>
                </div>

                <p>Valoramos tu interés en formar parte de nuestra comunidad de vendedores.</p>

                <center>
                  <a href="${SITE_URL}/crear-tienda" class="button">Enviar Nueva Solicitud</a>
                </center>
              </div>
              <div class="footer">
                <p>¿Tienes preguntas? Estamos aquí para ayudarte.</p>
                <p>© ${new Date().getFullYear()} <a href="${SITE_URL}">Playcenter Universal</a>. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      if (error) {
        console.error("❌ Error Resend:", error);
        throw new functions.https.HttpsError("internal", error.message);
      }

      console.log("✅ Email de rechazo enviado:", emailData);

      return { success: true, emailId: emailData?.id };
    } catch (error) {
      console.error("❌ Error al enviar email de rechazo:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Error al enviar email"
      );
    }
  }
);

// ============================================
// 9. PROCESAR COLA DE EMAILS (mail_queue)
// ============================================
exports.processMailQueue = functions.firestore
  .document("mail_queue/{mailId}")
  .onCreate(async (snap, context) => {
    const mailData = snap.data();
    const mailId = context.params.mailId;

    // Evitar duplicados
    if (mailData.status === "sent") {
      console.log("Email ya enviado:", mailId);
      return null;
    }

    try {
      const { to, subject, html } = mailData;

      if (!to || !subject || !html) {
        console.error("Datos incompletos en mail_queue:", mailId);
        await snap.ref.update({
          status: "error",
          error: "Datos incompletos",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return null;
      }

      console.log("📧 Procesando email de cola para:", to);

      const { data: emailData, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        console.error("❌ Error Resend en cola:", error);
        await snap.ref.update({
          status: "error",
          error: error.message,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return null;
      }

      // Marcar como enviado
      await snap.ref.update({
        status: "sent",
        emailId: emailData?.id,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Email de cola enviado:", to);
      return true;
    } catch (error) {
      console.error("❌ Error procesando cola de email:", error);
      await snap.ref.update({
        status: "error",
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return null;
    }
  });

// ============================================
// 10. ENVIAR NOTIFICACIÓN GENÉRICA CON RESEND
// ============================================
exports.sendNotificationEmail = functions.https.onCall(
  async (data, context) => {
    try {
      const { email, subject, title, message, actionUrl, actionLabel, type } =
        data;

      if (!email || !subject) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Email y subject requeridos"
        );
      }

      console.log("📧 Enviando notificación por email a:", email);

      // Colores según tipo
      const colors = {
        success: {
          bg: "#10b981",
          gradient: "linear-gradient(135deg, #10b981, #059669)",
        },
        error: {
          bg: "#ef4444",
          gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        },
        warning: {
          bg: "#f59e0b",
          gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        },
        info: {
          bg: "#2563eb",
          gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        },
      };

      const color = colors[type] || colors.info;

      const { data: emailData, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: ${
              color.gradient
            }; color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 40px 30px; }
            .message { font-size: 16px; color: #374151; }
            .button { display: inline-block; background: ${
              color.gradient
            }; color: white; padding: 14px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; margin-top: 25px; }
            .footer { text-align: center; padding: 25px; color: #6b7280; font-size: 13px; background: #f9fafb; }
            .footer a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <img src="${LOGO_URL}" alt="Playcenter Universal" style="height: 50px; margin-bottom: 15px;" />
                <h1>${title || subject}</h1>
              </div>
              <div class="content">
                <p class="message">${message || ""}</p>
                ${
                  actionUrl
                    ? `
                <center>
                  <a href="${actionUrl}" class="button">${
                        actionLabel || "Ver más"
                      }</a>
                </center>
                `
                    : ""
                }
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} <a href="${SITE_URL}">Playcenter Universal</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      if (error) {
        console.error("❌ Error Resend:", error);
        throw new functions.https.HttpsError("internal", error.message);
      }

      console.log("✅ Email de notificación enviado:", emailData);

      return { success: true, emailId: emailData?.id };
    } catch (error) {
      console.error("❌ Error al enviar notificación:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Error al enviar email"
      );
    }
  }
);

// ============================================
// 11. ENVIAR CÓDIGO DE VERIFICACIÓN AL EMAIL
// ============================================
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  try {
    const { email, userName, deviceInfo } = data;

    if (!email) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email requerido"
      );
    }

    // Generar código de 6 dígitos
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Guardar código en Firestore con expiración de 30 minutos
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 60 * 1000)
    );

    await db.collection("verification_codes").add({
      email: email.toLowerCase(),
      code: verificationCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      used: false,
      deviceInfo: deviceInfo || null,
    });

    // Obtener fecha y hora actual
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-DO", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    console.log("📧 Enviando código de verificación a:", email);

    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Código de verificación - Playcenter Universal",
      html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de verificación</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
                
                <!-- Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <img src="${LOGO_URL}" alt="Playcenter Universal" width="200" style="display: block; max-width: 200px; height: auto;" />
                  </td>
                </tr>

                <!-- Título -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">Código de verificación</h1>
                  </td>
                </tr>

                <!-- Mensaje -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4a4a4a; text-align: center;">
                      Hola${userName ? ` ${userName}` : ""},<br><br>
                      Usa el siguiente código para verificar tu identidad:
                    </p>
                  </td>
                </tr>

                <!-- Código -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #f5f5f5; border-radius: 8px; padding: 24px 48px;">
                          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: 'SF Mono', Monaco, 'Courier New', monospace;">${verificationCode}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Expiración -->
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 13px; color: #888888;">
                      Este código expira en 10 minutos.
                    </p>
                  </td>
                </tr>

                <!-- Información del dispositivo -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                            <strong style="color: #333333;">Fecha:</strong> ${dateStr}
                          </p>
                          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                            <strong style="color: #333333;">Dispositivo:</strong> ${
                              deviceInfo?.browser || "Navegador"
                            } ${deviceInfo?.os || ""}
                          </p>
                          <p style="margin: 0; font-size: 13px; color: #666666;">
                            <strong style="color: #333333;">Ubicación:</strong> ${
                              deviceInfo?.location || "República Dominicana"
                            }
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Nota de seguridad -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #888888; text-align: center;">
                      Si no solicitaste este código, ignora este mensaje.<br>
                      Nunca compartas tu código con nadie.
                    </p>
                  </td>
                </tr>

                <!-- Línea divisora -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      &copy; ${new Date().getFullYear()} Playcenter Universal<br>
                      <a href="${SITE_URL}" style="color: #666666; text-decoration: none;">pcu.com.do</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    });

    if (error) {
      console.error("❌ Error Resend:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }

    console.log("✅ Código de verificación enviado:", emailData?.id);

    return { success: true, message: "Código enviado" };
  } catch (error) {
    console.error("❌ Error al enviar código:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error al enviar código"
    );
  }
});

// ============================================
// 12. VERIFICAR CÓDIGO
// ============================================
exports.verifyCode = functions.https.onCall(async (data, context) => {
  try {
    const { email, code } = data;

    if (!email || !code) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email y código requeridos"
      );
    }

    // Buscar código válido
    const codesSnapshot = await db
      .collection("verification_codes")
      .where("email", "==", email.toLowerCase())
      .where("code", "==", code)
      .where("used", "==", false)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (codesSnapshot.empty) {
      return { success: false, error: "Código inválido o expirado" };
    }

    const codeDoc = codesSnapshot.docs[0];
    const codeData = codeDoc.data();

    // Verificar si expiró
    let expiresAtDate;
    if (codeData.expiresAt && codeData.expiresAt.toDate) {
      expiresAtDate = codeData.expiresAt.toDate();
    } else if (codeData.expiresAt && codeData.expiresAt._seconds) {
      expiresAtDate = new Date(codeData.expiresAt._seconds * 1000);
    } else {
      expiresAtDate = new Date(codeData.expiresAt);
    }

    console.log(
      "⏰ Verificando expiración - Ahora:",
      new Date(),
      "Expira:",
      expiresAtDate
    );

    if (new Date() > expiresAtDate) {
      return {
        success: false,
        error: "El código ha expirado. Solicita uno nuevo.",
      };
    }

    // Marcar como usado
    await codeDoc.ref.update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Código verificado correctamente para:", email);

    return { success: true, message: "Código verificado correctamente" };
  } catch (error) {
    console.error("❌ Error al verificar código:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error al verificar"
    );
  }
});

// ============================================
// 12.5. RESTABLECER CONTRASEÑA CON CÓDIGO VERIFICADO
// ============================================
exports.resetUserPassword = functions.https.onCall(async (data, _context) => {
  try {
    const { email, newPassword, code } = data;
    const verificationCode = code || data.verificationCode;

    console.log("🔐 resetUserPassword llamado para:", email);

    if (!email || !newPassword) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email y nueva contraseña requeridos"
      );
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    // Buscar el código verificado más reciente (query simplificada)
    let codeDoc = null;
    let codeData = null;

    if (verificationCode) {
      // Si se proporciona el código, buscar ese específico
      const codesSnapshot = await db
        .collection("verification_codes")
        .where("email", "==", email.toLowerCase())
        .where("code", "==", verificationCode)
        .limit(1)
        .get();

      if (!codesSnapshot.empty) {
        codeDoc = codesSnapshot.docs[0];
        codeData = codeDoc.data();
      }
    } else {
      // Si no hay código, buscar el más reciente usado
      const codesSnapshot = await db
        .collection("verification_codes")
        .where("email", "==", email.toLowerCase())
        .where("used", "==", true)
        .limit(5)
        .get();

      if (!codesSnapshot.empty) {
        // Encontrar el más reciente manualmente
        let mostRecent = null;
        let mostRecentTime = 0;
        codesSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const usedAt = data.usedAt?.toMillis ? data.usedAt.toMillis() : 0;
          if (usedAt > mostRecentTime) {
            mostRecentTime = usedAt;
            mostRecent = doc;
          }
        });
        if (mostRecent) {
          codeDoc = mostRecent;
          codeData = mostRecent.data();
        }
      }
    }

    // Verificar que tenemos un código válido
    if (!codeDoc || !codeData || !codeData.used) {
      console.log("❌ No se encontró código verificado para:", email);
      return {
        success: false,
        error: "Código no válido. Por favor verifica tu identidad nuevamente.",
      };
    }

    // Verificar que el código fue usado hace menos de 15 minutos
    const usedAt = codeData.usedAt?.toDate
      ? codeData.usedAt.toDate()
      : codeData.usedAt?.toMillis
      ? new Date(codeData.usedAt.toMillis())
      : new Date();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    if (usedAt < fifteenMinutesAgo) {
      console.log("❌ Código expirado para:", email);
      return {
        success: false,
        error:
          "La sesión de verificación ha expirado. Por favor verifica tu identidad nuevamente.",
      };
    }

    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email.toLowerCase());

    if (!userRecord) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Actualizar contraseña usando Firebase Admin
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    // Marcar el código como usado para reset (evitar reutilización)
    await codeDoc.ref.update({
      passwordReset: true,
      passwordResetAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Contraseña actualizada para:", email);

    // Enviar email de confirmación
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email.toLowerCase(),
        subject: "Contraseña actualizada - Playcenter Universal",
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contraseña actualizada</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
                  
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <img src="${LOGO_URL}" alt="Playcenter Universal" width="200" style="display: block; max-width: 200px; height: auto;" />
                    </td>
                  </tr>

                  <!-- Título -->
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">Contraseña actualizada</h1>
                    </td>
                  </tr>

                  <!-- Mensaje -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4a4a4a; text-align: center;">
                        Tu contraseña ha sido cambiada exitosamente.<br><br>
                        Ya puedes iniciar sesión con tu nueva contraseña.
                      </p>
                    </td>
                  </tr>

                  <!-- Alerta de seguridad -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; border-radius: 8px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">
                              <strong style="color: #333333;">¿No fuiste tú?</strong><br>
                              Si no realizaste este cambio, tu cuenta puede estar comprometida. Contáctanos de inmediato.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Línea divisora -->
                  <tr>
                    <td style="padding-bottom: 24px;">
                      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        &copy; ${new Date().getFullYear()} Playcenter Universal<br>
                        <a href="${SITE_URL}" style="color: #666666; text-decoration: none;">pcu.com.do</a>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      });
    } catch (emailError) {
      console.error("Error enviando email de confirmación:", emailError);
      // No fallar si el email no se envía
    }

    return { success: true, message: "Contraseña actualizada exitosamente" };
  } catch (error) {
    console.error("❌ Error al restablecer contraseña:", error);

    if (error.code === "auth/user-not-found") {
      return {
        success: false,
        error: "No existe una cuenta con este correo electrónico",
      };
    }

    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error al restablecer contraseña"
    );
  }
});

// ============================================
// 13. NOTIFICAR AL ADMIN - NUEVA SOLICITUD DE TIENDA
// ============================================
exports.onNewStoreRequest = functions.firestore
  .document("solicitudes_vendedor/{solicitudId}")
  .onCreate(async (snap, context) => {
    const solicitud = snap.data();
    const solicitudId = context.params.solicitudId;

    // Email del admin
    const ADMIN_EMAIL = "arisleidy0712@gmail.com";

    try {
      console.log("📧 Nueva solicitud de tienda, notificando al admin...");

      const fechaSolicitud = solicitud.fechaSolicitud?.toDate
        ? solicitud.fechaSolicitud.toDate().toLocaleDateString("es-DO", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleDateString("es-DO");

      const { data: emailData, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `🏪 Nueva solicitud de tienda: ${solicitud.tiendaNombre}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 10px 0 0; opacity: 0.9; }
            .content { padding: 30px; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 12px; margin: 15px 0; }
            .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: 600; color: #374151; width: 140px; }
            .info-value { color: #6b7280; flex: 1; }
            .store-name { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .store-name h2 { margin: 0; color: #92400e; font-size: 22px; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; margin-top: 20px; }
            .footer { text-align: center; padding: 25px; color: #6b7280; font-size: 13px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <img src="${LOGO_URL}" alt="Playcenter Universal" style="height: 50px; margin-bottom: 15px;" />
                <h1>🏪 Nueva Solicitud de Tienda</h1>
                <p>Alguien quiere vender en Playcenter</p>
              </div>
              <div class="content">
                <div class="store-name">
                  <h2>${solicitud.tiendaNombre}</h2>
                </div>

                <div class="info-box">
                  <div class="info-row">
                    <span class="info-label">👤 Solicitante:</span>
                    <span class="info-value">${solicitud.nombreContacto}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📧 Email:</span>
                    <span class="info-value">${solicitud.email}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📱 Teléfono:</span>
                    <span class="info-value">${
                      solicitud.telefono || "No proporcionado"
                    }</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📍 Dirección:</span>
                    <span class="info-value">${
                      solicitud.tiendaDireccion || "No proporcionada"
                    }</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📝 Descripción:</span>
                    <span class="info-value">${
                      solicitud.tiendaDescripcion || "Sin descripción"
                    }</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">📅 Fecha:</span>
                    <span class="info-value">${fechaSolicitud}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">🔗 ID Usuario:</span>
                    <span class="info-value">${
                      solicitud.userId || "No logueado"
                    }</span>
                  </div>
                </div>

                <p style="text-align: center; margin-top: 25px;">
                  <strong>Revisa esta solicitud y decide si aprobarla o rechazarla.</strong>
                </p>

                <center>
                  <a href="${SITE_URL}/admin?tab=solicitudes" class="button">
                    Revisar Solicitud en PCU
                  </a>
                </center>
              </div>
              <div class="footer">
                <p>Este email fue enviado automáticamente desde Playcenter Universal</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      });

      if (error) {
        console.error("❌ Error enviando email al admin:", error);
        return null;
      }

      console.log(
        "✅ Email enviado al admin sobre nueva solicitud:",
        emailData?.id
      );

      // También crear notificación in-app para el admin
      await db.collection("notifications").add({
        type: "solicitud_vendedor",
        title: "Nueva solicitud de tienda",
        message: `${solicitud.nombreContacto} quiere crear la tienda "${solicitud.tiendaNombre}"`,
        targetUserId: null,
        targetType: "admin",
        actionUrl: "/admin?tab=solicitudes",
        actionLabel: "Revisar solicitud",
        metadata: {
          solicitudId,
          tiendaNombre: solicitud.tiendaNombre,
          solicitante: solicitud.nombreContacto,
          email: solicitud.email,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("❌ Error en onNewStoreRequest:", error);
      return null;
    }
  });
