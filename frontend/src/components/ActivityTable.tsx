import React, { useState, useMemo } from 'react';
import { ActivityResponse } from '../types';
import { SkeletonPulse } from './ui/Skeleton';
import { 
  Search, SearchX, Pencil, Trash2, 
  ChevronUp, ChevronDown, ChevronsUpDown, PackageOpen 
} from 'lucide-react';

interface ActivityTableProps {
  activities: ActivityResponse[];
  isLoading?: boolean;
  onEdit: (activity: ActivityResponse | null) => void;
  onDelete: (activity: ActivityResponse) => void;
}

type SortColumn = 'name' | 'actual_progress' | 'budget_at_completion' | 'actual_cost' | 'cpi' | 'spi';

/**
 * Tabla interactiva de actividades con progreso dual y métricas EVM.
 */
export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  isLoading = false,
  onEdit,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrado
  const filtered = useMemo(() => {
    return activities.filter(a => 
      a.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }, [activities, searchQuery]);

  // Ordenamiento
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any, valB: any;

      if (sortColumn === 'cpi') {
        valA = a.evm.cost_performance_index;
        valB = b.evm.cost_performance_index;
      } else if (sortColumn === 'spi') {
        valA = a.evm.schedule_performance_index;
        valB = b.evm.schedule_performance_index;
      } else {
        valA = a[sortColumn];
        valB = b[sortColumn];
      }

      // Nulls siempre al final
      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (sortColumn === 'name') {
        const compare = String(valA).localeCompare(String(valB));
        return sortDirection === 'asc' ? compare : -compare;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filtered, sortColumn, sortDirection]);

  // Manejador de click en cabeceras
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // Formateadores
  const formatCurrency = (val: number | null) => {
    if (val === null) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatIndex = (val: number | null) => {
    if (val === null) return '—';
    return val.toFixed(2);
  };

  // Determinar color de la barra de progreso
  const getProgressColor = (actual: number, planned: number) => {
    if (actual >= planned) return 'bg-health-green';
    if (actual >= planned * 0.85) return 'bg-health-yellow';
    if (actual >= planned * 0.70) return 'bg-health-orange';
    return 'bg-health-red';
  };

  const getIndexColor = (val: number | null) => {
    if (val === null) return 'text-text-disabled';
    if (val >= 1.0) return 'text-health-green';
    if (val >= 0.85) return 'text-health-yellow';
    if (val >= 0.70) return 'text-health-orange';
    return 'text-health-red';
  };

  // Render cabecera ordenable
  const SortHeader = ({ col, label, width, align = 'left' }: { col: SortColumn, label: string, width?: string, align?: 'left' | 'right' | 'center' }) => (
    <th 
      className={`px-4 py-3 text-label text-text-secondary cursor-pointer hover:bg-background-elevated transition-colors ${width || ''} text-${align}`}
      onClick={() => handleSort(col)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
        <span>{label}</span>
        {sortColumn === col ? (
          sortDirection === 'asc' ? <ChevronUp size={14} className="text-text-primary" /> : <ChevronDown size={14} className="text-text-primary" />
        ) : (
          <ChevronsUpDown size={14} className="text-text-disabled" />
        )}
      </div>
    </th>
  );

  // Estados vacíos
  if (!isLoading && activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-background-base rounded-xl border border-dashed border-border">
        <PackageOpen size={40} className="text-text-disabled mb-4" />
        <p className="text-body text-text-secondary mb-6">Este proyecto no tiene actividades aún.</p>
        <button 
          onClick={() => onEdit(null)}
          className="bg-accent text-white px-4 py-2 rounded-md font-medium hover:bg-accent/90 transition-colors"
        >
          Agregar primera actividad
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
        <input 
          type="search"
          placeholder="Buscar actividad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background-elevated border border-border rounded-md pl-10 pr-4 py-2 text-body focus:outline-none focus:border-accent"
        />
      </div>

      {/* Contenedor de la tabla */}
      <div className="w-full overflow-x-auto bg-background-surface border border-border rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="border-b border-border bg-background-base/50">
            <tr>
              <SortHeader col="name" label="ACTIVIDAD" width="min-w-[200px]" />
              <SortHeader col="actual_progress" label="PROGRESO" width="w-[180px]" />
              <SortHeader col="cpi" label="CPI" width="w-[80px]" align="center" />
              <SortHeader col="spi" label="SPI" width="w-[80px]" align="center" />
              <SortHeader col="budget_at_completion" label="BAC" width="w-[120px]" align="right" />
              <SortHeader col="actual_cost" label="AC" width="w-[120px]" align="right" />
              <th className="w-[80px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><SkeletonPulse className="h-4 w-3/4" /></td>
                  <td className="px-4 py-3"><SkeletonPulse className="h-6 w-full rounded-full" /></td>
                  <td className="px-4 py-3"><SkeletonPulse className="h-4 w-12 mx-auto" /></td>
                  <td className="px-4 py-3"><SkeletonPulse className="h-4 w-12 mx-auto" /></td>
                  <td className="px-4 py-3"><SkeletonPulse className="h-4 w-16 ml-auto" /></td>
                  <td className="px-4 py-3"><SkeletonPulse className="h-4 w-16 ml-auto" /></td>
                  <td className="px-4 py-3"></td>
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-disabled">
                  <div className="flex flex-col items-center gap-2">
                    <SearchX size={24} />
                    <span>Ninguna actividad coincide con «{searchQuery}».</span>
                    <button onClick={() => setSearchQuery('')} className="text-accent hover:underline mt-2">Limpiar búsqueda</button>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map(act => {
                const vacColor = act.evm.variance_at_completion && act.evm.variance_at_completion < 0 
                  ? 'text-health-red' 
                  : act.evm.variance_at_completion && act.evm.variance_at_completion > 0 
                    ? 'text-health-green' 
                    : 'text-text-primary';

                return (
                  <tr key={act.id} className="group hover:bg-background-elevated transition-colors relative">
                    <td className="px-4 py-3 text-body truncate max-w-[200px]" title={act.name}>
                      {act.name}
                      
                      {/* Tooltip de fila */}
                      <div className="hidden group-hover:block absolute bottom-full left-4 mb-2 z-10 w-64 bg-background-elevated border border-border rounded-md p-3 shadow-xl backdrop-blur-md">
                        <div className="text-body font-semibold mb-2 truncate">{act.name}</div>
                        <div className="space-y-1 text-caption">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">EAC</span>
                            <span className="font-mono">{formatCurrency(act.evm.estimate_at_completion)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">VAC</span>
                            <span className={`font-mono ${vacColor}`}>{formatCurrency(act.evm.variance_at_completion)}</span>
                          </div>
                          <div className="my-1 border-t border-border-subtle" />
                          <div className="flex justify-between">
                            <span className="text-text-secondary">PV</span>
                            <span className="font-mono">{formatCurrency(act.planned_value)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">EV</span>
                            <span className="font-mono">{formatCurrency(act.earned_value)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="relative h-6 w-full">
                        <div className="absolute top-1 w-full h-1.5 rounded-full bg-background-elevated overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-text-disabled" style={{ width: `${act.planned_progress}%` }} />
                        </div>
                        <div 
                          className={`absolute top-1 left-0 h-1.5 rounded-full ${getProgressColor(act.actual_progress, act.planned_progress)} shadow-sm z-10`} 
                          style={{ width: `${act.actual_progress}%` }} 
                        />
                        <div className="absolute top-3 w-full text-center text-[10px] text-text-secondary mt-1">
                          {act.actual_progress.toFixed(1)}% / {act.planned_progress.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    
                    <td className={`px-4 py-3 text-center text-kpi-sm font-mono ${getIndexColor(act.evm.cost_performance_index)}`}>
                      {formatIndex(act.evm.cost_performance_index)}
                    </td>
                    <td className={`px-4 py-3 text-center text-kpi-sm font-mono ${getIndexColor(act.evm.schedule_performance_index)}`}>
                      {formatIndex(act.evm.schedule_performance_index)}
                    </td>
                    <td className="px-4 py-3 text-right text-kpi-sm font-mono">
                      {formatCurrency(act.budget_at_completion)}
                    </td>
                    <td className="px-4 py-3 text-right text-kpi-sm font-mono">
                      {formatCurrency(act.actual_cost)}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button 
                          onClick={() => onEdit(act)}
                          className="p-1.5 text-text-secondary hover:bg-background-base rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(act)}
                          className="p-1.5 text-text-secondary hover:text-health-red hover:bg-health-red/10 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
