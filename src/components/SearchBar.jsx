import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import productosAll from "../data/productosAll.js";

const SearchBar = forwardRef(
  ({ onClose, placeholder = "Buscar en pcu.com.do" }, ref) => {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    const todosProductos = productosAll.flatMap((cat) => cat.productos);

    const filtrarProductos = (texto) => {
      if (!texto.trim()) return [];
      const textoLower = texto.toLowerCase();

      return todosProductos.filter((producto) => {
        const nombreLower = producto.nombre.toLowerCase();
        const empresaLower = (producto.empresa || "").toLowerCase();
        return (
          nombreLower.includes(textoLower) || empresaLower.includes(textoLower)
        );
      });
    };

    useEffect(() => {
      if (!busqueda.trim()) {
        setResultados([]);
        setMostrarResultados(false);
        return;
      }
      const delay = setTimeout(() => {
        const filtrados = filtrarProductos(busqueda);
        setResultados(filtrados);
        setMostrarResultados(true);
      }, 250);

      return () => clearTimeout(delay);
    }, [busqueda]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setMostrarResultados(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (busqueda.trim()) {
        navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
        setBusqueda("");
        setResultados([]);
        setMostrarResultados(false);
        if (onClose) onClose();
      }
    };

    const handleClickResultado = (item) => {
      const queryExacta = item.nombre.trim();
      navigate(`/buscar?q=${encodeURIComponent(queryExacta)}`);
      setBusqueda("");
      setResultados([]);
      setMostrarResultados(false);
      if (onClose) onClose();
    };

    return (
      <div className="relative w-full" ref={wrapperRef}>
        <form onSubmit={handleSubmit} className="flex w-full">
          <input
            type="text"
            ref={ref}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={placeholder}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-md text-sm font-semibold transition"
          >
            Buscar
          </button>
        </form>

        {mostrarResultados && resultados.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-md max-h-72 overflow-y-auto">
            {resultados.map((item) => (
              <li
                key={item.id}
                onClick={() => handleClickResultado(item)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-base break-words"
                title={`${item.nombre} ${
                  item.empresa ? "- " + item.empresa : ""
                }`}
              >
                <div className="font-semibold">{item.nombre}</div>
                {item.empresa && (
                  <div className="text-xs text-gray-500">{item.empresa}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default SearchBar;
