import React, { useState, useEffect, useRef, forwardRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useProductSearch, useProducts } from "../hooks/useProducts";
import { useTheme } from "../context/ThemeContext";
import { FaSearch, FaClock, FaTimes } from "react-icons/fa";
import "./SearchBar.css";

// Normalizar texto para búsqueda sin acentos ni mayúsculas
const normalizarTexto = (texto) => {
  if (!texto) return "";
  return texto
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Calcular similitud entre dos palabras (Levenshtein simplificado)
const calcularSimilitud = (palabra1, palabra2) => {
  const p1 = palabra1.toLowerCase();
  const p2 = palabra2.toLowerCase();
  
  if (p1 === p2) return 1.0;
  if (p1.includes(p2) || p2.includes(p1)) return 0.8;
  
  const len1 = p1.length;
  const len2 = p2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 0;
  
  let coincidencias = 0;
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (p1[i] === p2[i]) coincidencias++;
  }
  
  return coincidencias / maxLen;
};

// Buscar en múltiples campos del producto - MUY PERMISIVO (1 letra funciona)
const buscarEnProducto = (producto, termino) => {
  if (!termino) return { coincide: false, score: 0 };
  
  const terminoNorm = normalizarTexto(termino);
  const palabrasBusqueda = terminoNorm.split(" ").filter(Boolean);
  
  const nombreNorm = normalizarTexto(producto.nombre || "");
  const descripcionNorm = normalizarTexto(producto.descripcion || "");
  const categoriaNorm = normalizarTexto(producto.categoria || "");
  const marcaNorm = normalizarTexto(producto.empresa || producto.marca || "");
  
  let score = 0;
  let coincidencias = 0;
  
  // PRIORIDAD 1: Coincidencia exacta completa
  if (nombreNorm === terminoNorm) {
    return { coincide: true, score: 1000 };
  }
  
  // PRIORIDAD 2: El nombre comienza con el término
  if (nombreNorm.startsWith(terminoNorm)) {
    return { coincide: true, score: 900 };
  }
  
  // PRIORIDAD 3: El nombre contiene el término completo
  if (nombreNorm.includes(terminoNorm)) {
    return { coincide: true, score: 800 };
  }
  
  // PRIORIDAD 4: Marca contiene el término completo
  if (marcaNorm.includes(terminoNorm)) {
    return { coincide: true, score: 700 };
  }
  
  // PRIORIDAD 5: Categoría contiene el término completo
  if (categoriaNorm.includes(terminoNorm)) {
    return { coincide: true, score: 600 };
  }
  
  // PRIORIDAD 6: Descripción contiene el término completo
  if (descripcionNorm.includes(terminoNorm)) {
    return { coincide: true, score: 500 };
  }
  
  // PRIORIDAD 7: Buscar palabra por palabra (MUY PERMISIVO)
  palabrasBusqueda.forEach(palabra => {
    // Nombre contiene la palabra
    if (nombreNorm.includes(palabra)) {
      score += 100;
      coincidencias++;
    }
    // Marca contiene la palabra
    if (marcaNorm.includes(palabra)) {
      score += 70;
      coincidencias++;
    }
    // Categoría contiene la palabra
    if (categoriaNorm.includes(palabra)) {
      score += 50;
      coincidencias++;
    }
    // Descripción contiene la palabra
    if (descripcionNorm.includes(palabra)) {
      score += 20;
      coincidencias++;
    }
  });
  
  // MUY PERMISIVO: Si hay al menos 1 coincidencia, mostrar
  const coincide = coincidencias > 0 || score > 0;
  
  return { coincide, score: score > 0 ? score : 10 };
};

const SearchBar = forwardRef(
  ({ onClose, placeholder = "Buscar en pcu.com.do" }, ref) => {
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [historialBusquedas, setHistorialBusquedas] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
    const [mostrarDropdownCategorias, setMostrarDropdownCategorias] = useState(false);
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Firestore-backed search (debounced inside the hook)
    const { results, loading } = useProductSearch(busqueda);
    
    // Obtener TODOS los productos para las categorías
    const { products: todosLosProductos } = useProducts();
    
    // Obtener TODAS las categorías disponibles en la aplicación
    const categoriasDisponibles = useMemo(() => {
      const cats = new Set();
      (todosLosProductos || []).forEach(p => {
        if (p.categoria) cats.add(p.categoria);
      });
      return Array.from(cats).sort();
    }, [todosLosProductos]);

    // Cargar historial de búsquedas desde localStorage
    useEffect(() => {
      const historial = JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
      setHistorialBusquedas(historial.slice(0, 5)); // Solo las últimas 5
    }, []);

    useEffect(() => {
      if (!busqueda.trim()) {
        setResultados([]);
        setSugerencias([]);
        return;
      }
      
      setMostrarResultados(true);
      
      // Búsqueda inteligente con scoring
      let resultadosConScore = results.map(producto => {
        const { coincide, score } = buscarEnProducto(producto, busqueda);
        return { ...producto, score, coincide };
      })
      .filter(r => r.coincide);
      
      // FILTRAR POR CATEGORÍA si no es "todas"
      if (categoriaSeleccionada !== "todas") {
        resultadosConScore = resultadosConScore.filter(p => 
          normalizarTexto(p.categoria || "") === normalizarTexto(categoriaSeleccionada)
        );
      }
      
      resultadosConScore = resultadosConScore
        .sort((a, b) => b.score - a.score)
        .slice(0, 8); // Máximo 8 resultados
      
      setResultados(resultadosConScore);
      
      // SUGERENCIAS: Nombres completos + Categorías que FUNCIONEN
      const sugerenciasGeneradas = [];
      
      // 1. NOMBRES COMPLETOS de productos (primero)
      resultadosConScore.forEach(producto => {
        const nombreCompleto = producto.nombre;
        if (nombreCompleto && !sugerenciasGeneradas.includes(nombreCompleto)) {
          sugerenciasGeneradas.push(nombreCompleto);
        }
      });
      
      // 2. CATEGORÍAS relevantes (después, solo si hay productos en esa categoría)
      const categoriasRelevantes = new Set();
      resultadosConScore.forEach(p => {
        if (p.categoria) categoriasRelevantes.add(p.categoria);
      });
      
      // Agregar categorías como sugerencias separadas
      categoriasRelevantes.forEach(cat => {
        const sugerenciaCategoria = `${busqueda} en ${cat}`;
        if (!sugerenciasGeneradas.includes(sugerenciaCategoria)) {
          sugerenciasGeneradas.push(sugerenciaCategoria);
        }
      });
      
      setSugerencias(sugerenciasGeneradas.slice(0, 8));
    }, [busqueda, results, categoriaSeleccionada]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setMostrarResultados(false);
        }
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setMostrarDropdownCategorias(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const guardarEnHistorial = (termino) => {
      if (!termino.trim()) return;
      
      const historial = JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
      const nuevoHistorial = [termino, ...historial.filter(h => h !== termino)].slice(0, 10);
      localStorage.setItem('historialBusquedas', JSON.stringify(nuevoHistorial));
      setHistorialBusquedas(nuevoHistorial.slice(0, 5));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (busqueda.trim()) {
        let queryFinal = busqueda.trim();
        
        // Si hay categoría seleccionada (que no sea "todas"), agregar al query
        if (categoriaSeleccionada !== "todas") {
          queryFinal = `${busqueda.trim()} en ${categoriaSeleccionada}`;
        }
        
        guardarEnHistorial(queryFinal);
        navigate(`/buscar?q=${encodeURIComponent(queryFinal)}`);
        setBusqueda("");
        setResultados([]);
        setSugerencias([]);
        setMostrarResultados(false);
        if (onClose) onClose();
      }
    };

    const handleClickResultado = (item) => {
      // Guardar en historial
      guardarEnHistorial(item.nombre.trim());
      
      // IR DIRECTAMENTE A LA VISTA DEL PRODUCTO
      navigate(`/producto/${item.id}`);
      
      // Limpiar búsqueda y cerrar
      setBusqueda("");
      setResultados([]);
      setSugerencias([]);
      setMostrarResultados(false);
      if (onClose) onClose();
    };

    const handleClickSugerencia = (sugerencia) => {
      guardarEnHistorial(sugerencia);
      
      // Si la sugerencia es de categoría (contiene "en"), buscar correctamente
      if (sugerencia.includes(" en ")) {
        // Buscar por el término original + filtrar por categoría en la página
        navigate(`/buscar?q=${encodeURIComponent(sugerencia)}`);
      } else {
        // Sugerencia normal (nombre de producto)
        navigate(`/buscar?q=${encodeURIComponent(sugerencia)}`);
      }
      
      setBusqueda("");
      setResultados([]);
      setSugerencias([]);
      setMostrarResultados(false);
      if (onClose) onClose();
    };

    const handleClickHistorial = (termino) => {
      setBusqueda(termino);
    };

    const eliminarDeHistorial = (termino, e) => {
      e.stopPropagation();
      const historial = JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
      const nuevoHistorial = historial.filter(h => h !== termino);
      localStorage.setItem('historialBusquedas', JSON.stringify(nuevoHistorial));
      setHistorialBusquedas(nuevoHistorial.slice(0, 5));
    };

    return (
      <div className="relative w-full" ref={wrapperRef}>
        <form onSubmit={handleSubmit} className="flex w-full gap-0">
          {/* DROPDOWN DE CATEGORÍAS ESTILO AMAZON */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMostrarDropdownCategorias(!mostrarDropdownCategorias)}
              className="h-full px-2.5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-l-md text-[11px] font-medium text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5 min-w-[70px] max-w-[110px]"
            >
              <span className="truncate flex-1">
                {categoriaSeleccionada === "todas" ? "Todos" : categoriaSeleccionada}
              </span>
              <span className="text-[9px] flex-shrink-0">▼</span>
            </button>
            
            {/* DROPDOWN DE CATEGORÍAS */}
            {mostrarDropdownCategorias && (
              <div 
                className="absolute top-full left-0 mt-1 w-64 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md shadow-2xl z-[10000]"
                style={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  opacity: 1
                }}
              >
                {/* TODAS LAS CATEGORÍAS */}
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaSeleccionada("todas");
                    setMostrarDropdownCategorias(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    categoriaSeleccionada === "todas"
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {categoriaSeleccionada === "todas" && "✓ "}Todos
                </button>
                
                {/* LISTA DE CATEGORÍAS */}
                {categoriasDisponibles.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategoriaSeleccionada(cat);
                      setMostrarDropdownCategorias(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${
                      categoriaSeleccionada === cat
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {categoriaSeleccionada === cat && "✓ "}{cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* INPUT DE BÚSQUEDA */}
          <div className="flex-grow relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              ref={ref}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onFocus={() => setMostrarResultados(true)}
              placeholder={placeholder}
              className="w-full border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                fontSize: '11px'
              }}
              autoComplete="off"
            />
          </div>
          
          {/* BOTÓN DE BUSCAR - SOLO ÍCONO */}
          <button
            type="submit"
            className="w-12 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-r-md transition flex items-center justify-center"
            title="Buscar"
          >
            <FaSearch className="text-sm" />
          </button>
        </form>

        {mostrarResultados && (
          <div 
            className="search-dropdown-scroll absolute z-[9999] w-full border border-gray-300 dark:border-gray-700 mt-1 rounded-md shadow-xl overflow-y-auto" 
            style={{ 
              backgroundColor: isDark ? '#111827' : '#ffffff',
              opacity: 1,
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              maxHeight: 'min(80vh, 700px)',
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain'
            }}
          >
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Buscando...
              </div>
            )}
            
            {/* HISTORIAL DE BÚSQUEDAS */}
            {!busqueda.trim() && historialBusquedas.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
                  Búsquedas recientes
                </div>
                {historialBusquedas.map((termino, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleClickHistorial(termino)}
                    className="px-4 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between group transition active:bg-gray-200 dark:active:bg-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <FaClock className="text-gray-400 dark:text-gray-500 text-sm" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{termino}</span>
                    </div>
                    <button
                      onClick={(e) => eliminarDeHistorial(termino, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* INDICADOR DE CATEGORÍA SELECCIONADA */}
            {busqueda.trim() && categoriaSeleccionada !== "todas" && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">
                    Buscando en: {categoriaSeleccionada}
                  </span>
                  <button
                    onClick={() => setCategoriaSeleccionada("todas")}
                    className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                  >
                    ✕ Todos
                  </button>
                </div>
              </div>
            )}
            
            {/* SUGERENCIAS DE BÚSQUEDA - NOMBRES COMPLETOS */}
            {busqueda.trim() && sugerencias.length > 0 && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
                  Sugerencias ({sugerencias.length})
                </div>
                {sugerencias.map((sugerencia, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleClickSugerencia(sugerencia)}
                    className="px-4 py-3.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition group active:bg-gray-200 dark:active:bg-gray-600"
                  >
                    <FaSearch className="text-gray-400 dark:text-gray-500 text-sm flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 break-words">{sugerencia}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* RESULTADOS DE PRODUCTOS */}
            {busqueda.trim() && !loading && resultados.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-base font-medium text-gray-600 dark:text-gray-400">No encontramos resultados</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Intenta con otras palabras</p>
              </div>
            )}
            
            {busqueda.trim() && !loading && resultados.length > 0 && (
              <div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky top-0 bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-700">
                  Productos ({resultados.length})
                </div>
                {resultados.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleClickResultado(item)}
                    className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition active:bg-gray-200 dark:active:bg-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      {item.imagen && (
                        <img 
                          src={item.imagen} 
                          alt={item.nombre}
                          className="w-14 h-14 object-cover rounded border border-gray-200 dark:border-gray-600 flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base text-gray-900 dark:text-gray-100 line-clamp-2">
                          {item.nombre}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.empresa && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.empresa}</span>
                          )}
                          {item.categoria && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">• {item.categoria}</span>
                          )}
                        </div>
                        {item.precio && (
                          <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1.5">
                            RD${item.precio.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default SearchBar;
