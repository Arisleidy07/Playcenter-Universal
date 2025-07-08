// src/utils/normalizarCategoria.js
export function normalizar(texto) {
  return texto
    .normalize("NFD")               // Quita tildes
    .replace(/[\u0300-\u036f]/g, "") // Elimina marcas de acento
    .toLowerCase()                  // Pasa a minúsculas
    .replace(/\s+/g, "-")           // Cambia espacios por guiones
    .replace(/[^\w-]/g, "")         // Quita caracteres que no sean letras, números o guiones
    .replace(/--+/g, "-")           // Reemplaza guiones múltiples por uno solo
    .replace(/^-+|-+$/g, "");       // Quita guiones al inicio o al final
}
