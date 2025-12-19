import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/UniversalFileUploader.css";

// --- Íconos SVG para una UI más limpia y profesional ---
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="ufu-dropzone-icon"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z"
    />
  </svg>
);
const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);
const VideoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"
    />
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 100-12 6 6 0 000 12zM12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.5h13.628a2.31 2.31 0 011.642 3.953l-.837 1.172-3.44-3.44-3.44 3.44-.837-1.172a2.31 2.31 0 01-1.642-3.953H6.827z"
    />
  </svg>
);
const GalleryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
    />
  </svg>
);

// --- Componente de Preview de Archivo Mejorado ---
const FilePreview = ({
  file,
  onRemove,
  onSetMain,
  onMove,
  index,
  fileCount,
}) => {
  const { url, type, name, size, progress, error, isMain } = file;
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  // Formatear tamaño de archivo en unidades legibles
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Manejar carga de metadatos de video
  useEffect(() => {
    if (type === "video" && videoRef.current) {
      const handleMetadataLoaded = () => setVideoReady(true);
      videoRef.current.addEventListener("loadedmetadata", handleMetadataLoaded);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener(
            "loadedmetadata",
            handleMetadataLoaded
          );
        }
      };
    }
  }, [type]);

  return (
    <div className={`ufu-preview-item ${isMain ? "ufu-main-item" : ""}`}>
      <div className="ufu-preview-media">
        {type === "image" ? (
          <img
            src={url}
            alt={name}
            className="object-contain w-full h-full"
            loading="eager"
            onLoad={() => {
              /* Imagen cargada */
            }}
            onError={(e) => {
              // Evitar intentos de red a dominios externos para placeholder
              e.target.onerror = null;
              e.target.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            }}
          />
        ) : type === "video" ? (
          <>
            <video
              ref={videoRef}
              src={url}
              preload="metadata"
              playsInline
              muted
              loop
              autoPlay
              controls={false}
              onLoadedMetadata={() => setVideoReady(true)}
              className={`object-contain w-full h-full ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.target.onerror = null;
                setVideoReady(true);
              }}
            />
            <div
              className={`video-overlay ${videoReady ? "with-thumbnail" : ""}`}
            >
              <VideoIcon />
            </div>
          </>
        ) : (
          <div className="document-preview">
            <FileIcon />
            <span className="document-ext">
              {name ? name.split(".").pop()?.toUpperCase() || "FILE" : "FILE"}
            </span>
          </div>
        )}
      </div>

      <div className="ufu-preview-item-info">
        <p className="ufu-preview-item-name" title={name || "Archivo"}>
          {name && name.length > 20
            ? name.substring(0, 18) + "..."
            : name || "Archivo"}
        </p>
        <p className="ufu-preview-item-size">{formatBytes(size)}</p>
      </div>

      <AnimatePresence>
        {/* estados visuales ocultos por requerimiento: sin barras ni errores visibles */}
      </AnimatePresence>

      <div className="ufu-controls-overlay">
        {/* Botón de descarga */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Descargar archivo
            const link = document.createElement("a");
            link.href = url;
            link.download = name || "archivo";
            link.target = "_blank";
            // Para URLs de Firebase Storage, agregar query params para forzar descarga
            if (url.includes("firebase")) {
              const downloadUrl = new URL(url);
              downloadUrl.searchParams.set(
                "response-content-disposition",
                `attachment; filename="${name || "archivo"}"`
              );
              link.href = downloadUrl.toString();
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="ufu-control-button ufu-download-button"
          title="Descargar archivo"
          aria-label="Descargar archivo a tu dispositivo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </button>

        {/* Botón de vista previa (ojito) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            if (type === "image") {
              // Crear modal dentro de la página
              const modal = document.createElement("div");
              modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
              `;

              const img = document.createElement("img");
              img.src = url;
              img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 8px;
                cursor: default;
              `;

              // Botón X para cerrar
              const closeBtn = document.createElement("button");
              closeBtn.innerHTML = "×";
              closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 30px;
                background: rgba(255,255,255,0.9);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              `;

              modal.appendChild(img);
              modal.appendChild(closeBtn);
              document.body.appendChild(modal);

              const closeModal = () => {
                document.body.removeChild(modal);
              };

              // Cerrar al hacer click en el fondo
              modal.addEventListener("click", closeModal);
              // Cerrar al hacer click en la X
              closeBtn.addEventListener("click", closeModal);
              // Cerrar con tecla Escape
              const handleEscape = (e) => {
                if (e.key === "Escape") {
                  closeModal();
                  document.removeEventListener("keydown", handleEscape);
                }
              };
              document.addEventListener("keydown", handleEscape);

              // Prevenir que el click en la imagen cierre el modal
              img.addEventListener("click", (e) => e.stopPropagation());
            } else if (type === "video") {
              // Para videos, crear modal con video
              const modal = document.createElement("div");
              modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
              `;

              const video = document.createElement("video");
              video.src = url;
              video.controls = true;
              video.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 8px;
                cursor: default;
              `;

              // Botón X para cerrar
              const closeBtn = document.createElement("button");
              closeBtn.innerHTML = "×";
              closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 30px;
                background: rgba(255,255,255,0.9);
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              `;

              modal.appendChild(video);
              modal.appendChild(closeBtn);
              document.body.appendChild(modal);

              const closeModal = () => {
                video.pause();
                document.body.removeChild(modal);
              };

              modal.addEventListener("click", closeModal);
              closeBtn.addEventListener("click", closeModal);
              video.addEventListener("click", (e) => e.stopPropagation());
            } else {
              // Para documentos, descargar
              const link = document.createElement("a");
              link.href = url;
              link.download = name;
              link.click();
            }
          }}
          className="ufu-control-button ufu-preview-button"
          title="Ver archivo"
          aria-label="Ver archivo en pantalla completa"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(file.id);
          }}
          className="ufu-control-button ufu-delete-button"
          title="Eliminar"
          aria-label="Eliminar archivo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {onSetMain && !isMain && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSetMain(file.id);
            }}
            className="ufu-control-button ufu-set-main-button"
            title="Establecer como principal"
            aria-label="Establecer como imagen principal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.622l1.208 5.273a.563.563 0 01-.841.589l-4.743-2.85a.563.563 0 00-.586 0l-4.743 2.85a.563.563 0 01-.841-.589l1.208-5.273a.563.563 0 00-.182-.622l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )}

        {onMove && fileCount > 1 && (
          <div className="ufu-reorder-buttons">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(index, "up");
              }}
              disabled={index === 0}
              className="ufu-control-button"
              title="Mover arriba"
              aria-label="Mover archivo hacia arriba"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(index, "down");
              }}
              disabled={index === fileCount - 1}
              className="ufu-control-button"
              title="Mover abajo"
              aria-label="Mover archivo hacia abajo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isMain && (
        <div className="ufu-main-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3 h-3"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.681 4.06c.064.155.24.263.415.284l4.473.65c.803.117 1.125 1.106.547 1.65l-3.238 3.153a.477.477 0 00-.137.53l.764 4.456c.138.806-.702 1.425-1.425 1.053l-3.992-2.1a.498.498 0 00-.465 0l-3.992 2.1c-.723.372-1.563-.247-1.425-1.053l.764-4.456a.477.477 0 00-.137-.53L2.24 9.667c-.578-.544-.256-1.533.547-1.65l4.473-.65a.476.476 0 00.415-.284l1.681-4.06z"
              clipRule="evenodd"
            />
          </svg>
          <span>Principal</span>
        </div>
      )}
    </div>
  );
};

// --- Componente Principal Uploader Mejorado ---
const UniversalFileUploader = React.memo(
  ({
    files: initialFiles = [],
    onFilesChange,
    acceptedTypes = "image/*,video/*,application/pdf",
    multiple = true,
    maxSize = 100 * 1024 * 1024, // 100MB por defecto
    maxFiles = null, // Límite máximo de archivos
    label = "Medios del Producto",
    placeholder = "Arrastra archivos o haz clic para seleccionar",
    className = "",
    showPreview = true,
    allowReorder = true,
    allowSetMain = true,
  }) => {
    const [files, setFiles] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [captureAttr, setCaptureAttr] = useState(undefined);
    const dropzoneRef = useRef(null);
    const [rejected, setRejected] = useState([]);
    // Ref para notificar al padre SOLO después de que React haya aplicado el nuevo estado
    const pendingNotifyRef = useRef(null);

    // Procesar archivos iniciales (solo sincroniza estado interno, sin notificar al padre)
    useEffect(() => {
      if (!initialFiles || initialFiles.length === 0) {
        // CRÍTICO: NO borrar archivos que el usuario acaba de agregar
        // Solo borrar si no hay archivos pendientes de subir (con .file o blob:)
        setFiles((prev) => {
          // Si hay archivos con .file (pendientes de subir) o con blob: URL, NO borrar
          const hasPendingUploads = prev.some(
            (f) => f.file || (f.url && f.url.startsWith("blob:"))
          );
          if (hasPendingUploads) {
            return prev; // Mantener archivos pendientes
          }
          return prev.length > 0 ? [] : prev;
        });
        return;
      }

      const processedFiles = initialFiles.map((file, index) => {
        if (typeof file === "string") {
          const fileExtension = file.split(".").pop().toLowerCase();
          const isVideo = ["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(
            fileExtension
          );

          const encodedName = file.split("/").pop().split("?")[0];
          const decodedName = decodeURIComponent(encodedName);

          return {
            id: `existing-${index}-${file}`,
            url: file,
            type: isVideo ? "video" : "image",
            name: decodedName,
            size: 0,
            isMain: index === 0,
            isUploaded: true,
          };
        }
        return file;
      });

      setFiles((prev) => {
        // Obtener nombres de archivos ya subidos (de initialFiles)
        const uploadedNames = new Set(
          processedFiles.map((f) => f.name?.toLowerCase?.() || "")
        );

        // CRÍTICO: Solo preservar archivos pendientes que NO estén ya en initialFiles
        // Si el nombre del archivo pendiente coincide con uno subido, NO preservarlo (ya se subió)
        const pendingFiles = prev.filter((f) => {
          const isPending = f.file || (f.url && f.url.startsWith("blob:"));
          if (!isPending) return false;

          // Si este archivo pendiente ya fue subido (mismo nombre), NO preservarlo
          const fileName = f.name?.toLowerCase?.() || "";
          if (uploadedNames.has(fileName)) {
            // Limpiar URL blob si existe
            if (f.url && f.url.startsWith("blob:")) {
              URL.revokeObjectURL(f.url);
            }
            return false; // No preservar, ya está subido
          }
          return true; // Mantener, aún está pendiente
        });

        // Si no hay cambios, no actualizar
        const prevIds = prev.map((f) => f.id);
        const nextIds = processedFiles.map((f) => f.id);

        if (
          JSON.stringify(prevIds) === JSON.stringify(nextIds) &&
          pendingFiles.length === 0
        ) {
          return prev;
        }

        // Si hay archivos pendientes únicos, combinarlos con los procesados
        if (pendingFiles.length > 0) {
          const processedIds = new Set(processedFiles.map((f) => f.id));
          const uniquePending = pendingFiles.filter(
            (f) => !processedIds.has(f.id)
          );
          return [...processedFiles, ...uniquePending];
        }

        return processedFiles;
      });
    }, [
      initialFiles.length,
      initialFiles
        .map((f) => (typeof f === "string" ? f : f?.id || f?.url))
        .join("|"),
    ]);

    // Manejar archivos soltados o seleccionados
    const onDrop = useCallback(
      (acceptedFiles, fileRejections) => {
        // Remover console.log para mejorar performance

        // Crear vista previa inmediata para cada archivo
        const newFiles = acceptedFiles.map((file) => {
          // Determinar tipo de archivo
          let fileType = "document";
          if (file.type.startsWith("image/")) fileType = "image";
          else if (file.type.startsWith("video/")) fileType = "video";

          // Crear URL de objeto para vista previa instantánea
          const previewUrl = URL.createObjectURL(file);

          const fileObj = {
            id: `${file.name}-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 9)}`,
            file, // Archivo original para subir después
            url: previewUrl, // URL de vista previa instantánea
            type: fileType,
            name: file.name,
            size: file.size,
            progress: 0,
            error: null,
            isMain: false,
            isUploading: false,
            isUploaded: false, // Marcar como no subido aún
          };

          // Objeto de archivo creado
          return fileObj;
        });

        // Manejar archivos rechazados
        if (fileRejections.length > 0) {
          // console.error("Archivos rechazados:", fileRejections);
          // Mostrar mensajes visibles para el usuario
          setRejected(
            fileRejections.map(({ file, errors }) => ({
              name: file?.name || "Archivo",
              messages: (errors || []).map((e) => e.message),
            }))
          );
        }

        // Actualizar estado con nuevos archivos y marcar notificación diferida al padre
        setFiles((currentFiles) => {
          let finalFiles;

          if (multiple) {
            // CRÍTICO: Evitar duplicados por nombre de archivo
            const existingNames = new Set(currentFiles.map((f) => f.name));
            const uniqueNewFiles = newFiles.filter(
              (f) => !existingNames.has(f.name)
            );

            const combinedFiles = [...currentFiles, ...uniqueNewFiles];
            finalFiles = maxFiles
              ? combinedFiles.slice(0, maxFiles)
              : combinedFiles;

            if (maxFiles && combinedFiles.length > maxFiles) {
              setRejected((prev) => [
                ...prev,
                {
                  name: "Límite de archivos",
                  messages: [
                    `Límite de ${maxFiles} archivos alcanzado. Solo se mantuvieron los primeros ${maxFiles}.`,
                  ],
                },
              ]);
            }
          } else {
            finalFiles = newFiles;
          }

          // Guardar snapshot para notificar en un efecto posterior
          pendingNotifyRef.current = finalFiles;
          return finalFiles;
        });
      },
      [multiple, maxFiles]
    );

    // Construir 'accept' solo si hay tipos válidos (evita warning con "*/*")
    const acceptOpt = useMemo(() => {
      const t = (acceptedTypes || "").trim();
      if (!t || t === "*/*") return undefined; // aceptar todo
      const mapping = t.split(",").reduce((acc, type) => {
        const key = type.trim();
        if (!key) return acc;
        acc[key] = [];
        return acc;
      }, {});
      return Object.keys(mapping).length ? mapping : undefined;
    }, [acceptedTypes]);

    // Configuración de react-dropzone
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      onDrop,
      accept: acceptOpt,
      maxSize,
      multiple,
      noClick: false,
      noKeyboard: false,
      preventDropOnDocument: true,
    });

    // Eliminar un archivo
    const handleRemove = (id) => {
      setFiles((currentFiles) => {
        const fileToRemove = currentFiles.find((f) => f.id === id);

        if (
          fileToRemove &&
          fileToRemove.url &&
          fileToRemove.url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(fileToRemove.url);
        }

        const newFiles = currentFiles
          .filter((f) => f.id !== id)
          .map((f, i) => ({ ...f, isMain: i === 0 }));

        // Notificar al padre en un efecto posterior
        pendingNotifyRef.current = newFiles;
        return newFiles;
      });
    };

    // Establecer un archivo como principal
    const handleSetMain = (id) => {
      if (!allowSetMain) return;

      setFiles((currentFiles) => {
        const fileToMakeMain = currentFiles.find((f) => f.id === id);
        if (!fileToMakeMain) return currentFiles;

        const otherFiles = currentFiles.filter((f) => f.id !== id);
        const newFiles = [fileToMakeMain, ...otherFiles].map((f, i) => ({
          ...f,
          isMain: i === 0,
        }));

        pendingNotifyRef.current = newFiles;
        return newFiles;
      });
    };

    // Mover un archivo arriba o abajo en la lista
    const handleMove = (fromIndex, direction) => {
      if (!allowReorder) return;

      setFiles((currentFiles) => {
        const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= currentFiles.length) return currentFiles;

        const newFiles = [...currentFiles];
        [newFiles[fromIndex], newFiles[toIndex]] = [
          newFiles[toIndex],
          newFiles[fromIndex],
        ];

        const updatedFiles = newFiles.map((f, i) => ({
          ...f,
          isMain: i === 0,
        }));

        pendingNotifyRef.current = updatedFiles;
        return updatedFiles;
      });
    };

    // Notificar cambios al padre DESPUÉS de que React haya aplicado el nuevo estado `files`
    // CRÍTICO: Solo notificar UNA VEZ por cambio, no en cada render
    const lastNotifiedRef = useRef(null);

    useEffect(() => {
      if (!pendingNotifyRef.current) return;

      const payload = pendingNotifyRef.current;
      pendingNotifyRef.current = null;

      // Evitar notificaciones duplicadas comparando con la última notificación
      const payloadKey = payload.map((f) => f.id).join("|");
      if (lastNotifiedRef.current === payloadKey) {
        return; // Ya notificamos este mismo payload
      }
      lastNotifiedRef.current = payloadKey;

      if (typeof onFilesChange === "function") {
        onFilesChange(payload);
      }
    }, [files]); // REMOVIDO onFilesChange de las dependencias para evitar loops

    // Abrir la cámara del dispositivo (móvil)
    const openCamera = (e) => {
      e.stopPropagation();
      setCaptureAttr("environment");
      // Dar tiempo a que el atributo se aplique antes de abrir
      setTimeout(() => {
        open();
        // limpiar el capture rápidamente para siguientes aperturas
        setTimeout(() => setCaptureAttr(undefined), 0);
      }, 30);
    };

    // Abrir la galería del dispositivo (móvil)
    const openGallery = (e) => {
      e.stopPropagation();
      setCaptureAttr(undefined);
      setTimeout(() => {
        open();
      }, 0);
    };

    return (
      <div className={`universal-file-uploader ${className}`}>
        {/* Zona de arrastrar y soltar */}
        <div
          {...getRootProps({
            className: `ufu-dropzone ${isDragActive ? "dragging" : ""} ${
              isDraggingOver ? "drag-over" : ""
            }`,
          })}
          ref={dropzoneRef}
          onDragEnter={() => setIsDraggingOver(true)}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={() => setIsDraggingOver(false)}
        >
          <input
            {...getInputProps({
              style: { display: "none" },
              multiple: multiple,
              capture: captureAttr,
            })}
          />

          <div className="ufu-dropzone-content">
            <UploadIcon />

            <div className="ufu-dropzone-desktop-text">
              <p className="ufu-dropzone-text-main">{label}</p>
              <p className="ufu-dropzone-text-sub">{placeholder}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Seleccionar Archivos
              </button>
            </div>

            {/* Botones específicos para móvil */}
            <div className="ufu-mobile-buttons">
              <button
                type="button"
                onClick={openCamera}
                className="ufu-mobile-button"
                aria-label="Abrir cámara"
              >
                <CameraIcon />
                <span>Cámara</span>
              </button>
              <button
                type="button"
                onClick={openGallery}
                className="ufu-mobile-button"
                aria-label="Abrir galería"
              >
                <GalleryIcon />
                <span>Galería</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alertas de archivos rechazados / límites */}
        {rejected.length > 0 && (
          <div
            className="mt-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm"
            role="alert"
          >
            <div className="flex items-start justify-between">
              <span className="font-semibold">
                Algunos archivos fueron rechazados
              </span>
              <button
                type="button"
                onClick={() => setRejected([])}
                className="ml-3 text-red-600 hover:text-red-800"
                aria-label="Cerrar"
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <ul className="list-disc ml-5 mt-2">
              {rejected.map((r, idx) => (
                <li key={`rejected-${idx}-${r.name || "unknown"}`}>
                  {r.name ? (
                    <span className="font-medium">{r.name}: </span>
                  ) : null}
                  {Array.isArray(r.messages)
                    ? r.messages.join(", ")
                    : String(r)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grid de vista previa de archivos - SIEMPRE VISIBLE CUANDO HAY ARCHIVOS */}
        {files.length > 0 ? (
          <div className="ufu-preview-grid">
            {files.map((file, index) => {
              // Generar key único para evitar warnings
              const uniqueKey =
                file.id ||
                `file-${index}-${file.name || "unknown"}-${Date.now()}`;
              return (
                <FilePreview
                  key={uniqueKey}
                  file={file}
                  onRemove={handleRemove}
                  onSetMain={allowSetMain ? handleSetMain : null}
                  onMove={allowReorder ? handleMove : null}
                  index={index}
                  fileCount={files.length}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm mt-4 p-4 border-2 border-dashed border-gray-200 rounded">
            📁 No hay archivos subidos aún - Arrastra o selecciona archivos
            arriba
          </div>
        )}
      </div>
    );
  }
);

// Comparación personalizada para React.memo
UniversalFileUploader.displayName = "UniversalFileUploader";

export default UniversalFileUploader;
