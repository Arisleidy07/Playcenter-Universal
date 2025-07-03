    import React, { useState, useEffect, forwardRef } from "react";
    import { useNavigate } from "react-router-dom";

    const SearchBar = forwardRef(({ onClose, placeholder = "Buscar en Playcenter.do" }, ref) => {
    const [busqueda, setBusqueda] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (busqueda.trim()) {
        navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`);
        setBusqueda("");
        if (onClose) onClose();
        }
    };

    useEffect(() => {
        if (ref && ref.current) {
        ref.current.focus();
        }
    }, [ref]);

    return (
        <form
        onSubmit={handleSubmit}
        className="flex w-full"
        >
        <input
            type="text"
            ref={ref}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={placeholder}
            className="flex-grow border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
        />
        <button
            type="submit"
            className="ml-2 px-4 py-2 bg-[#4FC3F7] hover:bg-[#3BB0F3] text-white rounded-md text-sm font-semibold transition"
        >
            Buscar
        </button>
        </form>
    );
    });

    export default SearchBar;
