import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function BotonPayPal({ nombre, precio }) {
  // Tasa fija peso dominicano a dólar (ajusta según mercado)
  const tasaDOPaUSD = 56;

  // Precio en USD para enviar a PayPal
  const precioUSD = (precio / tasaDOPaUSD).toFixed(2);

  return (
    <PayPalScriptProvider
      options={{
        clientId: "AZz6RiPNUajjFS9IYo5GRGOAf1WsyvDH4UwYHKnl6OYnGDNpJ5VuDfQDRO0jKN_pilB6IkewvvKtK8-m",
        currency: "USD", // Siempre USD para evitar errores
      }}
    >
      <PayPalButtons
        style={{ layout: "horizontal", shape: "pill", label: "pay" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: nombre,
                amount: {
                  currency_code: "USD",
                  value: precioUSD,
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert(
              `Pago completado por ${details.payer.name.given_name}. Precio: $${precio} DOP (equivalente a $${precioUSD} USD)`
            );
            console.log("Detalles del pago:", details);
          });
        }}
        onError={(err) => {
          console.error("Error en el pago:", err);
          alert("Error procesando el pago, intenta más tarde.");
        }}
      />
    </PayPalScriptProvider>
  );
}
