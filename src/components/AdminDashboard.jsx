import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
// Removed test/migration utilities from dashboard UI per requirements
import { FiBox, FiFolder, FiUsers, FiShoppingCart } from 'react-icons/fi';

const AdminDashboard = ({ onAddProduct, onOpenCategories, onViewAllProducts, onViewAllOrders }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    activeCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
    recentProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Recent products (limited)
        const recentSnap = await getDocs(query(collection(db, 'productos'), orderBy('fechaCreacion', 'desc'), limit(5)));
        const recentProducts = recentSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Full counts
        const allProductsSnap = await getDocs(collection(db, 'productos'));
        let activeCount = 0;
        allProductsSnap.forEach(doc => { if (doc.data()?.activo) activeCount++; });

        const categoriesSnap = await getDocs(query(collection(db, 'categorias')));
        const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const usersSnap = await getDocs(query(collection(db, 'users')));
        const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('fecha', 'desc'), limit(5)));
        const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setStats({
          totalProducts: allProductsSnap.size,
          activeProducts: activeCount,
          totalCategories: categories.length,
          activeCategories: categories.filter(c => c.activa).length,
          totalUsers: usersSnap.size,
          totalOrders: ordersSnap.size,
          recentProducts,
          recentOrders: orders
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} activos`,
      icon: <FiBox />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      subtitle: `${stats.activeCategories} activas`,
      icon: <FiFolder />,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      subtitle: 'Registrados',
      icon: <FiUsers />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders,
      subtitle: 'Total histórico',
      icon: <FiShoppingCart />,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Dashboard Administrativo</h2>
        <p className="text-gray-600">Resumen general del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Productos Recientes</h3>
            <p className="text-sm text-gray-600">Últimos productos agregados</p>
            <button onClick={onViewAllProducts} className="text-sm text-blue-600 hover:text-blue-700 font-medium float-right">Ver todos</button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.recentProducts.length > 0 ? (
              stats.recentProducts.map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.imagen ? (
                        <img
                          src={product.imagen}
                          alt={product.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiBox />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(product.precio)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(product.fechaCreacion)}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2 inline-flex"><FiBox /></div>
                <p>No hay productos recientes</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
            <p className="text-sm text-gray-600">Últimos pedidos recibidos</p>
            <button onClick={onViewAllOrders} className="text-sm text-blue-600 hover:text-blue-700 font-medium float-right">Ver todos</button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Pedido #{order.id?.slice(-8) || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.usuario?.nombre || 'Usuario desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.fecha)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.estado === 'completado' 
                          ? 'bg-green-100 text-green-800'
                          : order.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.estado || 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2 inline-flex"><FiShoppingCart /></div>
                <p>No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-lg shadow-sm border p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={onAddProduct} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl"><FiBox /></span>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Agregar Producto</p>
              <p className="text-sm text-gray-600">Crear nuevo producto</p>
            </div>
          </button>
          
          <button onClick={onOpenCategories} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl"><FiFolder /></span>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Nueva Categoría</p>
              <p className="text-sm text-gray-600">Crear categoría</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* System Status removed per requirements */}
    </div>
  );
};

export default AdminDashboard;
