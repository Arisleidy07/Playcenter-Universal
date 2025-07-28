import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ModalLoginAlert from "./ModalLoginAlert";
import { useNavigate } from "react-router-dom";
import "./../styles/footer.css";

function Footer() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleClick = (e, ruta) => {
    if (!usuario) {
      e.preventDefault();
      setModalAbierto(true);
    } else {
      navigate(ruta);
    }
  };

  const cerrarModal = () => setModalAbierto(false);
  const irLogin = () => {
    cerrarModal();
    navigate("/login"); // Ajusta la ruta si tu login está en otra
  };

  return (
    <div className="footer-block">
      <footer className="footer futuristic-footer relative bg-black text-gray-300 py-12 text-sm sm:text-base">
        <div className="footer-bg-animated" />
        <div className="w-full flex justify-center mb-10 relative z-20">
          <img
            src="/Playlogo.png"
            alt="Playcenter Universal Logo"
            className="footer-logo-glow w-32 sm:w-44 lg:w-64 transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">

          <div className="footer-col">
            <h3 className="footer-title-neon text-base sm:text-lg font-bold mb-3">Playcenter Universal</h3>
            <p>Tu universo de tecnología y gaming en Santiago, R.D.</p>
            <p className="mt-3 flex justify-center sm:justify-start items-center gap-2">
              <FaMapMarkerAlt /> Av. Estrella Sadhalá #55, frente a la doble vía
            </p>
            <p className="mt-2 flex justify-center sm:justify-start items-center gap-2">
              <FaPhoneAlt /> +1 (809) 582-1212 (Internet)
            </p>
            <p className="mt-2 flex justify-center sm:justify-start items-center gap-2">
              <FaPhoneAlt /> +1 (849) 635-7000 (Tienda)
            </p>
            <p className="mt-2 flex justify-center sm:justify-start items-center gap-2">
              <FaEnvelope /> playcenter121@gmail.com
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-title-neon text-base sm:text-lg font-semibold mb-3">Navegación</h3>
            <ul className="space-y-2">
              {[
                ["Categorías", "/categorias", false],
                ["Nosotros", "/nosotros", false],
                ["Contáctanos", "/contacto", false],
                ["Estafetas", "/estafetas", false],
                ["Carrito", "/carrito", true],
                ["Mi perfil", "/Profile", true],
              ].map(([text, url, protegido]) => (
                <li key={text}>
                  {protegido ? (
                    <a
                      href={url}
                      onClick={(e) => handleClick(e, url)}
                      className="footer-link-neon hover:text-cyan-400 transition duration-300 ease-in-out text-xs sm:text-sm cursor-pointer"
                    >
                      {text}
                    </a>
                  ) : (
                    <a
                      href={url}
                      className="footer-link-neon hover:text-cyan-400 transition duration-300 ease-in-out text-xs sm:text-sm"
                    >
                      {text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-title-neon text-base sm:text-lg font-semibold mb-3">Horario</h3>
            <p>Lunes a Viernes: 8:30am - 5:30pm</p>
            <p>Sábados: 8:30am - 12:30pm</p>
            <p>Domingos: Cerrado</p>
          </div>

          <div className="footer-col">
            <h3 className="footer-title-neon text-base sm:text-lg font-bold mb-3">Conéctate con nosotros</h3>
            <div className="grid grid-cols-2 gap-4 justify-items-center sm:justify-items-start">
              {[
                ["https://www.facebook.com/pcu12", "/Facebook.png", "Facebook"],
                ["https://www.instagram.com/playcenter_universal/?hl=es", "/Instagram.png", "Instagram"],
                ["https://www.tiktok.com/@playcenter_universal?lang=es", "/tiktok.png", "TikTok"],
                ["https://youtube.com/@playcenteruniversal1916", "/Youtube.png", "YouTube"],
              ].map(([url, imgSrc, alt]) => (
                <a
                  key={alt}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative group"
                >
                  <img
                    src={imgSrc}
                    alt={alt}
                    className="footer-social-icon-neon w-12 h-12 sm:w-16 sm:h-16 rounded-full transition-transform duration-300 transform group-hover:scale-110"
                  />
                </a>
              ))}
            </div>
          </div>

        </div>

        <p className="footer-copyright text-center text-gray-500 text-[11px] sm:text-xs mt-10 relative z-20">
          © {new Date().getFullYear()} Playcenter Universal. Todos los derechos reservados.
        </p>

        <ModalLoginAlert
          isOpen={modalAbierto}
          onClose={cerrarModal}
          onIniciarSesion={irLogin}
        />
      </footer>
    </div>
  );
}

export default Footer;
