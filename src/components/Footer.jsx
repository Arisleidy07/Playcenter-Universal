import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./../styles/footer.css";

function Footer() {
  return (
    <div className="block">
      <footer className="relative bg-black text-gray-300 px-6 py-12 sm:px-10 lg:px-16">
        {/* Estrellas móviles para fondo */}
        <div className="sm:hidden">
          {["box-of-star1", "box-of-star2", "box-of-star3", "box-of-star4"].map((box) => (
            <div key={box} className={box}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`star star-position${i + 1}`}></div>
              ))}
            </div>
          ))}
        </div>

        {/* Logo centrado arriba */}
        <div className="w-full flex justify-center mb-10 relative z-20">
          <img
            src="/Playlogo.png"
            alt="Playcenter Universal Logo"
            className="w-40 sm:w-52 lg:w-64 transition-transform duration-300 hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
          />
        </div>

        {/* Contenido de columnas */}
        <div className="footer-content">
          {/* Empresa + contacto */}
          <div className="text-center sm:text-left">
            <h3 className="text-white text-lg font-bold mb-4">Playcenter Universal</h3>
            <p>Tu universo de tecnología y gaming en Santiago, R.D.</p>
            <p className="mt-3 flex justify-center sm:justify-start items-center gap-2">
              <FaMapMarkerAlt /> Av. Estrella Sadhalá #55, frente a la doble vía, Santiago, R.D.
            </p>
            <p className="mt-3 flex justify-center sm:justify-start items-center gap-2">
              <FaPhoneAlt /> +1 (809) 582-1212 (Internet)
            </p>
            <p className="mt-2 flex justify-center sm:justify-start items-center gap-2">
              <FaPhoneAlt /> +1 (849) 635-7000 (Tienda)
            </p>
            <p className="mt-2 flex justify-center sm:justify-start items-center gap-2">
              <FaEnvelope /> playcenter121@gmail.com
            </p>
          </div>

          {/* Navegación */}
          <div className="text-center sm:text-left">
            <h3 className="text-white text-lg font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2">
              {[
                ["Categorías", "/categorias"],
                ["Nosotros", "/nosotros"],
                ["Contáctanos", "/contacto"],
                ["Estafetas", "/estafetas"],
                ["Carrito", "/carrito"],
                ["Mi perfil", "/Profile"],
              ].map(([text, url]) => (
                <li key={text}>
                  <a
                    href={url}
                    className="hover:text-cyan-400 transition duration-300 ease-in-out"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Horario */}
          <div className="text-center sm:text-left">
            <h3 className="text-white text-lg font-semibold mb-4">Horario</h3>
            <p>Lunes a Viernes: 8:30am - 5:30pm</p>
            <p>Sábados: 8:30am - 12:30pm</p>
            <p>Domingos: Cerrado</p>
          </div>

          {/* Redes sociales */}
          <div className="text-center sm:text-left">
            <h3 className="text-white text-xl font-bold mb-4">Conéctate con nosotros</h3>
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
                    className="w-16 h-16 rounded-full transition-transform duration-300 transform group-hover:scale-110 group-hover:shadow-[0_0_15px_3px_rgba(0,255,255,0.6)]"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer final */}
        <p className="text-center text-gray-500 text-xs mt-10 relative z-20">
          © {new Date().getFullYear()} Playcenter Universal. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Footer;
