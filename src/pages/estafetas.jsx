// src/pages/estafetas.jsx
import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const estafetas = [
  {
    id: 1,
    nombre: "Estafeta Villa-Olímpica",
    descripcion: "Minimarket Los Hermanos",
    direccion: "Calle Penetración Nº 1, Suburbanización Mare López, La villa-Olímpica, Próximo a la calle 1",
    telefono: "809-626-3262",
    ubicacionLink: "https://www.google.com/maps/place/19%C2%B025'43.1%22N+70%C2%B041'12.7%22W/@19.4286338,-70.6894342,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.4286338!4d-70.6868593?hl=es&entry=ttu&g_ep=EgoyMDI1MDcxMy4wIKXMDSoASAFQAw%3D%3D",
    imagen: "/estafetas/loshermanos.png",
  },
  {
    id: 2,
    nombre: "Estafeta Nibaje",
    descripcion: "Cafetería Guido",
    direccion: "Avenida Franco Vido, Nº 148, Nibaje",
    telefono: "829-324-2318",
    ubicacionLink: "https://www.google.com/maps/place//@19.420887,-70.6811611,3857m/data=!3m2!1e3!4b1?entry=ttu&g_ep=EgoyMDI1MDcxMy4wIKXMDSoASAFQAw%3D%3D",
    imagen: "/estafetas/cafeteria-guido.png",
  },
  {
    id: 3,
    nombre: "Estafeta El Ensueño",
    descripcion: "Salón y Cafetería Marais",
    direccion: "Calle Paseo de los Locutores, Esquina 11, El Ensueño",
    telefono: "829-755-3636",
    ubicacionLink: "https://www.google.com/maps/place/19%C2%B026'22.4%22N+70%C2%B041'26.1%22W/@19.439565,-70.690574,964m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d19.439565!4d-70.690574?entry=ttu&g_ep=EgoyMDI1MDcxMy4wIKXMDSoASAFQAw%3D%3D",
    imagen: "/estafetas/salon-y-cafeteria-maraez.png",
  },
  {
    id: 4,
    nombre: "Estafeta La Lotería",
    descripcion: "Colmado Espinal",
    direccion: "La Lotería, calle Salcedo, Nº 10",
    telefono: "829-288-9168",
    ubicacionLink: "https://www.google.com/maps/place/19.439565,-70.690574/data=!4m6!3m5!1s0!7e2!8m2!3d19.439564999999998!4d-70.690574?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBjI1LjUuMhgAIJ6dCipjLDk0MjIzMjk5LDk0MjE2NDEzLDk0MjEyNDk2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE3NTIzLDk0MjE4NjUzLDk0MjI5ODM5LDQ3MDg0MzkzLDk0MjEzMjAwQgJETw%3D%3D",
    imagen: "/estafetas/colmado-espinal.png",
  },
  {
    id: 5,
    nombre: "Estafeta La Villa-Olímpica",
    descripcion: "Palmatec Solutions",
    direccion: "Villa-Olímpica, frente Manzana F, al lado del antiguo Colegio Génesis",
    telefono: "809-785-3354",
    ubicacionLink: "https://www.google.com/maps/place/19.435309,-70.685961/data=!4m6!3m5!1s0!7e2!8m2!3d19.435309!4d-70.68596099999999?utm_source=mstt_1&entry=gps&coh=192189&g_ep=CAESBzI1LjE1LjEYACCenQoqbCw5NDIyMzI5OSw5NDIxNjQxMyw5NDIxMjQ5Niw5NDIwNzM5NCw5NDIwNzUwNiw5NDIwODUwNiw5NDIxNzUyMyw5NDIxODY1Myw5NDIyOTgzOSw0NzA4NDM5Myw5NDIxMzIwMCw5NDI1ODMxOUICRE8%3D&skid=6704c7a4-6142-43db-8da6-6afdce825e92",
    imagen: "/estafetas/palmatech-solution.png",
  },
  {
    id: 6,
    nombre: "Estafeta en Sánchez Bermúdez",
    descripcion: "St Electronics",
    direccion: "Calle 11, número 27, Sánchez Bermúdez",
    telefono: "849-437-3100",
    ubicacionLink: "https://www.google.com/maps/place/Espailla,+51000+Santiago+de+los+Caballeros/@19.4717075,-70.7148707,964m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8eb1c5e2c3c79d7d:0x3a75c6d5f2312708!8m2!3d19.4717075!4d-70.7148707!16s%2Fg%2F1hhnxy766?entry=ttu&g_ep=EgoyMDI1MDcxMy4wIKXMDSoASAFQAw%3D%3D",
    imagen: "/estafetas/St electronics.png",
  },
];

export default function Estafetas() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Estafetas de Pago y Métodos de Pago</h1>
      <p className="text-center text-gray-600 mb-6">Ahora puedes pagar tu factura en cualquiera de nuestros puntos autorizados</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {estafetas.map((punto) => (
          <div
            key={punto.id}
            className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="w-full md:w-1/2 h-80 bg-gray-100 flex items-center justify-center">
              <img
                src={punto.imagen}
                alt={punto.nombre}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-blue-800">{punto.nombre}</h2>
                <p className="text-gray-700 text-lg font-medium">{punto.descripcion}</p>
                <p className="text-gray-600">{punto.direccion}</p>
                <p className="text-green-600 flex items-center gap-2">
                  <FaWhatsapp className="text-green-500" />
                  {punto.telefono}
                </p>
              </div>
              <a
                href={punto.ubicacionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-4"
              >
                Ubicación aquí
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
