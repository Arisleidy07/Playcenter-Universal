import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Traducciones
const resources = {
  es: {
    translation: {
      // Navegación
      home: "Inicio",
      products: "Productos",
      categories: "Categorías",
      cart: "Carrito",
      profile: "Perfil",
      
      // Perfil
      myAccount: "Mi cuenta",
      myOrders: "Mis pedidos",
      myAddresses: "Mis direcciones",
      paymentMethods: "Métodos de pago",
      settings: "Configuración",
      logout: "Cerrar sesión",
      
      // Cuenta
      editProfile: "Editar perfil",
      name: "Nombre",
      email: "Correo electrónico",
      phone: "Teléfono",
      address: "Dirección",
      save: "Guardar",
      cancel: "Cancelar",
      
      // Pedidos
      orderNumber: "Pedido #{{number}}",
      orderDate: "{{date}}",
      total: "Total",
      status: "Estado",
      completed: "Completado",
      pending: "Pendiente",
      cancelled: "Cancelado",
      viewDetails: "Ver detalles",
      noOrders: "No tienes pedidos aún",
      
      // Direcciones
      addAddress: "Añadir dirección",
      editAddress: "Editar dirección",
      deleteAddress: "Eliminar dirección",
      setAsDefault: "Establecer como predeterminada",
      pickupInStore: "Recoger en tienda",
      
      // Configuración
      changePassword: "Cambiar contraseña",
      currentPassword: "Contraseña actual",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      notifications: "Notificaciones",
      emailNotifications: "Notificaciones por correo",
      orderNotifications: "Notificaciones de pedidos",
      offersNotifications: "Ofertas y promociones",
      language: "Idioma",
      
      // Notificaciones
      profileUpdated: "Perfil actualizado correctamente",
      passwordChanged: "Contraseña cambiada correctamente",
      addressAdded: "Dirección añadida",
      addressDeleted: "Dirección eliminada",
      error: "Ocurrió un error",
      
      // Productos
      addToCart: "Agregar al carrito",
      buyNow: "Comprar ahora",
      outOfStock: "Agotado",
      inStock: "En stock",
      price: "Precio",
      description: "Descripción",
      specifications: "Especificaciones",
      
      // Carrito
      cartEmpty: "Tu carrito está vacío",
      subtotal: "Subtotal",
      shipping: "Envío",
      freeShipping: "Envío gratis",
      proceedToCheckout: "Proceder al pago",
      
      // General
      welcome: "Bienvenido",
      loading: "Cargando...",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      apply: "Aplicar",
      clear: "Limpiar",
      close: "Cerrar",
      confirm: "Confirmar",
      delete: "Eliminar",
      edit: "Editar",
      back: "Volver",
    },
  },
  en: {
    translation: {
      // Navigation
      home: "Home",
      products: "Products",
      categories: "Categories",
      cart: "Cart",
      profile: "Profile",
      
      // Profile
      myAccount: "My account",
      myOrders: "My orders",
      myAddresses: "My addresses",
      paymentMethods: "Payment methods",
      settings: "Settings",
      logout: "Logout",
      
      // Account
      editProfile: "Edit profile",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      save: "Save",
      cancel: "Cancel",
      
      // Orders
      orderNumber: "Order #{{number}}",
      orderDate: "{{date}}",
      total: "Total",
      status: "Status",
      completed: "Completed",
      pending: "Pending",
      cancelled: "Cancelled",
      viewDetails: "View details",
      noOrders: "You don't have any orders yet",
      
      // Addresses
      addAddress: "Add address",
      editAddress: "Edit address",
      deleteAddress: "Delete address",
      setAsDefault: "Set as default",
      pickupInStore: "Pick up in store",
      
      // Settings
      changePassword: "Change password",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      notifications: "Notifications",
      emailNotifications: "Email notifications",
      orderNotifications: "Order notifications",
      offersNotifications: "Offers and promotions",
      language: "Language",
      
      // Notifications
      profileUpdated: "Profile updated successfully",
      passwordChanged: "Password changed successfully",
      addressAdded: "Address added",
      addressDeleted: "Address deleted",
      error: "An error occurred",
      
      // Products
      addToCart: "Add to cart",
      buyNow: "Buy now",
      outOfStock: "Out of stock",
      inStock: "In stock",
      price: "Price",
      description: "Description",
      specifications: "Specifications",
      
      // Cart
      cartEmpty: "Your cart is empty",
      subtotal: "Subtotal",
      shipping: "Shipping",
      freeShipping: "Free shipping",
      proceedToCheckout: "Proceed to checkout",
      
      // General
      welcome: "Welcome",
      loading: "Loading...",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      apply: "Apply",
      clear: "Clear",
      close: "Close",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
    },
  },
};

// Inicializar i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("language") || "es", // Idioma por defecto
    fallbackLng: "es",
    interpolation: {
      escapeValue: false, // React ya protege contra XSS
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
