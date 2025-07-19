import { useEffect, useRef } from "react";

const BotonPayPal = ({ nombre, precio }) => {
  const paypalRef = useRef();

  useEffect(() => {
    if (!window.paypal) {
      console.error("PayPal SDK no cargado");
      return;
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              description: nombre,
              amount: {
                currency_code: "DOP",
                value: precio.toString(),
              },
            },
          ],
        });
      },
      onApprove: async (data, actions) => {
        const detalles = await actions.order.capture();
        alert(`✅ Pago completado por: ${detalles.payer.name.given_name}`);
      },
      onError: (err) => {
        console.error("Error en PayPal:", err);
        alert("Hubo un error procesando el pago");
      },
    }).render(paypalRef.current);

return () => {
  if (paypalRef.current) {
    paypalRef.current.innerHTML = "";
  }
};

  }, [nombre, precio]);

  return <div ref={paypalRef}></div>;
};

export default BotonPayPal;
