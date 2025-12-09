import React from "react";

const MATRIX_PATTERNS = Array.from({ length: 4 });
const MATRIX_COLUMNS = Array.from({ length: 40 });

const ConnectionErrorPage = () => {
  return (
    <div className="connection-error-page">
      {/* Fondo Matrix animado */}
      <div className="matrix-container" aria-hidden="true">
        {MATRIX_PATTERNS.map((_, patternIndex) => (
          <div className="matrix-pattern" key={patternIndex}>
            {MATRIX_COLUMNS.map((_, columnIndex) => (
              <div className="matrix-column" key={columnIndex} />
            ))}
          </div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="connection-error-content">
        <div className="connection-error-card animate-fade-in">
          {/* Logo PCU - fijo, sin animación */}
          <div className="connection-error-logo">
            <img
              src="/PCU.png"
              alt="Playcenter Universal"
              className="connection-error-logo-img"
            />
          </div>

          <div className="connection-error-body">
            {/* Icono animado pero suave (no mueve el logo) */}
            <div className="connection-error-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="connection-error-icon-svg"
              >
                <path
                  d="M12 18.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Zm6.36-7.78a11.25 11.25 0 0 0-12.72 0 1 1 0 1 0 1.12 1.64 9.25 9.25 0 0 1 10.48 0 1 1 0 0 0 1.12-1.64Zm-3 3.9a7.25 7.25 0 0 0-6.72 0 1 1 0 1 0 .92 1.76 5.25 5.25 0 0 1 4.88 0 1 1 0 0 0 .92-1.76Zm-3-6.9a13.25 13.25 0 0 0-8 2.6 1 1 0 0 0 1.2 1.6 11.25 11.25 0 0 1 13.6 0 1 1 0 0 0 1.2-1.6 13.25 13.25 0 0 0-8-2.6Z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <h1 className="connection-error-title">Sin conexión a internet</h1>
            <p className="connection-error-text">
              Por favor, verifica tu conexión a internet y vuelve a intentarlo.
            </p>
            <p className="connection-error-subtext">
              Revisa tu Wi‑Fi o datos móviles. Si ya estás conectado, recarga la
              página o vuelve al inicio.
            </p>

            <div className="connection-error-actions">
              <button
                type="button"
                className="connection-error-button-primary"
                onClick={() => window.location.reload()}
              >
                Reintentar conexión
              </button>
              <button
                type="button"
                className="connection-error-button-secondary"
                onClick={() => (window.location.href = "/")}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionErrorPage;
