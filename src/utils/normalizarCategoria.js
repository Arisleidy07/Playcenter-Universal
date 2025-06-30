// File: src/utils/normalizarCategoria.js
export function normalizar(texto) {
  return texto
    .normalize("NFD") // Quita tildes
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}
