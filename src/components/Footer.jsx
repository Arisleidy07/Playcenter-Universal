import React from "react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Empresa */}
        <div>
          <h3 className="text-white text-xl font-bold mb-4">Playcenter Universal</h3>
          <p>Tu universo de tecnología, estilo e innovación en Santiago, R.D.</p>
          <p className="mt-2 flex items-center gap-2"><FaPhoneAlt /> +1 (809) 582-1212</p>
          <p className="flex items-center gap-2"><FaEnvelope /> info@playcenteruniversal.com</p>
        </div>

        {/* Enlaces rápidos */}
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
          <p>Lunes a Viernes: 9:00am - 6:00pm</p>
          <p>Sábados: 10:00am - 2:00pm</p>
          <p>Domingo: Cerrado</p>
        </div>

        {/* Redes Sociales */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Síguenos</h3>
          <div className="flex flex-col gap-3 text-base">

            <a href="https://www.facebook.com/pcu12" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-blue-500 transition">
              <FaFacebookF className="text-xl" />
              Facebook
            </a>

            <a href="https://www.instagram.com/playcenter_universal/?hl=es" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-pink-500 transition">
              <FaInstagram className="text-xl" />
              Instagram
            </a>

            <a href="https://www.tiktok.com/@playcenter_universal?lang=es" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-gray-100 transition">
              <FaTiktok className="text-xl" />
              TikTok
            </a>

            <a href="https://youtube.com/@playcenteruniversal1916?si=MNDwY6v_iW2SowkB" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-white hover:text-red-500 transition">
              <FaYoutube className="text-xl" />
              YouTube
            </a>

          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-10">
        © {new Date().getFullYear()} Playcenter Universal. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;
