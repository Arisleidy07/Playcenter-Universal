import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Hook for fetching all products (admin version includes inactive)
export const useProducts = (includeInactive = false) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let q;
        if (includeInactive) {
          // Admin view: include all products
          q = query(
            collection(db, 'productos'),
            orderBy('fechaCreacion', 'desc')
          );
        } else {
          // Public view: only active products
          q = query(
            collection(db, 'productos'),
            where('activo', '==', true),
            orderBy('fechaCreacion', 'desc')
          );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
          
          const productsData = [];
          
          snapshot.docs.forEach(doc => {
            const isPhantom = phantomProducts.includes(doc.id);
            
            if (!isPhantom && doc.exists()) {
              productsData.push({
                id: doc.id,
                ...doc.data()
              });
            }
          });
          
          setProducts(productsData);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching products:', err);
          setError(err.message);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error setting up products listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [includeInactive]);

  return { products, loading, error };
};

// Hook for fetching products by category
export const useProductsByCategory = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'phantomProducts') {
        setUpdateTrigger(prev => prev + 1);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        let q;
        if (!categoryId || categoryId === "" || categoryId === "todos") {
          // Get all active products
          q = query(
            collection(db, 'productos'),
            where('activo', '==', true),
            orderBy('fechaCreacion', 'desc')
          );
        } else {
          // Get products by category
          q = query(
            collection(db, 'productos'),
            where('categoria', '==', categoryId),
            where('activo', '==', true),
            orderBy('fechaCreacion', 'desc')
          );
        }
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          // Filtrar productos fantasma
          const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
          
          const productsData = [];
          
          snapshot.docs.forEach(doc => {
            const isPhantom = phantomProducts.includes(doc.id);
            
            if (!isPhantom && doc.exists()) {
              productsData.push({
                id: doc.id,
                ...doc.data()
              });
            }
          });
          
          setProducts(productsData);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching products by category:', err);
          setError(err.message);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error setting up products by category listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [categoryId, updateTrigger]);

  return { products, loading, error };
};

// Hook for fetching a single product - VERSIÓN ORIGINAL QUE FUNCIONABA
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let unsubPrimary = null;
    let unsubSecondary = null;
    let fallbackTriggered = false;
    setLoading(true);
    setError(null);

    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const attachListenerToId = (id) => {
      try {
        const refFound = doc(db, 'productos', id);
        return onSnapshot(refFound, (snap) => {
          if (snap.exists()) {
            setProduct({ id: snap.id, ...snap.data() });
            setError(null);
            setLoading(false);
          } else {
            setError('Producto no encontrado');
            setProduct(null);
            setLoading(false);
          }
        }, (err) => {
          setError(err?.message || 'Error al cargar el producto');
          setLoading(false);
        });
      } catch (e) {
        setError('Error al suscribirse al producto');
        setLoading(false);
        return null;
      }
    };

    const doFallbackSearch = async () => {
      if (fallbackTriggered) return; // evitar múltiples búsquedas
      fallbackTriggered = true;
      try {
        // 1) Buscar por slug exacto
        const qSlug = query(collection(db, 'productos'), where('slug', '==', productId), limit(1));
        const snapSlug = await getDocs(qSlug);
        if (!snapSlug.empty) {
          const foundId = snapSlug.docs[0].id;
          unsubSecondary = attachListenerToId(foundId);
          return;
        }

        // 2) Cargar todos y buscar por nombre normalizado o slug normalizado
        const snapAll = await getDocs(collection(db, 'productos'));
        const all = snapAll.docs.map(d => ({ id: d.id, ...d.data() }));
        const target = normalize(productId);
        const match = all.find(p => normalize(p.slug || '') === target || normalize(p.nombre || '') === target || p.id === productId);
        if (match) {
          unsubSecondary = attachListenerToId(match.id);
        } else {
          setError('Producto no encontrado');
          setProduct(null);
          setLoading(false);
        }
      } catch (err) {
        setError('Error al cargar el producto');
        setProduct(null);
        setLoading(false);
      }
    };

    try {
      // 0) Intentar suscripción directa por ID proporcionado
      const ref = doc(db, 'productos', productId);
      unsubPrimary = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          setError(null);
          setLoading(false);
        } else {
          // Fallback: intentar encontrar por slug/nombre
          doFallbackSearch();
        }
      }, (err) => {
        // Si falla la suscripción directa, intentar fallback
        doFallbackSearch();
      });
    } catch (e) {
      doFallbackSearch();
    }

    return () => {
      if (typeof unsubPrimary === 'function') unsubPrimary();
      if (typeof unsubSecondary === 'function') unsubSecondary();
    };
  }, [productId]);

  return { product, loading, error };
};

// Hook for fetching all categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(
          collection(db, 'categorias'),
          where('activa', '==', true),
          orderBy('orden', 'asc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const categoriesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCategories(categoriesData);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching categories:', err);
          setError(err.message);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error setting up categories listener:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook for fetching products grouped by category (for homepage)
export const useProductsByCategories = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubCategories = null;
    let unsubProducts = null;
    let currentCategories = [];
    let currentProducts = [];
    let catsReady = false;
    let prodsReady = false;

    const regroup = () => {
      if (!catsReady || !prodsReady) return;
      try {
        const grouped = {};
        currentCategories.forEach((category) => {
          grouped[category.id] = currentProducts.filter(
            (p) => p.categoria === category.id
          );
        });
        setProductsByCategory(grouped);
        setLoading(false);
      } catch (e) {
        console.error('Error grouping products by categories:', e);
        setError(e.message || 'Error agrupando productos');
        setLoading(false);
      }
    };

    try {
      // Categories in real time
      const cq = query(
        collection(db, 'categorias'),
        where('activa', '==', true),
        orderBy('orden', 'asc')
      );
      unsubCategories = onSnapshot(
        cq,
        (snap) => {
          currentCategories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setCategories(currentCategories);
          catsReady = true;
          regroup();
        },
        (err) => {
          console.error('Error fetching categories (rt):', err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Products in real time (only active)
      const pq = query(
        collection(db, 'productos'),
        where('activo', '==', true),
        orderBy('fechaCreacion', 'desc')
      );
      unsubProducts = onSnapshot(
        pq,
        (snap) => {
          const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
          
          currentProducts = [];
          
          snap.docs.forEach((d) => {
            const isPhantom = phantomProducts.includes(d.id);
            
            if (!isPhantom && d.exists()) {
              currentProducts.push({ id: d.id, ...d.data() });
            }
          });
          
          prodsReady = true;
          regroup();
        },
        (err) => {
          console.error('Error fetching products (rt):', err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error setting up realtime listeners:', err);
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (typeof unsubCategories === 'function') unsubCategories();
      if (typeof unsubProducts === 'function') unsubProducts();
    };
  }, []);

  return { productsByCategory, categories, loading, error };
};

// Hook for searching products
export const useProductSearch = (searchTerm, categoryFilter = '') => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'productos'),
          where('activo', '==', true)
        );

        if (categoryFilter) {
          q = query(q, where('categoria', '==', categoryFilter));
        }

        const snapshot = await getDocs(q);
        const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
        
        const allProducts = [];
        
        snapshot.docs.forEach(doc => {
          const isPhantom = phantomProducts.includes(doc.id);
          
          if (!isPhantom && doc.exists()) {
            allProducts.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });

        // Client-side filtering for text search (Firebase doesn't support full-text search)
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = allProducts.filter(product => 
          product.nombre?.toLowerCase().includes(searchTermLower) ||
          product.descripcion?.toLowerCase().includes(searchTermLower) ||
          product.empresa?.toLowerCase().includes(searchTermLower) ||
          product.etiquetas?.some(tag => tag.toLowerCase().includes(searchTermLower))
        );

        setResults(filtered);
      } catch (err) {
        console.error('Error searching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter]);

  return { results, loading, error };
};
