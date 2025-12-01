import React from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

export default function ProfileSidebar({
  activeView,
  setView,
  onLogout,
  userInfo,
}) {
  const menuItems = [
    { id: "perfil", label: "Mi Cuenta", icon: User },
    { id: "pedidos", label: "Mis Pedidos", icon: ShoppingBag },
    { id: "ubicaciones", label: "Direcciones", icon: MapPin },
    { id: "pagos", label: "Billetera", icon: CreditCard },
    {
      id: "tiendas",
      label:
        userInfo?.isAdmin === true ||
        userInfo?.admin === true ||
        userInfo?.role === "admin" ||
        userInfo?.role === "seller" ||
        userInfo?.isSeller === true
          ? "Mi Tienda"
          : "Vender",
      icon: Store,
    },
    { id: "configuracion", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className="py-2">
      <nav className="flex flex-col space-y-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
        <div className="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-2" />
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </nav>
    </div>
  );
}
