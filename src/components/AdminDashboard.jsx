import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { FiPackage, FiUsers, FiShoppingBag, FiGrid } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    productos: 0,
    categorias: 0,
    usuarios: 0,
    pedidos: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const productsQuery = query(collection(db, 'productos'));
        const productsSnapshot = await getDocs(productsQuery);
        
        // Fetch categories count
        const categoriesQuery = query(collection(db, 'categorias'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        
        // Fetch users count
        const usersQuery = query(collection(db, 'usuarios'));
        const usersSnapshot = await getDocs(usersQuery);
        
        // Fetch orders count (if you have an orders collection)
        let ordersCount = 0;
        try {
          const ordersQuery = query(collection(db, 'pedidos'));
          const ordersSnapshot = await getDocs(ordersQuery);
          ordersCount = ordersSnapshot.size;
        } catch (error) {
          console.log('No pedidos collection or other error:', error);
        }
        
        setStats({
          productos: productsSnapshot.size,
          categorias: categoriesSnapshot.size,
          usuarios: usersSnapshot.size,
          pedidos: ordersCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchRecentProducts = () => {
      try {
        const q = query(
          collection(db, 'productos'),
          orderBy('fechaCreacion', 'desc'),
          limit(5)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
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

    fetchStats();
    const unsubscribe = fetchRecentProducts();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Dashboard</h2>
          <p className="text-gray-600">Bienvenido al panel de administración</p>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Productos" 
          count={stats.productos} 
          icon={<FiPackage className="text-blue-500" size={24} />} 
          linkTo="/admin/productos"
        />
        <StatsCard 
          title="Categorías" 
          count={stats.categorias} 
          icon={<FiGrid className="text-green-500" size={24} />} 
          linkTo="/admin/categorias"
        />
        <StatsCard 
          title="Usuarios" 
          count={stats.usuarios} 
          icon={<FiUsers className="text-purple-500" size={24} />} 
          linkTo="/admin/usuarios"
        />
        <StatsCard 
          title="Pedidos" 
          count={stats.pedidos} 
          icon={<FiShoppingBag className="text-orange-500" size={24} />} 
          linkTo="/admin/pedidos"
        />
      </div>

      {/* Recent Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Productos Recientes</h3>
        
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
                      <Link to={`/admin/productos/editar/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Editar
                      </Link>
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
          <Link to="/admin/productos" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, count, icon, linkTo }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      className="bg-white p-6 rounded-lg shadow-sm border transition-all"
    >
      <Link to={linkTo} className="block">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-full">
            {icon}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AdminDashboard;
