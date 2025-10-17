function BotonFiltro({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 dark:bg-slate-800 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      Filtros
    </button>
  );
}

export default BotonFiltro;
