    import React from 'react';
    import './SearchBar.css';

    function SearchBar() {
    return (
        <form className="search-form flex items-center bg-white border border-gray-300 rounded-full overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#4FC3F7] transition-all">
        <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#4FC3F7] transition-colors"
            aria-label="Buscar"
        >
            <svg
            width="17"
            height="16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                stroke="currentColor"
                strokeWidth="1.333"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
        </button>
        <input
            className="input w-full px-4 py-2 outline-none text-sm text-gray-800 placeholder-gray-400"
            placeholder="Buscar productos, categorías..."
            required
            type="text"
        />
        </form>
    );
    }

    export default SearchBar;
