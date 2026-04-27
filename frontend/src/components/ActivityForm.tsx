import React, { useState, useEffect } from 'react';
import { ActivityResponse } from '../types';
import { useCreateActivity } from '../hooks/useCreateActivity';
import { useUpdateActivity } from '../hooks/useUpdateActivity';
import { X, AlertTriangle } from 'lucide-react';

interface ActivityFormProps {
  projectId: string;
  activity: ActivityResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

type FormFields = {
  name: string;
  budget_at_completion: string;
  planned_progress: string;
  actual_progress: string;
  actual_cost: string;
};

const initialValuesCreate: FormFields = {
  name: '',
  budget_at_completion: '',
  planned_progress: '',
  actual_progress: '',
  actual_cost: '',
};

/**
 * Formulario de actividades con modo dual (Modal para creación, Panel para edición).
 * Implementa validación en tiempo real y manejo de errores del API.
 */
export const ActivityForm: React.FC<ActivityFormProps> = ({
  projectId,
  activity,
  isOpen,
  onClose,
}) => {
  const isEditing = !!activity;
  
  // Estado del formulario
  const [fields, setFields] = useState<FormFields>(initialValuesCreate);
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  
  // Hooks de mutación
  const createMutation = useCreateActivity(projectId);
  const updateMutation = useUpdateActivity(projectId);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const apiError = createMutation.error || updateMutation.error;

  // Reiniciar formulario cuando cambia la actividad seleccionada
  useEffect(() => {
    if (activity) {
      setFields({
        name: activity.name,
        budget_at_completion: String(activity.budget_at_completion),
        planned_progress: String(activity.planned_progress),
        actual_progress: String(activity.actual_progress),
        actual_cost: String(activity.actual_cost),
      });
    } else {
      setFields(initialValuesCreate);
    }
    setTouched({});
    createMutation.reset();
    updateMutation.reset();
  }, [activity, isOpen]);

  // Lógica de validación
  const validateField = (name: keyof FormFields, value: string): string | null => {
    if (!value.trim()) return `Este campo es obligatorio`;
    
    if (name === 'name' && value.length > 200) return 'Máximo 200 caracteres';
    
    if (name !== 'name') {
      const num = Number(value);
      if (isNaN(num)) return 'Debe ser un número válido';
      if (num < 0) return 'Debe ser mayor o igual a 0';
      if ((name === 'planned_progress' || name === 'actual_progress') && num > 100) {
        return 'Debe estar entre 0 y 100';
      }
    }
    return null;
  };

  const errors: Partial<Record<keyof FormFields, string>> = {};
  let isValid = true;
  
  (Object.keys(fields) as Array<keyof FormFields>).forEach((key) => {
    const error = validateField(key, fields[key]);
    if (error) {
      errors[key] = error;
      isValid = false;
    }
  });

  const isFormValid = isValid && Object.values(fields).every(v => String(v).trim() !== '');

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    // Limpiar error de API si el usuario empieza a editar
    if (apiError) {
      createMutation.reset();
      updateMutation.reset();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos como tocados
    const allTouched = Object.keys(fields).reduce<Partial<Record<keyof FormFields, boolean>>>(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    if (!isFormValid) return;

    const payload = {
      name: fields.name.trim(),
      budget_at_completion: Number(fields.budget_at_completion),
      planned_progress: Number(fields.planned_progress),
      actual_progress: Number(fields.actual_progress),
      actual_cost: Number(fields.actual_cost),
    };

    if (isEditing) {
      updateMutation.mutate(
        { activityId: activity!.id, data: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  // Renderizado Condicional: No renderizar si no está abierto
  if (!isOpen) return null;

  const content = (
    <>
      <div className="flex items-center justify-between p-6 border-b border-border-subtle">
        <h2 className="text-heading font-semibold text-text-primary">
          {isEditing ? 'Editar actividad' : 'Nueva actividad'}
        </h2>
        <button 
          onClick={onClose}
          disabled={isPending}
          className="text-text-secondary hover:bg-background-elevated p-1.5 rounded-md transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <form id="activity-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-label text-text-secondary mb-1">Nombre de la actividad</label>
            <input
              name="name"
              type="text"
              placeholder="Ej: Diseño de interfaz"
              value={fields.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isPending}
              className={`w-full bg-background-elevated border rounded-md px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-colors
                ${touched.name && errors.name ? 'border-health-red' : 'border-border focus:border-accent'}`}
            />
            <div className="flex justify-between mt-1">
              <span className={`text-caption transition-opacity duration-150 ${touched.name && errors.name ? 'opacity-100 text-health-red' : 'opacity-0'}`}>
                {errors.name}
              </span>
              <span className={`text-caption ${fields.name.length >= 200 ? 'text-health-red' : fields.name.length >= 180 ? 'text-health-yellow' : 'text-text-disabled'}`}>
                {fields.name.length} / 200
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Presupuesto (BAC) */}
            <div>
              <label className="block text-label text-text-secondary mb-1">Presupuesto (BAC)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled">$</span>
                <input
                  name="budget_at_completion"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={fields.budget_at_completion}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  className={`w-full bg-background-elevated border rounded-md pl-8 pr-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-colors
                    ${touched.budget_at_completion && errors.budget_at_completion ? 'border-health-red' : 'border-border focus:border-accent'}`}
                />
              </div>
              <p className={`text-caption text-health-red mt-1 transition-opacity duration-150 ${touched.budget_at_completion && errors.budget_at_completion ? 'opacity-100' : 'opacity-0'}`}>
                {errors.budget_at_completion}
              </p>
            </div>

            {/* Costo Real (AC) */}
            <div>
              <label className="block text-label text-text-secondary mb-1">Costo real (AC)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled">$</span>
                <input
                  name="actual_cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={fields.actual_cost}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  className={`w-full bg-background-elevated border rounded-md pl-8 pr-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-colors
                    ${touched.actual_cost && errors.actual_cost ? 'border-health-red' : 'border-border focus:border-accent'}`}
                />
              </div>
              <p className={`text-caption text-health-red mt-1 transition-opacity duration-150 ${touched.actual_cost && errors.actual_cost ? 'opacity-100' : 'opacity-0'}`}>
                {errors.actual_cost}
              </p>
            </div>

            {/* Avance Planificado */}
            <div>
              <label className="block text-label text-text-secondary mb-1">Avance planificado</label>
              <div className="relative">
                <input
                  name="planned_progress"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={fields.planned_progress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  className={`w-full bg-background-elevated border rounded-md pl-3 pr-8 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-colors
                    ${touched.planned_progress && errors.planned_progress ? 'border-health-red' : 'border-border focus:border-accent'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled">%</span>
              </div>
              <p className={`text-caption text-health-red mt-1 transition-opacity duration-150 ${touched.planned_progress && errors.planned_progress ? 'opacity-100' : 'opacity-0'}`}>
                {errors.planned_progress}
              </p>
            </div>

            {/* Avance Real */}
            <div>
              <label className="block text-label text-text-secondary mb-1">Avance real</label>
              <div className="relative">
                <input
                  name="actual_progress"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={fields.actual_progress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isPending}
                  className={`w-full bg-background-elevated border rounded-md pl-3 pr-8 py-2 text-body focus:outline-none focus:ring-2 focus:ring-accent-subtle transition-colors
                    ${touched.actual_progress && errors.actual_progress ? 'border-health-red' : 'border-border focus:border-accent'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled">%</span>
              </div>
              <p className={`text-caption text-health-red mt-1 transition-opacity duration-150 ${touched.actual_progress && errors.actual_progress ? 'opacity-100' : 'opacity-0'}`}>
                {errors.actual_progress}
              </p>
            </div>
          </div>
        </form>

        {/* Banner de Error API */}
        {apiError && (
          <div className="mt-6 bg-health-red/10 border border-health-red rounded-md p-4 flex gap-3 items-start">
            <AlertTriangle className="text-health-red shrink-0" size={20} />
            <p className="text-body text-text-primary">
              {(apiError as any)?.message || 'Ocurrió un error al guardar la actividad.'}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border-subtle flex items-center justify-end gap-3 bg-background-base">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 text-body font-medium text-text-secondary hover:bg-background-elevated border border-border rounded-md transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="activity-form"
          disabled={!isFormValid || isPending}
          className="px-4 py-2 text-body font-medium bg-accent text-white rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          )}
          {isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
        </button>
      </div>
    </>
  );

  // Modal para Creación
  if (!isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-background-surface rounded-lg border border-border w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {content}
        </div>
      </div>
    );
  }

  // Drawer para Edición
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-background-surface border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {content}
    </div>
  );
};
