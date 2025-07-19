import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaWhatsapp, FaShoppingCart, FaTrash } from "react-icons/fa";
import productosAll from "../data/productosAll";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";
import BotonPayPal from "../components/BotonPayPal";

function GaleriaImagenes({ imagenes }) {
  const [imagenActiva, setImagenActiva] = useState(0);

  return (
    <div>
      <div className="border rounded-md overflow-hidden mb-4 h-[420px] flex items-center justify-center bg-white">
        <img
          src={imagenes[imagenActiva]}
          alt={`Imagen ${imagenActiva + 1}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {imagenes.map((img, i) => (
          <button
            key={i}
            onClick={() => setImagenActiva(i)}
            className={`border rounded-md p-1 flex-shrink-0 transition-transform hover:scale-110 ${
              i === imagenActiva ? "border-blue-600" : "border-gray-300"
            }`}
            aria-label={`Seleccionar imagen ${i + 1}`}
          >
            <img
              src={img}
              alt={`Miniatura ${i + 1}`}
              className="w-16 h-16 object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function VistaProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);

  const todos = productosAll.flatMap((cat) => cat.productos);
  const producto = todos.find((p) => p.id === id);

  if (!producto)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-center text-xl font-semibold text-gray-700">
          Producto no encontrado.
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 underline ml-2"
          >
            Volver
          </button>
        </p>
      </div>
    );

  const estaEnCarrito = carrito.some((item) => item.id === producto.id);

  const mensajeWhatsApp = `https://wa.me/18496357000?text=${encodeURIComponent(
    `¡Hola! Estoy interesado/a en el producto "${producto.nombre}". ¿Sigue disponible?`
  )}`;

  const handleAgregarCarrito = () => {
    if (!usuario) {
      setModalAbierto(true);
      return;
    }
    if (estaEnCarrito) {
      quitarDelCarrito(producto.id);
    } else {
      agregarAlCarrito({ ...producto, cantidad: 1 });
    }
  };

  return (
    <>
      <main className="min-h-screen bg-white p-8 max-w-6xl mx-auto font-sans">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:underline font-semibold text-lg"
        >
          ← Volver
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Galería */}
          <div className="lg:w-1/2">
            <GaleriaImagenes imagenes={producto.imagenes || [producto.imagen]} />
          </div>

          {/* Info */}
          <div className="lg:w-1/2 flex flex-col justify-between">
            <section>
              <h1 className="text-4xl font-extrabold mb-3 leading-tight text-gray-900">
                {producto.nombre}
              </h1>

              {/* Descripción justo debajo del título */}
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {producto.descripcion ||
                  "Contáctanos para más detalles o para coordinar una compra en nuestra tienda física."}
              </p>

              {/* Precio */}
              <p className="text-3xl text-[#FF9900] font-extrabold mb-8">
                ${producto.precio.toFixed(2)}
              </p>

              {/* Botones agregar carrito y WhatsApp */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAgregarCarrito}
                  className={`flex items-center justify-center gap-3 rounded-full px-6 py-3 font-semibold transition hover:scale-105 shadow-md text-lg ${
                    estaEnCarrito
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                  aria-label={estaEnCarrito ? "Quitar del carrito" : "Agregar al carrito"}
                >
                  {estaEnCarrito ? <FaTrash size={18} /> : <FaShoppingCart size={18} />}
                  {estaEnCarrito ? " Quitar del carrito" : " Agregar al carrito"}
                </button>

                <a
                  href={mensajeWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold shadow-md text-lg transition hover:scale-105"
                  aria-label="Escribir por WhatsApp"
                >
                  <FaWhatsapp size={22} />
                  Escribir por WhatsApp
                </a>
              </div>

              {/* Botón PayPal */}
              <div className="max-w-xs">
                <BotonPayPal nombre={producto.nombre} precio={producto.precio} />
              </div>
            </section>
          </div>
        </div>
      </main>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
}
