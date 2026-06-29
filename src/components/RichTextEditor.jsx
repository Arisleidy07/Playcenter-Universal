import React, { useEffect, useRef, useState } from "react";

function sanitizeBasic(html) {
  if (!html) return "";
  try {
    let out = String(html);
    out = out
      .replace(/<\/(?:script|style)>/gi, "")
      .replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, "");
    out = out.replace(/javascript:\s*/gi, "");
    return out;
  } catch {
    return String(html);
  }
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe la descripción...",
}) {
  const [html, setHtml] = useState(value || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const ref = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    const next = ref.current?.innerHTML || "";
    const clean = sanitizeBasic(next);
    setHtml(clean);
    onChange && onChange(clean);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imgHtml = `<img src="${reader.result}" alt="Imagen" style="max-width:100%;border-radius:8px;margin:8px 0;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      const next = ref.current?.innerHTML || "";
      const clean = sanitizeBasic(next);
      setHtml(clean);
      onChange && onChange(clean);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      exec("createLink", linkUrl.trim());
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const toolbarBtn = (label, cmd, arg = null, icon = null) => (
    <button
      type="button"
      onClick={() => exec(cmd, arg)}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
      title={label}
    >
      {icon}
    </button>
  );

  const separator = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Deshacer / Rehacer */}
        {toolbarBtn(
          "Deshacer",
          "undo",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Rehacer",
          "redo",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>,
        )}
        {separator()}

        {/* Formato básico */}
        {toolbarBtn(
          "Negrita",
          "bold",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Cursiva",
          "italic",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 4h4m-2 0v16m-4 0h8"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Subrayado",
          "underline",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v7a5 5 0 0010 0V4M5 20h14"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Tachado",
          "strikeThrough",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.5 10a4.5 4.5 0 10-9 0 4.5 4.5 0 009 0zM3 12h18"
            />
          </svg>,
        )}
        {separator()}

        {/* Encabezados */}
        <select
          onChange={(e) => exec("formatBlock", e.target.value)}
          className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
        >
          <option value="p">Normal</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>
        {separator()}

        {/* Listas */}
        {toolbarBtn(
          "Lista con viñetas",
          "insertUnorderedList",
          null,
          <svg
            width="16"
            height="16"
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
          </svg>,
        )}
        {toolbarBtn(
          "Lista numerada",
          "insertOrderedList",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01"
            />
          </svg>,
        )}
        {separator()}

        {/* Alineación */}
        {toolbarBtn(
          "Alinear izquierda",
          "justifyLeft",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h10M4 18h14"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Centrar",
          "justifyCenter",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M7 12h10M4 18h16"
            />
          </svg>,
        )}
        {toolbarBtn(
          "Alinear derecha",
          "justifyRight",
          null,
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M10 12h10M4 18h16"
            />
          </svg>,
        )}
        {separator()}

        {/* Cita */}
        {toolbarBtn(
          "Cita",
          "formatBlock",
          "blockquote",
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h8M8 14h8M8 18h8M4 6h16"
            />
          </svg>,
        )}
        {separator()}

        {/* Color de texto */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Color de texto"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 110 4H7a2 2 0 110-4z"
              />
            </svg>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-10 flex gap-1">
              {[
                "#000000",
                "#ef4444",
                "#f97316",
                "#eab308",
                "#22c55e",
                "#3b82f6",
                "#8b5cf6",
                "#ec4899",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    exec("foreColor", c);
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
        {separator()}

        {/* Enlace */}
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Insertar enlace"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </button>

        {/* Imagen */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Subir imagen"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageUpload}
        />
      </div>

      {/* Modal de enlace */}
      {showLinkModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-xl w-80">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
              Insertar enlace
            </h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="flex-1 px-3 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Insertar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl("");
                }}
                className="flex-1 px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={ref}
        className="min-h-[160px] max-h-[400px] overflow-auto px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white leading-relaxed"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const clean = sanitizeBasic(e.currentTarget.innerHTML);
          setHtml(clean);
          onChange && onChange(clean);
        }}
        onPaste={handlePaste}
        style={{ cursor: "text" }}
        dangerouslySetInnerHTML={{
          __html: html || `<p class="text-gray-400">${placeholder}</p>`,
        }}
        aria-label="Editor de texto enriquecido"
      />
    </div>
  );
}
