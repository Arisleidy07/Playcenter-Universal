'use client';
import { cn } from '../../lib/utils';
import { createRef, ReactNode, useRef, useEffect, useState } from 'react';

interface ImageMouseTrailProps {
  items: string[];
  children?: ReactNode;
  className?: string;
  imgClass?: string;
  distance?: number;
  maxNumberOfImages?: number;
  fadeAnimation?: boolean;
}

type Pointer = { clientX: number; clientY: number };

export default function ImageMouseTrail({
  items,
  children,
  className,
  maxNumberOfImages = 5,
  imgClass = 'w-40 h-48',
  distance = 20,
  fadeAnimation = false,
}: ImageMouseTrailProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  // refs se inicializan y actualizan cuando items cambia
  const [refs, setRefs] = useState(() => items.map(() => createRef<HTMLImageElement>()));
  
  useEffect(() => {
    setRefs(items.map(() => createRef<HTMLImageElement>()));
  }, [items]);

  const currentZIndexRef = useRef(1);
  const globalIndex = useRef(0);
  const last = useRef({ x: 0, y: 0 });

  const activate = (image: HTMLImageElement, x: number, y: number) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const relativeX = x - containerRect.left;
    const relativeY = y - containerRect.top;
    image.style.left = `${relativeX}px`;
    image.style.top = `${relativeY}px`;

    if (currentZIndexRef.current > 40) {
      currentZIndexRef.current = 1;
    }
    image.style.zIndex = String(currentZIndexRef.current);
    currentZIndexRef.current++;

    image.dataset.status = 'active';
    if (fadeAnimation) {
      setTimeout(() => {
        image.dataset.status = 'inactive';
      }, 1500);
    }
    last.current = { x, y };
  };

  const distanceFromLast = (x: number, y: number) => {
    return Math.hypot(x - last.current.x, y - last.current.y);
  };

  const deactivate = (image: HTMLImageElement) => {
    image.dataset.status = 'inactive';
  };

  const handleOnMove = (e: Pointer) => {
    if (distanceFromLast(e.clientX, e.clientY) > distance) {
      // Protección por si refs no están listos o vacíos
      if (refs.length === 0) return;

      const lead = refs[globalIndex.current % refs.length]?.current;
      const tail = refs[(globalIndex.current - maxNumberOfImages + refs.length) % refs.length]?.current;

      if (lead) activate(lead, e.clientX, e.clientY);
      if (tail) deactivate(tail);
      globalIndex.current++;
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleOnMove(e);
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [refs]);

  return (
    <section
      onTouchMove={(e) => handleOnMove(e.touches[0])}
      ref={containerRef}
      className={cn(
        'grid place-content-center w-full h-[500px] bg-gradient-to-br from-indigo-50 via-white to-blue-100 relative overflow-hidden rounded-lg',
        className
      )}
    >
      {items.map((item, index) => (
        <img
          key={index}
          className={cn(
            "object-cover scale-0 opacity-0 data-[status='active']:scale-100 data-[status='active']:opacity-100 transition-transform data-[status='active']:duration-500 duration-300 data-[status='active']:ease-out-expo absolute -translate-y-[50%] -translate-x-[50%]",
            imgClass
          )}
          data-index={index}
          data-status="inactive"
          src={item}
          alt={`image-${index}`}
          ref={refs[index]}
          draggable={false}
        />
      ))}
      {children}
    </section>
  );
}
