import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function BotonPayPal({ nombre, precio }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: "AZz6RiPNUajjFS9IYo5GRGOAf1WsyvDH4UwYHKnl6OYnGDNpJ5VuDfQDRO0jKN_pilB6IkewvvKtK8-m",
        currency: "DOP",
      }}
    >
      <PayPalButtons
        style={{ layout: "horizontal", shape: "pill", color: "gold" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: nombre,
                amount: {
                  currency_code: "DOP",
                  value: precio.toFixed(2),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert(`¡Pago completado por ${details.payer.name.given_name}!`);
          });
        }}
        onError={(err) => {
          alert("Error procesando el pago, intenta más tarde.");
          console.error(err);
        }}
      />
    </PayPalScriptProvider>
  );
}
