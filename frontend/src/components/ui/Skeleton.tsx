import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Componente base para estados de carga.
 * Utiliza una animación shimmer sutil alineada con la estética industrial del proyecto.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-background-elevated rounded-md ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--border-subtle) 50%, var(--bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite linear'
      }}
    />
  );
};

// Añadimos la keyframe directamente si no queremos tocar el index.css globalmente todavía,
// pero lo ideal es tenerla en el archivo de estilos. Por ahora, usamos el pulse estándar de Tailwind.
export const SkeletonPulse: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-background-elevated rounded-md ${className}`} />
);
