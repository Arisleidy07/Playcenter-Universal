import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import "./../styles/footer.css";

function Footer() {
  return (
    <footer className="relative bg-black text-gray-300 px-6 py-12 mt-20 overflow-hidden">
      {/* ESTRELLAS */}
      <div className="box-of-star1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`star star-position${i + 1}`}></div>
        ))}
      </div>
      <div className="box-of-star2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`star star-position${i + 1}`}></div>
        ))}
      </div>
      <div className="box-of-star3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`star star-position${i + 1}`}></div>
        ))}
      </div>
      <div className="box-of-star4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`star star-position${i + 1}`}></div>
        ))}
      </div>

      {/* ASTRONAUTA */}
      <div data-js="astro" className="astronaut">
        <div className="head"></div>
        <div className="arm arm-left"></div>
        <div className="arm arm-right"></div>
        <div className="body">
          <div className="panel"></div>
        </div>
        <div className="leg leg-left"></div>
        <div className="leg leg-right"></div>
        <div className="schoolbag"></div>
      </div>

      {/* CONTENIDO DEL FOOTER */}
      <div className="relative z-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Empresa */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Playcenter Universal</h3>
          <p>Tu universo de tecnología, estilo e innovación en Santiago, R.D.</p>
          <p className="mt-2 flex items-center gap-2"><FaPhoneAlt /> +1 (809) 582-1212  (Internet)</p>
          <p className="mt-2 flex items-center gap-2"><FaPhoneAlt /> +1 (849) 635-7000 (Tienda)</p>
          <p className="flex items-center gap-2"><FaEnvelope /> playcenter121@gmail.com</p>
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Enlaces útiles</h3>
          <ul className="space-y-2">
            <li><a href="/productos" className="hover:text-white transition">Productos</a></li>
            <li><a href="/productos/ofertas-especiales" className="hover:text-white transition">Ofertas Especiales</a></li>
            <li><a href="/favoritos" className="hover:text-white transition">Favoritos</a></li>
            <li><a href="/contacto" className="hover:text-white transition">Contáctanos</a></li>
          </ul>
        </div>

        {/* Horario */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Horario</h3>
          <p>Lunes a Viernes: 8:30am - 5:30pm</p>
          <p>Sábados: 8:30am - 12:30pm</p>
          <p>Domingo: Cerrado</p>
        </div>

        {/* Redes */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Síguenos</h3>
          <div className="flex flex-col gap-3 text-base">
            <a href="https://www.facebook.com/pcu12" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-blue-500 transition">
              <FaFacebookF className="text-xl" /> Facebook
            </a>
            <a href="https://www.instagram.com/playcenter_universal/?hl=es" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-pink-500 transition">
              <FaInstagram className="text-xl" /> Instagram
            </a>
            <a href="https://www.tiktok.com/@playcenter_universal?lang=es" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-gray-100 transition">
              <FaTiktok className="text-xl" /> TikTok
            </a>
            <a href="https://youtube.com/@playcenteruniversal1916" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-red-500 transition">
              <FaYoutube className="text-xl" /> YouTube
            </a>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-10 relative z-20">
        © {new Date().getFullYear()} Playcenter Universal. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
