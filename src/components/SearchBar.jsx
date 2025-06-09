import React from "react";
import "./SearchBar.css"; // Solo si usas estilos separados. Puedes quitar esta línea si no tienes ese archivo.

function Searchbar() {
    return (
    <form className="search-form">
        <button type="submit">
        <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
            d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
            stroke="currentColor"
            strokeWidth="1.333"
            strokeLinecap="round"
            strokeLinejoin="round"
            />
        </svg>
        </button>
        <input type="text" placeholder="Buscar" required />
    </form>
    );
}

export default SearchBar;
