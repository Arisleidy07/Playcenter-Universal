import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const ADMIN_UID = "ZeiFzBgosCd0apv9cXL6aQZCYyu2"; // Cambia este UID por el tuyo

export default function Admin() {
  const { usuario } = useAuth();

  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!usuario || usuario.uid !== ADMIN_UID) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        No tienes acceso a esta página
      </div>
    );
  }

  const buscarUsuario = async () => {
    setLoading(true);
    setError("");
    setUsuarioEncontrado(null);
    setPedidos([]);

    try {
      // Buscar usuario por códigoUnico en collection "users"
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("codigoUnico", "==", codigoBusqueda));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No se encontró ningún usuario con ese código.");
        setLoading(false);
        return;
      }

      // Tomamos el primer usuario encontrado
      const userDoc = querySnapshot.docs[0];
      setUsuarioEncontrado({ id: userDoc.id, ...userDoc.data() });

      // Buscar pedidos asociados con ese código único en collection "orders"
      const ordersRef = collection(db, "orders");
      const qOrders = query(
        ordersRef,
        where("codigoUnicoUsuario", "==", codigoBusqueda)
      );
      const ordersSnapshot = await getDocs(qOrders);

      const listaPedidos = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPedidos(listaPedidos);
    } catch (err) {
      console.error(err);
      setError("Error al buscar usuario o pedidos.");
    }
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Panel Admin - Buscar Usuario</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Ingresa código único (ej: USER-ABC123)"
          value={codigoBusqueda}
          onChange={(e) => setCodigoBusqueda(e.target.value.toUpperCase())}
          className="flex-grow border border-gray-300 rounded px-4 py-2"
        />
        <button
          onClick={buscarUsuario}
          disabled={!codigoBusqueda || loading}
          className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {usuarioEncontrado && (
        <section className="mb-8 border border-gray-300 rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-3">Datos del Usuario</h2>
          <p>
            <strong>Nombre:</strong>{" "}
            {usuarioEncontrado.displayName || "No definido"}
          </p>
          <p>
            <strong>Email:</strong> {usuarioEncontrado.email || "No definido"}
          </p>
          <p>
            <strong>Teléfono:</strong>{" "}
            {usuarioEncontrado.telefono || "No definido"}
          </p>
          <p>
            <strong>Dirección:</strong>{" "}
            {usuarioEncontrado.direccion || "No definido"}
          </p>
          <p>
            <strong>Código único:</strong> {usuarioEncontrado.codigoUnico}
          </p>
        </section>
      )}

      {pedidos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Pedidos del Usuario</h2>
          <ul className="space-y-4">
            {pedidos.map((pedido) => (
              <li
                key={pedido.id}
                className="border border-gray-300 rounded p-3 shadow hover:shadow-md transition"
              >
                <p>
                  <strong>ID Pedido:</strong> {pedido.id}
                </p>
                <p>
                  <strong>Producto:</strong> {pedido.producto || "No definido"}
                </p>
                <p>
                  <strong>Monto:</strong> ${pedido.monto || "0"}
                </p>
                <p>
                  <strong>Estado:</strong> {pedido.estado || "Pendiente"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {pedido.fecha
                    ? new Date(pedido.fecha.seconds * 1000).toLocaleString()
                    : "No definida"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {usuarioEncontrado && pedidos.length === 0 && (
        <p>Este usuario no tiene pedidos registrados.</p>
      )}
    </main>
  );
}
