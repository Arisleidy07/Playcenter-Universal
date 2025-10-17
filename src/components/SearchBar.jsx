import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProductSearch } from "../hooks/useProducts";

const SearchBar = forwardRef(
  ({ onClose, placeholder = "Buscar en pcu.com.do" }, ref) => {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Firestore-backed search (debounced inside the hook)
    const { results, loading } = useProductSearch(busqueda);

    useEffect(() => {
      if (!busqueda.trim()) {
        setResultados([]);
        setMostrarResultados(false);
        return;
      }
      setResultados(results);
      setMostrarResultados(true);
    }, [busqueda, results]);

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
            className="flex-grow border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            autoComplete="off"
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-semibold transition"
          >
            Buscar
          </button>
        </form>

        {mostrarResultados && (
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mt-1 rounded-md shadow-md max-h-72 overflow-y-auto transition-colors duration-300">
            {loading && (
              <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Buscando...</li>
            )}
            {!loading && resultados.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Sin resultados</li>
            )}
            {!loading && resultados.map((item) => (
              <li
                key={item.id}
                onClick={() => handleClickResultado(item)}
                className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition"
                title={`${item.nombre} ${
                  item.empresa ? "- " + item.empresa : ""
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">{item.nombre}</div>
                {item.empresa && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.empresa}</div>
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
