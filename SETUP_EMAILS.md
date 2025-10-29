# 📧 Configuración de Emails - PCU.COM.DO

## ✅ Ya Configurado en el Código

He actualizado todo el código para usar tu dominio **pcu.com.do** y tu API key de SendGrid.

---

## 🚀 Pasos para Activar (SOLO 3 COMANDOS)

### **Opción 1: Script Automático (Recomendado)**

#### En Mac/Linux:
```bash
# Dar permisos de ejecución
chmod +x configure-firebase-functions.sh

# Ejecutar script
./configure-firebase-functions.sh
```

#### En Windows:
```batch
configure-firebase-functions.bat
```

### **Opción 2: Manual (Copiar y pegar cada línea)**

```bash
# 1. Configurar SendGrid API Key
firebase functions:config:set sendgrid.apikey="TU_SENDGRID_API_KEY"

# 2. Configurar email remitente
firebase functions:config:set mail.from="no-reply@pcu.com.do"

# 3. Configurar URL del sitio
firebase functions:config:set site.url="https://pcu.com.do"

# 4. Configurar API Key de admin
firebase functions:config:set admin.apikey="PCU-ADMIN-2024-SECURE-KEY-XYZ789"

# 5. Verificar que todo se guardó
firebase functions:config:get
```

---

## 📦 Instalar y Desplegar

```bash
# 1. Instalar dependencias
cd functions
npm install
cd ..

# 2. Desplegar las funciones
firebase deploy --only functions
```

**Espera 2-3 minutos** mientras se despliegan las funciones.

---

## 🧪 Probar que Funciona

### Método 1: Crear un pedido de prueba

1. Ve a tu app
2. Crea un pedido (aunque sea de prueba)
3. **Deberías recibir un email automáticamente** en el correo del cliente

### Método 2: Crear pedido manualmente en Firestore

1. Ve a Firebase Console → Firestore
2. Crea un documento en la colección `orders` con estos datos:

```json
{
  "userId": "test-user-id",
  "email": "tu-email@gmail.com",
  "customerName": "Prueba Test",
  "status": "Pendiente",
  "total": 100,
  "items": [
    {
      "name": "Producto de Prueba",
      "quantity": 1,
      "price": 100
    }
  ],
  "createdAt": "Timestamp actual"
}
```

3. **Revisa tu email** - deberías recibir el correo en unos segundos

---

## 📊 Ver Logs (Si hay problemas)

```bash
# Ver todos los logs
firebase functions:log

# Ver logs en tiempo real
firebase functions:log --follow

# Ver solo errores
firebase functions:log --min-severity ERROR

# Ver logs de función específica
firebase functions:log --only onOrderCreated
```

---

## ✅ Funciones Desplegadas

Después del deploy, tendrás estas 5 funciones activas:

1. **onOrderCreated** → Envía email cuando se crea un pedido
2. **onOrderStatusChanged** → Envía push notification cuando cambia el estado
3. **sendEmailCampaign** → Para enviar campañas masivas (necesita API key)
4. **unsubscribe** → Página para cancelar suscripción
5. **cleanupOldFCMTokens** → Limpia tokens viejos cada 24h

---

## 🔍 Verificar Estado

En Firebase Console:
1. Ve a **Functions**
2. Deberías ver las 5 funciones desplegadas
3. Cada una debe tener estado "✅ Healthy"

---

## 📧 Formato del Email que se Envía

Los clientes recibirán un email profesional con:
- Logo y header azul de Playcenter
- Detalles del pedido
- Lista de productos
- Total en RD$
- Botón para "Ver mi pedido"
- Footer profesional

**Remitente**: no-reply@pcu.com.do  
**Nombre**: Playcenter Universal

---

## ⚠️ Notas Importantes

1. **Plan gratuito de SendGrid**: 100 emails/día
2. **Si necesitas más**: Actualizar plan en SendGrid
3. **Los emails van al inbox**, no a spam (porque tu dominio está verificado)
4. **Tiempo de entrega**: 1-5 segundos normalmente

---

## 🐛 Problemas Comunes

### "Error: config.sendgrid is undefined"
**Solución**: Ejecuta de nuevo los comandos de configuración

### "Error: Invalid API key"
**Solución**: Verifica que la API key de SendGrid sea correcta

### Emails no llegan
**Solución**: 
1. Revisa logs: `firebase functions:log --only onOrderCreated`
2. Verifica spam
3. Verifica que el dominio esté verificado en SendGrid

---

## 📞 URLs de Configuración

- **SendGrid Dashboard**: https://app.sendgrid.com
- **Firebase Console**: https://console.firebase.google.com
- **Ver Functions**: https://console.firebase.google.com/project/tu-proyecto/functions

---

## ✨ ¡Listo!

Una vez que ejecutes los comandos y despliegues, **tu sistema de emails estará completamente funcional** y enviando correos automáticos cada vez que se cree un pedido.

**¿Necesitas ayuda?** Revisa los logs con `firebase functions:log`
