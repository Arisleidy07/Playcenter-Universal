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
              <div className="connection-error-icon-badge" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  className="connection-error-icon-svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 9.5a11 11 0 0 1 14 0" />
                  <path d="M8.5 13a6 6 0 0 1 7 0" />
                  <path d="M11.5 16.2a2.6 2.6 0 0 1 1 0" />
                  <path d="M12 20h.01" />
                  <path d="M4 4l16 16" />
                </svg>
              </div>
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
