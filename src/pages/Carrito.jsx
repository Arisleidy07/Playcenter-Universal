    // src/pages/Carrito.jsx
    import React from "react";
    import { useCarrito } from "../context/CarritoContext";
    import { useNavigate } from "react-router-dom";
    import productosAll from "../data/productosAll";
    import { FaTrash } from "react-icons/fa";

    export default function Carrito() {
    const { carrito, agregarAlCarrito, eliminarUnidadDelCarrito, quitarDelCarrito } = useCarrito();
    const navigate = useNavigate();
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const getVarianteActiva = (producto) => {
        let productoReal = null;
        for (const categoria of productosAll) {
        const encontrado = categoria.productos.find((p) => p.id === producto.id);
        if (encontrado) {
            productoReal = encontrado;
            break;
        }
        }
        if (!productoReal) return { cantidad: 0 };
        return productoReal.variantes?.[0] || { cantidad: 0 };
    };

    return (
        <main className="pt-24 px-4 sm:px-6 lg:px-12 pb-16 min-h-screen bg-gray-100 text-gray-900">
        <h1 className="text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-text-glow">
            Mi Carrito
        </h1>

        {carrito.length === 0 ? (
            <p className="text-center text-gray-500 text-lg">Tu carrito está vacío.</p>
        ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {carrito.map((item) => {
                const varianteActiva = getVarianteActiva(item);

                let colorTexto = "text-green-600";
                let textoStock = `Disponible (${varianteActiva.cantidad})`;

                if (varianteActiva.cantidad === 0) {
                    colorTexto = "text-red-600";
                    textoStock = "No disponible";
                } else if (varianteActiva.cantidad <= 2) {
                    colorTexto = "text-yellow-600";
                    textoStock = `Casi agotado (${varianteActiva.cantidad})`;
                }

                return (
                    <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer"
                    onClick={() => navigate(`/producto/${item.id}`)}
                    >
                    {/* Imagen */}
                    <img
                        src={item.imagen || item.imagenes?.[0]}
                        alt={item.nombre}
                        className="w-full sm:w-32 h-32 object-contain rounded-xl"
                    />

                    {/* Información */}
                    <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
                        <h2 className="text-lg font-semibold leading-snug">{item.nombre}</h2>
                        <p className={`text-sm mt-1 font-semibold ${colorTexto}`}>{textoStock}</p>

                        {/* Cantidad y botones */}
                        <div className="flex items-center gap-3 mt-3">
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            eliminarUnidadDelCarrito(item.id);
                            }}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-semibold transition"
                            disabled={varianteActiva.cantidad === 0}
                        >
                            -
                        </button>
                        <span className="font-semibold">{item.cantidad}</span>
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            if (item.cantidad < varianteActiva.cantidad) agregarAlCarrito(item);
                            }}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-lg font-semibold transition"
                            disabled={item.cantidad >= varianteActiva.cantidad}
                        >
                            +
                        </button>
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            quitarDelCarrito(item.id);
                            }}
                            className="ml-4 text-red-500 hover:text-red-600 font-semibold transition"
                        >
                            <FaTrash />
                        </button>
                        </div>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 sm:mt-0 text-right text-xl font-bold text-blue-600">
                        ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                    </div>
                );
                })}
            </div>

            {/* Botón de pagar */}
            <div className="mt-8 flex justify-center">
                <button
                onClick={() => alert("Redirigiendo a pago...")}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 hover:scale-105"
                >
                Proceder al pago - ${total.toFixed(2)}
                </button>
            </div>
            </>
        )}
        </main>
    );
    }
