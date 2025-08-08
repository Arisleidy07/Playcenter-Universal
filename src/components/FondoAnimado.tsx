'use client';
import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function FondoAnimado() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent', // para que no tape nada
      }}
    >
      <ShaderGradientCanvas
        style={{ width: '100%', height: '100%' }}
        pixelDensity={1}
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          type="sphere"
          shader="defaults"
          color1="#3b82f6"   // azul
          color2="#8b5cf6"   // morado
          color3="#22d3ee"   // cyan
          lightType="env"
          envPreset="city"
          brightness={0.8}
          grain="on"
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
