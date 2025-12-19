import React, { useMemo } from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Store,
  Key,
  ChevronRight,
} from "lucide-react";

export default function ProfileSidebar({
  activeView,
  setView,
  onLogout,
  userInfo,
}) {
  const menuItems = useMemo(
    () => [
      {
        id: "perfil",
        title: "Información Personal",
        description: "Editar nombre, celular y correo electrónico",
        icon: User,
      },
      {
        id: "pedidos",
        title: "Mis Pedidos",
        description: "Rastrear envíos, devoluciones y compras pasadas",
        icon: ShoppingBag,
      },
      {
        id: "ubicaciones",
        title: "Direcciones",
        description: "Preferencias de envío y lugares de entrega",
        icon: MapPin,
      },
      {
        id: "pagos",
        title: "Pagos y Billetera",
        description: "Gestionar tarjetas, saldos y cupones",
        icon: CreditCard,
      },
      {
        id: "seguridad",
        title: "Inicio de Sesión y Seguridad",
        description: "Cambiar contraseña y proteger la cuenta",
        icon: Key,
      },
      {
        id: "tiendas",
        title:
          userInfo?.isAdmin === true ||
          userInfo?.admin === true ||
          userInfo?.role === "admin" ||
          userInfo?.role === "seller" ||
          userInfo?.isSeller === true
            ? "Mi Tienda"
            : "Mi Tienda",
        description: "Panel de vendedor y estadísticas",
        icon: Store,
      },
      {
        id: "configuracion",
        title: "Ajustes",
        description: "Configuración general de la app",
        icon: Settings,
      },
    ],
    [userInfo]
  );

  return (
    <>
      <style>{`
        .psb-shell {
          --psb-bg: #f4f7f6;
          --psb-card-bg: #ffffff;
          --psb-card-border: #e5e7eb;
          --psb-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          --psb-title: #111827;
          --psb-desc: #6b7280;
          --psb-icon: #4b5563;
          --psb-arrow: #9ca3af;
          --psb-active-border: #2563eb;
          --psb-active-glow: rgba(37, 99, 235, 0.15);
          --psb-logout-bg: #fef2f2;
          --psb-logout-border: #fecaca;
          --psb-logout-icon: #dc2626;
        }

        .dark .psb-shell {
          --psb-bg: #121212;
          --psb-card-bg: #1e1e1e;
          --psb-card-border: #333333;
          --psb-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          --psb-title: #e0e0e0;
          --psb-desc: #a0a0a0;
          --psb-icon: #e0e0e0;
          --psb-arrow: #9ca3af;
          --psb-active-border: #3b82f6;
          --psb-active-glow: rgba(59, 130, 246, 0.2);
          --psb-logout-bg: rgba(220, 38, 38, 0.1);
          --psb-logout-border: rgba(220, 38, 38, 0.3);
          --psb-logout-icon: #f87171;
        }

        .psb-shell {
          background: var(--psb-bg);
          width: 100%;
        }

        .psb-menu {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 14px;
          padding: 16px;
        }

        .psb-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: var(--psb-card-bg);
          border: 1px solid var(--psb-card-border);
          border-radius: 12px;
          box-shadow: var(--psb-card-shadow);
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          min-height: 88px;
          text-align: left;
        }

        .psb-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          border-color: #d1d5db;
          transform: translateY(-1px);
        }

        .psb-card:active {
          transform: translateY(0);
        }

        .psb-card.psb-active {
          border-color: var(--psb-active-border);
          box-shadow: 0 0 0 2px var(--psb-active-glow);
        }

        .psb-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .dark .psb-icon-wrapper {
          background: #2c2c2c;
          border: 1px solid #3a3a3a;
        }

        .psb-icon {
          color: var(--psb-icon);
        }

        .psb-card.psb-active .psb-icon-wrapper {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }

        .dark .psb-card.psb-active .psb-icon-wrapper {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid #3b82f6;
        }

        .psb-content {
          flex: 1;
          min-width: 0;
        }

        .psb-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--psb-title);
          margin: 0 0 2px 0;
          line-height: 1.3;
        }

        .psb-description {
          font-size: 13px;
          color: var(--psb-desc);
          margin: 0;
          line-height: 1.4;
        }

        .psb-arrow {
          color: var(--psb-arrow);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .psb-card:hover .psb-arrow {
          transform: translateX(3px);
          color: #6b7280;
        }

        .dark .psb-card:hover .psb-arrow {
          color: #cbd5e1;
        }

        .psb-logout-card {
          margin-top: 8px;
          border-color: var(--psb-logout-border);
          background: var(--psb-logout-bg);
        }

        .psb-logout-card .psb-icon-wrapper {
          background: var(--psb-logout-bg);
          border: 1px solid var(--psb-logout-border);
        }

        .psb-logout-card .psb-icon {
          color: var(--psb-logout-icon);
        }

        .psb-logout-card .psb-title {
          color: var(--psb-logout-icon);
        }

        .psb-logout-card .psb-description {
          color: var(--psb-logout-icon);
          opacity: 0.9;
        }

        .psb-logout-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
        }

        @media (max-width: 768px) {
          .psb-menu {
            max-width: none;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            padding: 12px;
            gap: 10px;
          }

          .psb-card {
            padding: 14px 16px;
            min-height: 70px;
          }

          .psb-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .psb-title {
            font-size: 14px;
          }

          .psb-description {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="psb-shell">
        <nav className="psb-menu">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`psb-card ${isActive ? "psb-active" : ""}`}
              >
                <div className="psb-icon-wrapper">
                  <Icon size={22} className="psb-icon" />
                </div>
                <div className="psb-content">
                  <p className="psb-title">{item.title}</p>
                  <p className="psb-description">{item.description}</p>
                </div>
                <ChevronRight size={20} className="psb-arrow" />
              </button>
            );
          })}

          <button onClick={onLogout} className="psb-card psb-logout-card">
            <div className="psb-icon-wrapper">
              <LogOut size={22} className="psb-icon" />
            </div>
            <div className="psb-content">
              <p className="psb-title">Cerrar Sesión</p>
              <p className="psb-description">Salir de tu cuenta</p>
            </div>
            <ChevronRight size={20} className="psb-arrow" />
          </button>
        </nav>
      </div>
    </>
  );
}
