import React, { useEffect, useRef, useState } from "react";

function sanitizeBasic(html) {
  if (!html) return "";
  try {
    let out = String(html);
    // Remove script/style tags
    out = out.replace(/<\/(?:script|style)>/gi, "").replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, "");
    // Remove on* attributes and javascript: URLs
    out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "");
    out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, "");
    out = out.replace(/javascript:\s*/gi, "");
    return out;
  } catch {
    return String(html);
  }
}

export default function RichTextEditor({ value, onChange, placeholder = "Escribe la descripción..." }) {
  const [html, setHtml] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    setHtml(value || "");
  }, [value]);

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    const next = ref.current?.innerHTML || "";
    const clean = sanitizeBasic(next);
    setHtml(clean);
    onChange && onChange(clean);
  };

  const handlePaste = (e) => {
    // paste as plain text to avoid messy HTML
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b">
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("bold")}>B</button>
        <button type="button" className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded" onClick={() => exec("italic")}><span className="italic">I</span></button>
        <button type="button" className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded" onClick={() => exec("underline")}><span className="underline">U</span></button>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("insertUnorderedList")}>• Lista</button>
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("insertOrderedList")}>1. Lista</button>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("justifyLeft")}>⟸</button>
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("justifyCenter")}>≡</button>
        <button type="button" className="px-2 py-1 text-sm hover:bg-gray-200 rounded" onClick={() => exec("justifyRight")}>⟹</button>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <input
          type="color"
          title="Color"
          onChange={(e) => exec("foreColor", e.target.value)}
          className="w-8 h-8 p-0 border rounded cursor-pointer"
        />
        <button
          type="button"
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          onClick={() => {
            const url = window.prompt("URL a enlazar:");
            if (url) exec("createLink", url);
          }}
        >
          Link
        </button>
        <button
          type="button"
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          onClick={() => {
            const url = window.prompt("URL de imagen:");
            if (url) exec("insertImage", url);
          }}
        >
          Imagen
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        className="min-h-[120px] max-h-[360px] overflow-auto px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          const clean = sanitizeBasic(e.currentTarget.innerHTML);
          setHtml(clean);
          onChange && onChange(clean);
        }}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: html || `<p class=\"text-gray-400\">${placeholder}</p>` }}
        aria-label="Editor de texto enriquecido"
      />
    </div>
  );
}
