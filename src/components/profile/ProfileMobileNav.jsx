import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Settings,
  Store,
  Clock,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileMobileNav({ activeView, setView, userInfo }) {
  const storeLabel =
    userInfo?.isAdmin === true ||
    userInfo?.admin === true ||
    userInfo?.role === "admin" ||
    userInfo?.role === "seller" ||
    userInfo?.isSeller === true
      ? "Mi Tienda"
      : "Vender";
  const items = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
    { id: "ubicaciones", label: "Direcciones", icon: MapPin },
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "tiendas", label: storeLabel, icon: Store },
    { id: "seguridad", label: "Seguridad", icon: Shield },
    { id: "configuracion", label: "Ajustes", icon: Settings },
  ];

  const scrollRef = useRef(null);
  const indicatorContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeView];
    const container = indicatorContainerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();
      setIndicator({
        left: elRect.left - parentRect.left,
        width: elRect.width,
      });
    }
  }, [activeView]);

  useEffect(() => {
    const onScroll = () => {
      const el = tabRefs.current[activeView];
      const container = indicatorContainerRef.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const parentRect = container.getBoundingClientRect();
        setIndicator({
          left: elRect.left - parentRect.left,
          width: elRect.width,
        });
      }
    };
    const scroller = scrollRef.current;
    if (scroller)
      scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller && scroller.removeEventListener("scroll", onScroll);
  }, [activeView]);

  return (
    <div className="z-30" role="tablist" aria-label="Navegación de perfil">
      <div className="overflow-x-auto scrollbar-hide" ref={scrollRef}>
        <div
          className="relative flex gap-2 min-w-max px-2 py-2 mx-2"
          ref={indicatorContainerRef}
        >
          <motion.div
            layout
            className="hidden"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setView(item.id)}
                role="tab"
                aria-selected={active}
                ref={(r) => (tabRefs.current[item.id] = r)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[76px] border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  active
                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                whileTap={{ scale: 0.96 }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
