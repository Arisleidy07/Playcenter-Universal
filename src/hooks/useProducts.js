import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Hook for fetching all products
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'productos'),
          where('activo', '==', true),
          orderBy('fechaCreacion', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
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
  }, []);

  return { products, loading, error };
};

// Hook for fetching products by category
export const useProductsByCategory = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
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
  }, [categoryId]);

  return { products, loading, error };
};

// Hook for fetching a single product
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

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'productos', productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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
    const fetchData = async () => {
      try {
        // Fetch categories first
        const categoriesQuery = query(
          collection(db, 'categorias'),
          where('activa', '==', true),
          orderBy('orden', 'asc')
        );
        
        const categoriesSnap = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCategories(categoriesData);

        // Fetch all active products
        const productsQuery = query(
          collection(db, 'productos'),
          where('activo', '==', true),
          orderBy('fechaCreacion', 'desc')
        );
        
        const productsSnap = await getDocs(productsQuery);
        const productsData = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group products by category
        const grouped = {};
        categoriesData.forEach(category => {
          grouped[category.id] = productsData.filter(product => 
            product.categoria === category.id
          );
        });

        setProductsByCategory(grouped);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products by categories:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
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
        const allProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

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
