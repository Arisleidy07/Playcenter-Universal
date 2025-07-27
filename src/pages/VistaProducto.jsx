// VistaProducto.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp, FaShoppingCart } from "react-icons/fa";
import GaleriaImagenes from "../components/GaleriaImagenes";
import productosAll from "../data/productosAll";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "../components/ModalLoginAlert";

function VistaProducto() {
  const { carrito, agregarAlCarrito, quitarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState(null);

  // Unifica todos los productos de todas las categorías
  const todos = productosAll.flatMap((categoria) => categoria.productos);
  const producto = todos.find((p) => p.id === id);
  const estaEnCarrito = carrito.some((item) => item.id === producto?.id);

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-4">
        <p className="text-center text-xl font-semibold">
          Producto no encontrado.
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 underline ml-2"
          >
            Volver
          </button>
        </p>
      </div>
    );
  }

  // Determina la variante activa
  const varianteActiva =
    producto.variantes?.find((v) => v.color === colorSeleccionado) ||
    producto.variantes?.[0];

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

  // Solo muestra selector de color si hay variantes con color
  const variantesConColor = producto.variantes?.filter(
    (v) => v.color && v.color.trim() !== ""
  );

  return (
    <>
      <main className="min-h-screen bg-white px-4 py-10 text-gray-800 flex justify-center">
        <section className="max-w-6xl w-full flex flex-col lg:flex-row gap-10">
          {/* Columna Izquierda: Imagen + miniaturas + colores */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full lg:w-1/2"
          >
            <GaleriaImagenes
              imagenes={
                varianteActiva?.imagenes?.length
                  ? varianteActiva.imagenes
                  : producto.imagenes || [producto.imagen]
              }
            />

            {/* Cuadros de colores SOLO si existen variantes con color */}
            {variantesConColor && variantesConColor.length > 1 && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                {variantesConColor.map((variante, i) => (
                  <div
                    key={i}
                    onClick={() => setColorSeleccionado(variante.color)}
                    className={`border-2 p-1 rounded-md cursor-pointer transition-transform hover:scale-105 ${
                      colorSeleccionado === variante.color
                        ? "border-yellow-500"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={variante.imagen}
                      alt={variante.color || "Variante"}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <p className="text-xs text-center mt-1 font-medium capitalize">
                      Color {variante.color}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Columna Centro: Info del producto */}
          <motion.div
            className="flex flex-col gap-4 w-full lg:w-1/2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333]">
              {producto.nombre}
            </h1>

            <motion.p
              className="text-gray-700 text-base sm:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {producto.descripcion ||
                "Contáctanos para más detalles o para coordinar una compra en nuestra tienda física."}
            </motion.p>

            {producto.acerca && (
              <div>
                <h3 className="font-bold text-gray-800 mt-4 mb-2">
                  Acerca de este artículo:
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {producto.acerca.map((detalle, i) => (
                    <li key={i}>{detalle}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* Columna Derecha: Compra */}
          <div className="w-full lg:w-80 bg-gray-50 rounded-xl border p-5 shadow-md flex flex-col gap-4 h-fit">
            <p className="text-xl font-semibold text-[#FF9900]">
              RD${producto.precio.toFixed(2)}
            </p>

            {varianteActiva?.cantidad !== undefined && (
              <p
                className={`text-sm font-medium ${
                  varianteActiva.cantidad === 0
                    ? "text-red-600"
                    : varianteActiva.cantidad <= 2
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {varianteActiva.cantidad === 0
                  ? "No disponible"
                  : `Quedan ${varianteActiva.cantidad} disponibles`}
              </p>
            )}

            <button
              onClick={handleAgregarCarrito}
              disabled={varianteActiva?.cantidad === 0}
              className={`w-full inline-flex justify-center items-center gap-3 px-6 py-3 rounded-full shadow transition-transform hover:scale-105 font-semibold ${
                estaEnCarrito
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              } ${
                varianteActiva?.cantidad === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FaShoppingCart className="text-xl" />
              {estaEnCarrito ? "Quitar del carrito" : "Agregar al carrito"}
            </button>

            <a
              href={mensajeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow transition-transform hover:scale-105 w-full"
            >
              <FaWhatsapp className="text-2xl" />
              Escribir por WhatsApp
            </a>
          </div>
        </section>
      </main>

      <ModalLoginAlert
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </>
  );
}

export default VistaProducto;
