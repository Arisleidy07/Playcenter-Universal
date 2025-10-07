import React from "react";

const companies = [
  {
    id: "playcenter",
    name: "Playcenter Universal",
    logo: "/Playlogo.png",
    city: "Santiago de los Caballeros, RD",
    description:
      "Tienda física y plataforma oficial. Videojuegos, consolas, accesorios y tecnología con garantía y soporte local.",
    link: "/nosotros",
  },
  { id: "st-electronics", name: "ST Electronics", logo: "/estafetas/St electronics.png", city: "Santiago", description: "Electrónica y repuestos.", link: "/tiendas/st-electronics" },
  { id: "cafeteria-guido", name: "Cafetería Guido", logo: "/estafetas/cafeteria-guido.png", city: "Santiago", description: "Servicios y paquetería aliada.", link: "/tiendas/cafeteria-guido" },
  { id: "colmado-espinal", name: "Colmado Espinal", logo: "/estafetas/colmado-espinal.png", city: "Santiago", description: "Punto aliado de entrega.", link: "/tiendas/colmado-espinal" },
];

export default function Tiendas() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 pb-14"
      style={{ paddingTop: "calc(var(--topbar-height, 0px) + 3.5rem)" }}
    >
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">Todas las tiendas</h1>
      <p className="text-gray-600 mb-8">Explora empresas aliadas y puntos verificados.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((c) => (
          <article
            key={c.id}
            className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-slate-200 via-white to-indigo-200 shadow-[0_18px_60px_rgba(2,6,23,0.06)] hover:shadow-[0_24px_70px_rgba(2,6,23,0.10)] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="rounded-[14px] bg-white p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-40 sm:w-52 aspect-[16/9] rounded-xl bg-white border shadow-sm overflow-hidden flex items-center justify-center">
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 truncate">{c.name}</h3>
                  <p className="text-sm text-slate-600 truncate">{c.city}</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{c.description}</p>

              <div className="flex flex-wrap gap-3">
                <a
                  href={c.link}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-300/40 transition"
                >
                  Ver tienda
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
