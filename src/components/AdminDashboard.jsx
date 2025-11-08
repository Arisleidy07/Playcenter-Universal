import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FiPackage, FiUsers, FiShoppingBag, FiGrid, FiDatabase } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = ({ onEditProduct, onViewUsers, onViewOrders, onViewProducts, onViewCategories }) => {
  const [stats, setStats] = useState({
    productos: 0,
    categorias: 0,
    usuarios: 0,
    pedidos: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  useEffect(() => {
    // TIEMPO REAL para productos - Se actualiza cuando se eliminan/agregan
    const unsubscribeProducts = onSnapshot(
      query(collection(db, 'productos')),
      (snapshot) => {
        const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
        const validProductsCount = snapshot.docs.filter(doc => !phantomProducts.includes(doc.id)).length;
        
        setStats(prevStats => ({
          ...prevStats,
          productos: validProductsCount
        }));
      },
      (error) => {
        console.error('Error fetching products count:', error);
      }
    );

    // TIEMPO REAL para usuarios
    const unsubscribeUsers = onSnapshot(
      query(collection(db, 'usuarios')),
      (snapshot) => {
        setStats(prevStats => ({
          ...prevStats,
          usuarios: snapshot.size
        }));
      },
      (error) => {
        console.error('Error fetching users count:', error);
      }
    );

    // TIEMPO REAL para categorías
    const unsubscribeCategories = onSnapshot(
      query(collection(db, 'categorias')),
      (snapshot) => {
        setStats(prevStats => ({
          ...prevStats,
          categorias: snapshot.size
        }));
      },
      (error) => {
        console.error('Error fetching categories count:', error);
      }
    );

    // TIEMPO REAL para pedidos
    const unsubscribeOrders = onSnapshot(
      query(collection(db, 'pedidos')),
      (snapshot) => {
        setStats(prevStats => ({
          ...prevStats,
          pedidos: snapshot.size
        }));
      },
      (error) => {
        console.error('Error fetching orders count:', error);
      }
    );

    const fetchRecentProducts = () => {
      try {
        const q = query(
          collection(db, 'productos'),
          orderBy('fechaCreacion', 'desc'),
          limit(5)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          // Filtrar productos fantasma
          const phantomProducts = JSON.parse(localStorage.getItem('phantomProducts') || '[]');
          
          const productsData = snapshot.docs
            .filter(doc => doc.exists() && !phantomProducts.includes(doc.id))
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          
          setRecentProducts(productsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching recent products:', error);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Error setting up recent products listener:', error);
        setLoading(false);
      }
    };

    const unsubscribeRecentProducts = fetchRecentProducts();
    
    return () => {
      // Limpiar todos los listeners
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeCategories) unsubscribeCategories();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeRecentProducts) unsubscribeRecentProducts();
    };
  }, []);

  // Función para migrar productos a Play Center Universal
  const migrateProductsToStore = async () => {
    if (!confirm('¿Deseas migrar todos los productos sin tienda a "Play Center Universal"?')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const productosRef = collection(db, 'productos');
      const snapshot = await getDocs(productosRef);
      
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const docSnapshot of snapshot.docs) {
        const productId = docSnapshot.id;
        const productData = docSnapshot.data();
        
        // Si ya tiene tienda, omitir
        if (productData.tienda_id) {
          skipped++;
          continue;
        }
        
        try {
          const productRef = doc(db, 'productos', productId);
          await updateDoc(productRef, {
            tienda_id: 'playcenter_universal',
            tienda_nombre: 'Play Center Universal'
          });
          updated++;
        } catch (error) {
          console.error(`Error en ${productId}:`, error);
          errors++;
        }
      }

      setMigrationResult({
        success: true,
        updated,
        skipped,
        errors,
        total: snapshot.size
      });

    } catch (error) {
      console.error('Error en migración:', error);
      setMigrationResult({
        success: false,
        error: error.message
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Dashboard</h2>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>
        
        {/* Migration Button */}
        <button
          onClick={migrateProductsToStore}
          disabled={migrating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
        >
          <FiDatabase className="text-lg" />
          {migrating ? 'Migrando...' : 'Migrar a Play Center Universal'}
        </button>
      </div>

      {/* Migration Result */}
      {migrationResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            migrationResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {migrationResult.success ? (
            <div>
              <h3 className="font-bold text-green-900 mb-2">✅ Migración Completada</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>✅ Actualizados: {migrationResult.updated}</p>
                <p>⏭️ Omitidos (ya tenían tienda): {migrationResult.skipped}</p>
                <p>❌ Errores: {migrationResult.errors}</p>
                <p>📦 Total: {migrationResult.total}</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-red-900 mb-2">❌ Error en Migración</h3>
              <p className="text-sm text-red-800">{migrationResult.error}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Productos" 
          count={stats.productos} 
          icon={<FiPackage className="text-blue-500" size={24} />} 
          onClick={onViewProducts}
        />
        <StatsCard 
          title="Categorías" 
          count={stats.categorias} 
          icon={<FiGrid className="text-green-500" size={24} />} 
          onClick={onViewCategories}
        />
        <StatsCard 
          title="Usuarios" 
          count={stats.usuarios} 
          icon={<FiUsers className="text-purple-500" size={24} />} 
          onClick={onViewUsers}
        />
        <StatsCard 
          title="Pedidos" 
          count={stats.pedidos} 
          icon={<FiShoppingBag className="text-orange-500" size={24} />} 
          onClick={onViewOrders}
        />
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Productos Recientes</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {(() => {
                            try {
                              const mainImage = product.imagen || 
                                             (Array.isArray(product.imagenes) && product.imagenes.length > 0 ? product.imagenes[0] : null) ||
                                             (Array.isArray(product.variantes) && product.variantes.length > 0 && product.variantes[0].imagen ? product.variantes[0].imagen : null) ||
                                             (Array.isArray(product.media) && product.media.length > 0 ? product.media[0].url : null) ||
                                             (Array.isArray(product.variantes) && product.variantes.length > 0 && 
                                              Array.isArray(product.variantes[0].media) && product.variantes[0].media.length > 0 ? 
                                              product.variantes[0].media[0].url : null);
                              
                              return mainImage ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={mainImage} 
                                  alt="" 
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                  N/A
                                </div>
                              );
                            } catch (error) {
                              return (
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">
                                  Error
                                </div>
                              );
                            }
                          })()}
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs" style={{display: 'none'}}>
                            N/A
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.nombre || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Intl.NumberFormat('es-DO', {
                          style: 'currency',
                          currency: 'DOP'
                        }).format(product.precio || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => onEditProduct && onEditProduct(product)} 
                        className="text-blue-600 hover:text-blue-900 mr-4 font-medium cursor-pointer"
                      >
                        Editar
                      </button>
                      <Link to={`/producto/${product.id}`} className="text-green-600 hover:text-green-900" target="_blank" rel="noopener noreferrer">
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay productos recientes</p>
          </div>
        )}
        
        <div className="mt-4 text-right">
          <button 
            onClick={onViewProducts}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
          >
            Ver todos los productos →
          </button>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, count, icon, onClick }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="bg-white p-6 rounded-lg shadow-sm border transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
        </div>
        <div>{icon}</div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
