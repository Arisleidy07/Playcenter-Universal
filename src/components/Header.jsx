import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import Entrega from "./Entrega";

const Header = () => {
  const { usuario, usuarioInfo, logout } = useAuth();
  const { setModalAbierto } = useAuthModal();
  const buscarInputRef = useRef(null);
  const navigate = useNavigate();
  let lastScroll = 0;

  const [modalEntrega, setModalEntrega] = useState(false);
  const entregaSubtitle = (() => {
    try {
      if (!usuario || !usuarioInfo || !usuarioInfo.metodoEntrega) {
        return "Selecciona método de entrega";
      }
      const metodo = (usuarioInfo.metodoEntrega || "").toLowerCase();
      if (metodo === "tienda") return "Recoger en tienda";
      const dir = (usuarioInfo.direccion || "").trim();
      if (!dir) return "Selecciona método de entrega";
      if (/maps\.|google\.com\/maps|Ubicación:/i.test(dir)) {
        return "Dirección de Google Maps";
      }
      // No truncar en el Header: mostrar dirección completa
      return dir;
    } catch {
      return "Selecciona método de entrega";
    }
  })();

  const manejarLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  useEffect(() => {
    if (buscarInputRef.current) {
      buscarInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleScroll() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll) {
        // antes ocultaba el banner de envíos en móvil
      } else {
        // antes lo mostraba
      }
      lastScroll = currentScroll;
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full bg-white shadow-md z-[9999] pl-0 pr-4 py-3"
        style={{
          backdropFilter: "saturate(180%) blur(15px)",
          maxWidth: "100vw",
          overflowX: "hidden",
        }}
      >
        <div className="flex items-center justify-between w-full gap-3">
          {/* Buscador solo móvil/tablet */}
          <div
            id="search-bar-container"
            className="flex-grow max-w-full px-2 xl:hidden"
          >
            <SearchBar
              onClose={() => {}}
              ref={buscarInputRef}
              placeholder="Buscar en pcu.com.do"
            />
          </div>

          {/* Header completo solo desktop */}
          <div className="hidden xl:flex w-full items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <img
                src="/Playlogo.png"
                alt="Playcenter Universal"
                className="h-10 object-contain"
              />
              {/* Método de entrega (movido al header) */}
              <button
                type="button"
                onClick={() => {
                  if (!usuario) return setModalAbierto(true);
                  setModalEntrega(true);
                }}
                className="flex flex-col leading-tight text-left text-xs text-gray-700 font-medium hover:text-[#0ea5e9] transition"
              >
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <FaMapMarkerAlt className="text-[#4FC3F7]" />
                  Método de entrega
                </span>
                <strong
                  className="block text-[12px] font-semibold text-gray-700 tracking-wide truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[220px]"
                  title={entregaSubtitle}
                >
                  {entregaSubtitle}
                </strong>
              </button>
            </Link>

            <div className="flex-grow max-w-xl">
              <SearchBar
                onClose={() => {}}
                ref={buscarInputRef}
                placeholder="Buscar en pcu.com.do"
              />
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link to="/" className="nav-link hover:text-[#4FC3F7] transition">Inicio</Link>
              <Link to="/categorias" className="nav-link hover:text-[#4FC3F7] transition">Categorías</Link>
              <Link to="/tiendas" className="nav-link hover:text-[#4FC3F7] transition">Tiendas</Link>
              <Link to="/vender" className="nav-link hover:text-[#4FC3F7] transition">Vender</Link>
              <Link to="/nosotros" className="nav-link hover:text-[#4FC3F7] transition">Nosotros</Link>
              <Link to="/contacto" className="nav-link hover:text-[#4FC3F7] transition">Contáctanos</Link>
              <Link to="/estafetas" className="nav-link hover:text-[#4FC3F7] transition">Estafetas</Link>
              <Link to="/carrito" className="nav-link text-xl hover:scale-110 transition">🛒</Link>
              {(usuarioInfo?.isAdmin || usuarioInfo?.empresa) && (
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded bg-[#4FC3F7] text-white hover:bg-[#3BB0F3] shadow transition"
                >
                  Panel Admin
                </Link>
              )}

              {usuario ? (
                <motion.div className="relative" whileTap={{ scale: 0.95 }}>
                  <Link to="/profile">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4FC3F7] shadow hover:shadow-lg transition cursor-pointer bg-white">
                      {usuario.photoURL ? (
                        <img src={usuario.photoURL} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-[#4FC3F7] text-white flex items-center justify-center font-bold text-base">
                          {usuario.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setModalAbierto(true)}
                  className="px-4 py-2 text-sm bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-lg font-semibold shadow transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Iniciar sesión
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Botón admin en móvil */}
      {(usuarioInfo?.isAdmin || usuarioInfo?.empresa) && (
        <div className="xl:hidden fixed bottom-[80px] right-4 z-[9999]">
          <Link
            to="/admin"
            className="bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white px-5 py-3 rounded-full shadow-xl font-semibold text-base"
          >
            Panel Admin
          </Link>
        </div>
      )}

      {/* Modal de entrega (desde header) */}
      {modalEntrega && usuario && (
        <Entrega
          abierto={modalEntrega}
          onClose={() => setModalEntrega(false)}
          usuarioId={usuarioInfo?.uid || usuario?.uid}
          direccionEditar={null}
          actualizarLista={() => {}}
        />
      )}

      {/* Espaciador debajo del header: usa offset dinámico (header + topbar) */}
      <div
        className="h-[100px] sm:h-[70px]"
        style={{ height: "var(--content-offset, 100px)" }}
      />
    </>
  );
};

export default Header;
