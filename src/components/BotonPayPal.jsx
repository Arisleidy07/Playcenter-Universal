import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function BotonPayPal({ nombre, precio }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: "AZz6RiPNUajjFS9IYo5GRGOAf1WsyvDH4UwYHKnl6OYnGDNpJ5VuDfQDRO0jKN_pilB6IkewvvKtK8-m",
        currency: "USD",
      }}
    >
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: nombre,
                amount: {
                  value: precio.toFixed(2),
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            alert("Pago completado por " + details.payer.name.given_name);
            console.log("Detalles del pago:", details);
          });
        }}
        onError={(err) => {
          console.error("Error en el pago:", err);
        }}
      />
    </PayPalScriptProvider>
  );
}
