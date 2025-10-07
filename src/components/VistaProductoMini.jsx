import React, { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import AdvancedMediaGallery from './AdvancedMediaGallery';
import { db } from '../firebase';

// Util: normalizar URL y detectar tipo
const normalize = (u) => (u ? String(u).split('?')[0].split('#')[0].trim().toLowerCase() : '');
const isVideoUrl = (u) => /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(normalize(u));
const toMedia = (u) => (!u ? null : ({ type: isVideoUrl(u) ? 'video' : 'image', url: u }));

// Construye una vista de producto desde Firestore y/o draftData (formData)
const useMiniProduct = (productId, draftData) => {
  const [liveDoc, setLiveDoc] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLiveDoc(null);
      return;
    }
    const ref = doc(db, 'productos', productId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setLiveDoc({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [productId]);

  // Merge prefer liveDoc for media; fallback to draftData
  const merged = useMemo(() => {
    const src = liveDoc || draftData || {};
    // Mapear posibles campos (nuevo y legacy)

    // Principal
    const mainImage = src.mainImage || src.imagen || '';

    // Galería (admite imágenes y videos)
    const gallery = Array.isArray(src.gallery)
      ? src.gallery
      : (Array.isArray(src.imagenes) ? src.imagenes : []);

    // Videos del producto (carrusel)
    const productVideos = Array.isArray(src.productVideos)
      ? src.productVideos
      : (Array.isArray(src.videoUrls) ? src.videoUrls : (src.videoUrl ? [src.videoUrl] : []));

    // Tres extras
    const extraMedia = Array.isArray(src.extraMedia)
      ? src.extraMedia
      : (Array.isArray(src.imagenesExtra) ? src.imagenesExtra : []);

    // Variantes
    const variantsRaw = Array.isArray(src.variants)
      ? src.variants
      : (Array.isArray(src.variantes) ? src.variantes : []);

    const variants = variantsRaw.map((v, idx) => ({
      id: v.id || `var_${idx}`,
      name: v.name || v.color || `Variante ${idx + 1}`,
      price: v.price ?? v.precio ?? null,
      stock: v.stock ?? v.cantidad ?? null,
      mainImage: v.mainImage || v.imagen || '',
      // Galería de variante puede incluir videos si el arreglo los contiene
      gallery: Array.isArray(v.gallery) ? v.gallery : (Array.isArray(v.imagenes) ? v.imagenes : []),
      // Videos vinculados a variante
      videos: Array.isArray(v.videos) ? v.videos : (Array.isArray(v.videoUrls) ? v.videoUrls : (v.video ? [v.video] : [])),
    }));

    return { ...src, mainImage, gallery, productVideos, extraMedia, variants };
  }, [liveDoc, draftData]);

  return merged;
};

const VistaProductoMini = ({ productId, draftData, className = '' }) => {
  const producto = useMiniProduct(productId, draftData);
  const [varIndex, setVarIndex] = useState(0);

  useEffect(() => {
    setVarIndex(0);
  }, [producto?.id]);

  const activeVariant = producto?.variants?.[varIndex] || null;

  // Media principal (preferir variante si tiene mainImage o gallery)
  const gallerySource = (activeVariant && (activeVariant.mainImage || (activeVariant.gallery || []).length)) ? activeVariant : producto;

  const mainImage = gallerySource?.mainImage || '';
  const galleryList = Array.isArray(gallerySource?.gallery) ? gallerySource.gallery : [];
  // Añadir videos de la variante activa a la galería principal (si existen)
  const variantVideos = Array.isArray(activeVariant?.videos) ? activeVariant.videos : [];
  const galleryListCombined = [...galleryList, ...variantVideos];

  // Compose mediaItems: main first if not in gallery, then gallery items
  const mediaItems = [];
  if (mainImage) {
    const key = normalize(mainImage);
    if (!galleryListCombined.some((g) => normalize(g) === key)) {
      mediaItems.push(toMedia(mainImage));
    }
  }
  galleryListCombined.forEach((u) => mediaItems.push(toMedia(u)));

  // Videos "Acerca de este artículo" (preferir arreglo dedicado)
  const acercaList = Array.isArray(producto?.videoAcercaArticulo)
    ? producto.videoAcercaArticulo
    : (producto?.videoUrl ? [producto.videoUrl] : (producto?.productVideos || []));
  const videoItems = acercaList.map((u) => ({ type: 'video', url: u })).filter(Boolean);

  // Extras (max 3)
  const extras = (producto?.extraMedia || []).slice(0, 3);

  // Datos básicos
  const name = producto?.name || producto?.nombre || 'Producto';
  const price = producto?.price ?? producto?.precio ?? 0;
  const stock = producto?.stock ?? producto?.cantidad ?? null;

  return (
    <div className={`vista-producto-mini ${className}`}>
      {/* Header name */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Vista previa</h3>
        <p className="text-sm text-gray-500">Sin relacionados. Refleja cambios al instante.</p>
      </div>

      {/* Top: Media + Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Media viewer (mezcla imágenes y videos si están en galería) */}
        {mediaItems.filter(Boolean).length > 0 && (
          <AdvancedMediaGallery
            mediaItems={mediaItems.filter(Boolean)}
            productName={name}
            className=""
            showThumbnails={true}
            showControls={true}
            autoPlay={false}
            enableZoom={true}
            enableFullscreen={false}
          />
        )}

        {/* Info panel */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h4 className="text-xl font-bold text-gray-900 mb-2">{name}</h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-semibold text-blue-700">RD$ {Number(price || 0).toLocaleString('es-DO')}</span>
            {typeof stock === 'number' && (
              <span className={`text-xs px-2 py-1 rounded-full ${stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {stock > 0 ? 'En stock' : 'Agotado'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm shadow hover:bg-blue-700 transition-colors" disabled onClick={(e) => e.stopPropagation()}>
              Agregar al carrito
            </button>
            <button type="button" className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm shadow hover:bg-emerald-700 transition-colors" disabled onClick={(e) => e.stopPropagation()}>
              Comprar ahora
            </button>
          </div>
        </div>
      </div>

      {/* Variantes */}
      {Array.isArray(producto?.variants) && producto.variants.length > 0 && (
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Variantes</h5>
          <div className="flex flex-wrap gap-2">
            {producto.variants.map((v, i) => (
              <button
                type="button"
                key={v.id || i}
                onClick={(e) => { e.stopPropagation(); setVarIndex(i); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm hover:shadow transition-all ${i === varIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
              >
                {v.mainImage ? (
                  <img src={v.mainImage} alt={v.name} className="w-8 h-8 object-contain rounded" />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-100" />
                )}
                <span className="text-sm text-gray-800">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Videos del producto (carrusel) */}
      {videoItems.length > 0 && (
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Acerca de este artículo</h5>
          <AdvancedMediaGallery
            mediaItems={videoItems}
            productName={name}
            className=""
            showThumbnails={videoItems.length > 1}
            showControls={true}
            autoPlay={false}
            enableZoom={false}
            enableFullscreen={false}
          />
        </div>
      )}

      {/* Tres archivos extras */}
      {extras.length > 0 && (
        <div className="mt-6">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Extras</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {extras.map((u, idx) => {
              const vid = isVideoUrl(u);
              return (
                <div key={idx} className="rounded-lg border bg-white p-2 shadow-sm">
                  {vid ? (
                    <video src={u} className="w-full h-40 object-contain rounded" controls preload="metadata" />
                  ) : (
                    <img src={u} className="w-full h-40 object-contain rounded" alt={`extra-${idx+1}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaProductoMini;
