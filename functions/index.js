const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const sgMail = require("@sendgrid/mail");

// Obtener configuración de Firebase
const config = functions.config();
sgMail.setApiKey(config.sendgrid?.apikey || process.env.SENDGRID_API_KEY);

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
      throw new functions.https.HttpsError("invalid-argument", "Monto inválido");
    }

    // Generar TransactionId único de 6 dígitos
    const transactionId = String(Date.now()).slice(-6);

    // Formatear monto a 12 dígitos (en centavos)
    const amountInCents = Math.round(amount * 100);
    const formattedAmount = String(amountInCents).padStart(12, "0");

    // Calcular ITBIS (18%)
    const taxAmount = Math.round(amountInCents * 0.18);
    const formattedTax = String(taxAmount).padStart(12, "0");

    // URLs según ambiente
    const isProduction = process.env.NODE_ENV === "production";
    const API_BASE = isProduction 
      ? "https://playcenter-universal.onrender.com"
      : (context.rawRequest?.headers?.origin || "http://localhost:5174");

    // Parámetros CORRECTOS según documentación Cardnet
    const requestBody = {
      TransactionType: "0200", // Venta normal
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
      Ipclient: context.rawRequest?.ip || "127.0.0.1"
    };

    console.log("📤 Enviando solicitud a Cardnet:", requestBody);

    // Llamar al API de Cardnet
    const response = await axios.post(
      "https://lab.cardnet.com.do/sessions",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("✅ Respuesta de Cardnet:", response.data);

    return {
      success: true,
      session: response.data.SESSION,
      sessionKey: response.data["session-key"],
      orderId: requestBody.OrdenId,
      transactionId: requestBody.TransactionId
    };

  } catch (error) {
    console.error("❌ Error creando sesión Cardnet:", error.response?.data || error.message);
    throw new functions.https.HttpsError(
      "internal",
      "Error al crear sesión de pago",
      error.response?.data || error.message
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
      throw new functions.https.HttpsError("invalid-argument", "Sesión o clave inválida");
    }

    console.log("🔍 Verificando transacción Cardnet:", session);

    // Consultar resultado
    const response = await axios.get(
      `https://lab.cardnet.com.do/sessions/${session}`,
      {
        params: { sk: sessionKey },
        timeout: 30000
      }
    );

    console.log("✅ Resultado Cardnet:", response.data);

    return {
      success: true,
      ...response.data
    };

  } catch (error) {
    console.error("❌ Error verificando transacción:", error.response?.data || error.message);
    
    // Si la sesión no se encuentra (404), retornar info útil
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "Session not found",
        message: "La sesión expiró o no existe. Las sesiones son válidas por 30 minutos."
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
        from: config.mail?.from || "no-reply@pcu.com.do",
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
                    <span>${new Date(order.createdAt?.toDate() || Date.now()).toLocaleDateString("es-DO")}</span>
                  </div>
                  <div class="item">
                    <span>Estado:</span>
                    <span><strong>${order.status || "Pendiente"}</strong></span>
                  </div>
                  <div class="item">
                    <span>Método de pago:</span>
                    <span>${order.paymentMethod || "Por confirmar"}</span>
                  </div>
                  ${order.items ? order.items.map(item => `
                    <div class="item">
                      <span>${item.name} x${item.quantity}</span>
                      <span>RD$${(item.price * item.quantity).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
                    </div>
                  `).join("") : ""}
                  <div class="total">
                    Total: RD$${(order.total || 0).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <p>Te notificaremos cuando tu pedido sea enviado.</p>
                <a href="${config.site?.url || "https://pcu.com.do"}/perfil?seccion=pedidos" class="button">Ver mi pedido</a>
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
      await snap.ref.update({ emailSent: true, emailSentAt: admin.firestore.FieldValue.serverTimestamp() });

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

      const tokens = tokensSnap.docs.map(doc => doc.id);

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
          click_action: `${config.site?.url || "https://pcu.com.do"}/perfil?seccion=pedidos`,
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
          if (result.error.code === "messaging/registration-token-not-registered" ||
              result.error.code === "messaging/invalid-registration-token") {
            tokensToRemove.push(tokens[index]);
          }
        }
      });

      // Eliminar tokens inválidos
      const removePromises = tokensToRemove.map(token =>
        db.doc(`users/${userId}/fcmTokens/${token}`).delete()
      );
      await Promise.all(removePromises);

      console.log("✅ Push notification enviada:", response.successCount, "exitosas");

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
    const usersSnap = await db.collection("users")
      .where("emailOptIn", "==", true)
      .where("email", "!=", null)
      .get();

    if (usersSnap.empty) {
      res.json({ message: "No users with email opt-in", sent: 0 });
      return;
    }

    const emails = usersSnap.docs
      .map(doc => doc.data().email)
      .filter(email => email && email.includes("@"));

    console.log(`📧 Enviando campaña a ${emails.length} usuarios`);

    let totalSent = 0;
    let totalFailed = 0;

    // Enviar en batches para no sobrecargar
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      // En modo test, solo enviar al primer email
      if (testMode && i > 0) break;

      try {
        const msgs = batch.map(email => ({
          to: email,
          from: config.mail?.from || "no-reply@pcu.com.do",
          subject,
          html,
        }));

        await sgMail.send(msgs);
        totalSent += batch.length;
        
        console.log(`✅ Batch ${i / batchSize + 1} enviado: ${batch.length} emails`);
        
        // Pequeña pausa entre batches
        await new Promise(resolve => setTimeout(resolve, 100));
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
    const usersSnap = await db.collection("users")
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
        <a href="${config.site?.url || "https://pcu.com.do"}" style="color: #2563eb;">Volver al sitio</a>
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
// 5. FUNCIÓN PARA LIMPIAR TOKENS FCM VIEJOS
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

        const deletePromises = tokensSnap.docs.map(doc => doc.ref.delete());
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
