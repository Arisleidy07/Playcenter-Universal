// Utilidades para manejo de imágenes
export const fixBucket = (s) => {
  try {
    if (!s || typeof s !== "string") return s || "";
    const url = String(s).trim();

    // El bucket real del proyecto es *.firebasestorage.app (nuevo formato Firebase).
    // Si una URL legacy aún apunta a *.appspot.com, la normalizamos al bucket real.
    const CANONICAL_BUCKET = "playcenter-universal.firebasestorage.app";
    const fixBucketName = (bucket) => {
      if (!bucket) return bucket;
      if (/^playcenter-universal\.appspot\.com$/i.test(bucket)) {
        return CANONICAL_BUCKET;
      }
      return bucket;
    };

    const normalizeFirestoreStorageUrl = (raw) => {
      // Normaliza URLs como:
      // - https://firebasestorage.app/v0/b/<bucket>/o/<object>
      // - https://<project>.firebasestorage.app/v0/b/<bucket>/o/<object>
      // hacia:
      // - https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<object>
      try {
        const u = new URL(raw);
        const host = (u.hostname || "").toLowerCase();
        const isFirebaseStorageAppHost =
          host === "firebasestorage.app" ||
          host.endsWith(".firebasestorage.app");
        if (!isFirebaseStorageAppHost) return null;

        const m = u.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/i);
        if (!m) return null;

        const bucket = fixBucketName(m[1]);
        const objectPart = m[2]; // ya viene url-encoded normalmente

        const out = new URL(
          `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${objectPart}`,
        );
        out.search = u.search; // preservar token/alt/etc
        return out.toString();
      } catch {
        return null;
      }
    };

    if (/^gs:\/\//i.test(url)) {
      const m = url.match(/^gs:\/\/([^/]+)\/(.+)$/i);
      if (!m) return url;
      const bucket = fixBucketName(m[1]);
      const objectPath = m[2];
      const encodedPath = encodeURIComponent(objectPath);
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
    }

    // Convertir dominios firebasestorage.app al host canonical googleapis
    const normalizedFromAppHost = normalizeFirestoreStorageUrl(url);
    if (normalizedFromAppHost) return normalizedFromAppHost;

    // Only fix the one specific malformed bucket case in googleapis URLs
    if (
      /^https?:\/\/(?:firebasestorage|storage)\.googleapis\.com\//i.test(url)
    ) {
      return url.replace(/\/v0\/b\/([^/]+)\/o\//i, (match, bucket) => {
        const fixedBucket = fixBucketName(bucket);
        return `/v0/b/${fixedBucket}/o/`;
      });
    }

    // Return input unchanged for all other cases
    return url;
  } catch {
    return s || "";
  }
};
export const validateImageUrl = async (url) => {
  if (!url || typeof url !== "string") return false;

  try {
    // Verificar si es una URL válida
    new URL(url);

    // Verificar si la imagen existe
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    // console.warn('URL de imagen inválida:', url, error);
    return false;
  }
};

export const getValidImageUrl = (imageUrls = []) => {
  // Convertir a array si es un string
  const urls = (Array.isArray(imageUrls) ? imageUrls : [imageUrls]).map((u) =>
    typeof u === "string" ? fixBucket(u) : u,
  );

  // Filtrar URLs válidas - MUY PERMISIVO
  const validUrls = urls.filter((url) => {
    if (!url || typeof url !== "string") return false;

    // Verificar que no sea una URL blob (temporal)
    if (url.startsWith("blob:")) return false;

    // Permitir TODAS las URLs que parezcan imágenes
    if (
      url.includes("firebasestorage") ||
      url.includes("googleapis.com") ||
      url.includes("firebase") ||
      url.match(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/i) ||
      url.startsWith("/") || // URLs locales
      url.startsWith("http") // URLs externas
    ) {
      return true;
    }

    return false;
  });

  return validUrls[0] || null;
};

export const cleanupBrokenImages = (products = []) => {
  return products.map((product) => {
    const cleanProduct = { ...product };

    // Limpiar imagen principal
    if (cleanProduct.imagen) {
      cleanProduct.imagen = getValidImageUrl(fixBucket(cleanProduct.imagen));
    }

    // Limpiar imágenes principales estructuradas
    if (
      cleanProduct.imagenPrincipal &&
      Array.isArray(cleanProduct.imagenPrincipal)
    ) {
      cleanProduct.imagenPrincipal = cleanProduct.imagenPrincipal
        .filter((img) => getValidImageUrl(fixBucket(img?.url || img)))
        .map((img) => {
          const u =
            typeof img === "string"
              ? fixBucket(img)
              : fixBucket(img?.url || "");
          return typeof img === "string" ? { url: u } : { ...img, url: u };
        });
    }

    // Limpiar galería de imágenes
    if (
      cleanProduct.galeriaImagenes &&
      Array.isArray(cleanProduct.galeriaImagenes)
    ) {
      cleanProduct.galeriaImagenes = cleanProduct.galeriaImagenes
        .filter((img) => getValidImageUrl(fixBucket(img?.url || img)))
        .map((img) => {
          const u =
            typeof img === "string"
              ? fixBucket(img)
              : fixBucket(img?.url || "");
          return typeof img === "string" ? { url: u } : { ...img, url: u };
        });
    }

    // Limpiar imágenes legacy
    if (cleanProduct.imagenes && Array.isArray(cleanProduct.imagenes)) {
      cleanProduct.imagenes = cleanProduct.imagenes
        .map((u) => fixBucket(u))
        .filter((url) => getValidImageUrl(url));
    }

    // Limpiar imágenes extra
    if (
      cleanProduct.imagenesExtra &&
      Array.isArray(cleanProduct.imagenesExtra)
    ) {
      cleanProduct.imagenesExtra = cleanProduct.imagenesExtra
        .map((u) => fixBucket(u))
        .filter((url) => getValidImageUrl(url));
    }

    // Limpiar tres archivos extras
    if (
      cleanProduct.tresArchivosExtras &&
      Array.isArray(cleanProduct.tresArchivosExtras)
    ) {
      cleanProduct.tresArchivosExtras = cleanProduct.tresArchivosExtras
        .map((u) => fixBucket(u))
        .filter((url) => getValidImageUrl(url));
    }

    // Limpiar variantes
    if (cleanProduct.variantes && Array.isArray(cleanProduct.variantes)) {
      cleanProduct.variantes = cleanProduct.variantes.map((variant) => {
        const cleanVariant = { ...variant };

        if (cleanVariant.imagen) {
          cleanVariant.imagen = getValidImageUrl(
            fixBucket(cleanVariant.imagen),
          );
        }

        if (
          cleanVariant.imagenPrincipal &&
          Array.isArray(cleanVariant.imagenPrincipal)
        ) {
          cleanVariant.imagenPrincipal = cleanVariant.imagenPrincipal
            .filter((img) => getValidImageUrl(fixBucket(img?.url || img)))
            .map((img) => {
              const u =
                typeof img === "string"
                  ? fixBucket(img)
                  : fixBucket(img?.url || "");
              return typeof img === "string" ? { url: u } : { ...img, url: u };
            });
        }

        if (
          cleanVariant.galeriaImagenes &&
          Array.isArray(cleanVariant.galeriaImagenes)
        ) {
          cleanVariant.galeriaImagenes = cleanVariant.galeriaImagenes
            .filter((img) => getValidImageUrl(fixBucket(img?.url || img)))
            .map((img) => {
              const u =
                typeof img === "string"
                  ? fixBucket(img)
                  : fixBucket(img?.url || "");
              return typeof img === "string" ? { url: u } : { ...img, url: u };
            });
        }

        if (cleanVariant.imagenes && Array.isArray(cleanVariant.imagenes)) {
          cleanVariant.imagenes = cleanVariant.imagenes
            .map((u) => fixBucket(u))
            .filter((url) => getValidImageUrl(url));
        }

        return cleanVariant;
      });
    }

    return cleanProduct;
  });
};

export const getImageWithFallback = (
  primaryUrl,
  fallbackUrls = [],
  placeholder = "/placeholder-image.png",
) => {
  const allUrls = [primaryUrl, ...fallbackUrls]
    .filter(Boolean)
    .map((u) => fixBucket(u));

  for (const url of allUrls) {
    const validUrl = getValidImageUrl(url);
    if (validUrl) return validUrl;
  }

  return placeholder;
};
