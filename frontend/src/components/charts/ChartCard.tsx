import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Contenedor elevado para gráficas.
 * Aplica sombras sutiles, bordes definidos y transiciones de elevación.
 */
export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`bg-background-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col ${className}`}>
      <div className="mb-6">
        <h3 className="text-heading font-semibold text-text-primary tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-caption text-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 w-full min-h-[250px]">
        {children}
      </div>
    </div>
  );
};
