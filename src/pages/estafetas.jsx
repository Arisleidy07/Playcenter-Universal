import React, { useState } from "react";
import {
  FaWhatsapp,
  FaMoneyCheckAlt,
  FaUniversity,
  FaRegCopy,
  FaCheck,
} from "react-icons/fa";

const estafetas = [
  {
    id: 0,
    nombre: "Estafeta Principal (Oficina)",
    descripcion: "Playcenter Universal",
    direccion:
      "Av Estrella Sadhala Nº 55, Frente a la doble vía, Santiago",
    telefono: "809-582-1212",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'13.2%22N+70%C2%B041'23.3%22W/@19.436998,-70.689812,17z/data=!4m4!3m3!8m2!3d19.437!4d-70.6898056",
    imagen: "/estafetas/oficina.png",
  },
  {
    id: 1,
    nombre: "Estafeta Villa-Olímpica",
    descripcion: "Minimarket Los Hermanos",
    direccion:
      "Calle Penetración Nº 1, Suburbanización Mare López, La villa-Olímpica, Próximo a la calle 1",
    telefono: "809-626-3262",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B025'43.1%22N+70%C2%B041'12.7%22W/@19.4286338,-70.6894342,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.4286338!4d-70.6868593?hl=es&entry=ttu",
    imagen: "/estafetas/loshermanos.png",
  },
  {
    id: 2,
    nombre: "Estafeta Nibaje",
    descripcion: "Cafetería Guido",
    direccion: "Avenida Franco Vido, Nº 148, Nibaje",
    telefono: "829-324-2318",
    ubicacionLink:
      "https://www.google.com/maps/place//@19.420887,-70.6811611,3857m/data=!3m2!1e3!4b1?entry=ttu",
    imagen: "/estafetas/cafeteria-guido.png",
  },
  {
    id: 3,
    nombre: "Estafeta El Ensueño",
    descripcion: "Salón y Cafetería Marais",
    direccion: "Calle Paseo de los Locutores, Esquina 11, El Ensueño",
    telefono: "829-755-3636",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'22.4%22N+70%C2%B041'26.1%22W/@19.439565,-70.690574,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.439565!4d-70.690574?entry=ttu",
    imagen: "/estafetas/salon-y-cafeteria-maraez.png",
  },
  {
    id: 4,
    nombre: "Estafeta La Lotería",
    descripcion: "Colmado Espinal",
    direccion: "La Lotería, calle Salcedo, Nº 10",
    telefono: "829-288-9168",
    ubicacionLink:
      "https://www.google.com/maps/place/19.439565,-70.690574/data=!4m6!3m5!1s0!7e2!8m2!3d19.439564999999998!4d-70.690574",
    imagen: "/estafetas/colmado-espinal.png",
  },
  {
    id: 5,
    nombre: "Estafeta La Villa-Olímpica",
    descripcion: "Palmatec Solutions",
    direccion:
      "Villa-Olímpica, frente Manzana F, al lado del antiguo Colegio Génesis",
    telefono: "809-785-3354",
    ubicacionLink:
      "https://www.google.com/maps/place/19.435309,-70.685961/data=!4m6!3m5!1s0!7e2!8m2!3d19.435309!4d-70.68596099999999",
    imagen: "/estafetas/palmatech-solution.png",
  },
  {
    id: 6,
    nombre: "Estafeta Ensanche Bermúdez",
    descripcion: "St Electronics",
    direccion: "Calle 11, número 27, Ensanche Bermúdez",
    telefono: "849-437-3100",
    ubicacionLink:
      "https://www.google.com/maps/place/Espailla,+51000+Santiago+de+los+Caballeros/@19.4717075,-70.7148707,964m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8eb1c5e2c3c79d7d:0x3a75c6d5f2312708!8m2!3d19.4717075!4d-70.7148707",
    imagen: "/estafetas/St electronics.png",
  },
  {
    id: 7,
    nombre: "Estafeta Los Guandules",
    descripcion: "Mini Market El Vecino",
    direccion: "Estafeta de pago Los Guandules, próximo al puente",
    telefono: "+1 829 218 1889",
    ubicacionLink:
      "https://www.google.com/maps/place/19%C2%B026'15.3%22N+70%C2%B041'22.2%22W/@19.4381999,-70.6893169,526m/data=!3m1!1e3!4m4!3m3!8m2!3d19.437576!4d-70.689512?entry=ttu",
    imagen: "/estafetas/losguandules.png",
  },
];

const cuentasBancarias = [
  {
    banco: "BANRESERVAS",
    numero: "9600153322",
    tipo: "Cuenta Corriente",
    titular: "PLAYCENTER",
  },
  {
    banco: "POPULAR",
    numero: "0798928750",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "BHD",
    numero: "18673320016",
    tipo: "Cuenta Corriente",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "SantaCruz",
    numero: "1-114-201-001163-2",
    tipo: "Cuenta Ahorro",
    titular: "PLAYCENTER",
  },
  {
    banco: "Scotiabank",
    numero: "12010008845",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
  {
    banco: "ASOC. CIBAO",
    numero: "10-009-023847-4",
    tipo: "Cuenta Ahorro",
    titular: "FRANKLYN SANTOS",
  },
];

export default function Estafetas() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (numero, index) => {
    navigator.clipboard.writeText(numero);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 text-gray-800 tracking-tight">
        Estafetas de Pago y Métodos de Pago
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Puedes pagar tu factura en cualquiera de nuestros puntos autorizados
        o mediante transferencia bancaria.
      </p>

      {/* Cuentas Bancarias */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-7 mb-12 shadow-lg">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2 mb-3">
          <FaMoneyCheckAlt className="text-blue-500" />
          Cuentas Bancarias para Transferencias
        </h2>
        <p className="text-red-600 font-semibold mb-2">
          ⚠️ Incluye tu <span className="underline">código de cliente</span> o
          <span className="underline"> nombre completo</span> en la descripción del pago.
        </p>
        <p className="text-gray-700 mb-4 text-[15px]">
          Es indispensable enviar el comprobante de pago al 809-582-1212 para poder aplicarlo.<br />
          <span className="text-red-500 font-bold">
            Sin el comprobante no podremos procesar tu pago.
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cuentasBancarias.map((cuenta, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col shadow group hover:shadow-xl transition"
            >
              <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2 mb-2">
                <FaUniversity className="text-indigo-500" />
                {cuenta.banco}
              </h3>
<p className="text-gray-700 mb-1 flex items-center">
  <span className="font-semibold mr-1">Número: </span>
  <span className="text-gray-900 font-mono flex items-center">
    {cuenta.numero}
    <button
      onClick={() => handleCopy(cuenta.numero, index)}
      className="text-indigo-600 hover:text-indigo-800 ml-1"
      title="Copiar número"
    >
      {copiedIndex === index ? <FaCheck /> : <FaRegCopy />}
    </button>
  </span>
</p>

              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Tipo: </span>
                {cuenta.tipo}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Titular: </span>
                {cuenta.titular}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Estafetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {estafetas.map((punto) => (
          <div
            key={punto.id}
            className="flex flex-col md:flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition"
          >
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-blue-50 flex items-center justify-center p-3">
              <img
                src={punto.imagen}
                alt={punto.nombre}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-1">
                  {punto.nombre}
                </h2>
                <p className="text-gray-700 text-lg font-medium mb-1">
                  {punto.descripcion}
                </p>
                <p className="text-gray-600 mb-1">{punto.direccion}</p>
                <p className="text-green-600 flex items-center gap-2 mb-2">
                  <FaWhatsapp className="text-green-500" />
                  {punto.telefono}
                </p>
              </div>
              <a
                href={punto.ubicacionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-3 font-semibold flex items-center gap-2"
              >
                <span role="img" aria-label="location">📍</span>
                Ver Ubicación
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 mt-12 text-lg">
        ¡Agradecemos su preferencia! Estamos para servirle.
      </p>
    </div>
  );
}
