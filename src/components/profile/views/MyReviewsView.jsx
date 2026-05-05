import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import { fixBucket } from "../../../utils/imageUtils";
import { FaStar, FaRegStar, FaTrash, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { CardSkeleton } from "../../ui/Skeleton";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("es-DO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Extraer imagen principal del producto (estructura flexible)
const resolveProductImage = (data) => {
  if (!data) return "";
  const pick = (u) => {
    if (!u) return "";
    if (typeof u === "string") return fixBucket(u);
    if (typeof u === "object") return fixBucket(u.url || u.src || "");
    return "";
  };
  const firstMedia = (arr) => {
    for (const m of arr || []) {
      const t = String(m?.type || "").toLowerCase();
      const url = pick(m);
      if (url && (!t || t.includes("image"))) return url;
    }
    return "";
  };
  return (
    pick(Array.isArray(data.imagenPrincipal) && data.imagenPrincipal[0]) ||
    pick(data.imagen) ||
    firstMedia(data.media) ||
    pick(Array.isArray(data.galeriaImagenes) && data.galeriaImagenes[0]) ||
    pick(Array.isArray(data.imagenes) && data.imagenes[0]) ||
    ""
  );
};

export default function MyReviewsView() {
  const { usuario } = useAuth() || {};
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({}); // productId -> { nombre, imagen }
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!usuario?.uid) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // Query collectionGroup con filtro por userId
        const q = query(
          collectionGroup(db, "reviews"),
          where("userId", "==", usuario.uid),
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({
          id: d.id,
          productId: d.ref.parent.parent?.id,
          ...d.data(),
        }));
        console.log(
          `[MyReviewsView] Encontradas ${items.length} reseñas para uid ${usuario.uid}`,
        );

        // Ordenar por fecha desc (en memoria para evitar index compuesto)
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });

        if (cancelled) return;
        setReviews(items);

        // Fetch productos (para imagen + nombre) de forma única
        const uniqueIds = [
          ...new Set(items.map((r) => r.productId).filter(Boolean)),
        ];
        const productsData = {};
        await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              const pSnap = await getDoc(doc(db, "productos", pid));
              if (pSnap.exists()) {
                const data = pSnap.data();
                productsData[pid] = {
                  nombre: data.nombre || data.titulo || "Producto",
                  imagen:
                    resolveProductImage(data) || "/placeholder-product.svg",
                };
              }
            } catch {}
          }),
        );
        if (cancelled) return;
        setProducts(productsData);
      } catch (e) {
        console.error("[MyReviewsView] Error cargando mis reseñas", e);
        if (!cancelled) {
          const msg = String(e?.message || e || "");
          // Detectar errores típicos y dar pistas accionables
          if (
            msg.includes("index") ||
            msg.includes("requires an index") ||
            e?.code === "failed-precondition"
          ) {
            setLoadError(
              "Falta un índice de Firestore. Ejecuta: firebase deploy --only firestore:indexes",
            );
          } else if (
            msg.includes("permission") ||
            e?.code === "permission-denied"
          ) {
            setLoadError(
              "Permisos insuficientes. Ejecuta: firebase deploy --only firestore:rules",
            );
          } else {
            setLoadError(msg || "Error desconocido al cargar opiniones");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [usuario?.uid]);

  const handleClickReview = (review) => {
    if (!review.productId) return;
    // Navegar al producto con hash #reviews para hacer scroll
    navigate(`/producto/${review.productId}#reviews`);
  };

  const handleDelete = async (review) => {
    if (!review?.productId || !review?.id) return;
    setDeletingId(review.id);
    try {
      await runTransaction(db, async (tx) => {
        const pRef = doc(db, "productos", review.productId);
        const rRef = doc(
          db,
          "productos",
          review.productId,
          "reviews",
          review.id,
        );
        const pSnap = await tx.get(pRef);
        if (pSnap.exists()) {
          const pdata = pSnap.data();
          const prevCount = Number(pdata?.ratingCount) || 0;
          const prevSum = Number(pdata?.ratingSum) || 0;
          const prevBreak = pdata?.ratingBreakdown || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          };
          const r = Math.max(
            1,
            Math.min(5, Math.round(Number(review.rating) || 0)),
          );
          const nextBreak = {
            ...prevBreak,
            [r]: Math.max(0, (prevBreak[r] || 0) - 1),
          };
          const nextCount = Math.max(0, prevCount - 1);
          const nextSum = Math.max(0, prevSum - (Number(review.rating) || 0));
          const nextAvg =
            nextCount > 0 ? Number((nextSum / nextCount).toFixed(2)) : 0;
          tx.update(pRef, {
            ratingCount: nextCount,
            ratingSum: nextSum,
            ratingAverage: nextAvg,
            ratingBreakdown: nextBreak,
          });
        }
        tx.delete(rRef);
      });
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (e) {
      console.error("Error eliminando reseña", e);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!usuario) {
    return (
      <p className="text-slate-600 dark:text-slate-400">
        Inicia sesión para ver tus opiniones.
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6">
        <h3 className="text-base font-bold text-red-800 dark:text-red-200 mb-2">
          No se pudieron cargar tus opiniones
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-2 font-mono break-words">
          {loadError}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400">
          Revisa la consola del navegador para más detalles.
        </p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <FaStar className="text-amber-400" size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Aún no has escrito opiniones
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Cuando escribas una opinión sobre un producto, aparecerá aquí para que
          puedas volver a consultarla o editarla.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Mis opiniones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "opinión publicada"
              : "opiniones publicadas"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => {
          const product = products[review.productId] || {};
          const productImage = product.imagen || "/placeholder-product.svg";
          const productName = product.nombre || "Producto";
          const isDeleting = deletingId === review.id;

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Imagen producto clickeable */}
                <button
                  type="button"
                  onClick={() => handleClickReview(review)}
                  className="flex-shrink-0 w-24 sm:w-32 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label={`Ver ${productName}`}
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-contain max-h-24 sm:max-h-28"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-product.svg";
                    }}
                  />
                </button>

                {/* Contenido */}
                <div className="flex-1 p-3 sm:p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleClickReview(review)}
                      className="text-left min-w-0 flex-1 group/name"
                    >
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover/name:text-blue-600 dark:group-hover/name:text-blue-400 transition-colors">
                        {productName}
                      </h3>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(review)}
                      disabled={isDeleting}
                      className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title="Eliminar opinión"
                      aria-label="Eliminar opinión"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>

                  {/* Rating estrellas + fecha */}
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((n) =>
                        n <= (review.rating || 0) ? (
                          <FaStar
                            key={n}
                            className="text-amber-400"
                            size={12}
                          />
                        ) : (
                          <FaRegStar
                            key={n}
                            className="text-gray-300 dark:text-gray-600"
                            size={12}
                          />
                        ),
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {formatDate(review.createdAt)}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-1.5 py-0.5">
                        Compra verificada
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-0.5">
                      {review.title}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    {review.comment}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleClickReview(review)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Ver opinión en el producto
                    <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirmación de borrado */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => !deletingId && setConfirmDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Eliminar esta opinión?
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Tu opinión será eliminada permanentemente y el promedio del
                producto se actualizará.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  disabled={!!deletingId}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancelar
                </button>
                <button
                  disabled={!!deletingId}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 inline-flex items-center gap-2"
                  onClick={() => handleDelete(confirmDelete)}
                >
                  {deletingId ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
