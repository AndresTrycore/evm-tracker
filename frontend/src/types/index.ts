// --- EVM Indicators & Summary ---

export interface EVMIndicators {
  planned_value: number;
  earned_value: number;
  cost_variance: number;
  schedule_variance: number;
  cost_performance_index: number | null;
  schedule_performance_index: number | null;
  estimate_at_completion: number | null;
  variance_at_completion: number | null;
}

export type CostStatus = 'bajo presupuesto' | 'en presupuesto' | 'sobre presupuesto' | 'sin datos';
export type ScheduleStatus = 'adelantado' | 'en cronograma' | 'atrasado' | 'sin datos';

export interface EVMSummary extends EVMIndicators {
  budget_at_completion: number;
  cost_status: CostStatus;
  schedule_status: ScheduleStatus;
}

// --- Project Interfaces ---

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithEVM extends Project {
  activities: Activity[];
  evm_summary: EVMSummary;
}

export type ProjectCreate = Pick<Project, 'name' | 'description'>;
export type ProjectUpdate = Partial<ProjectCreate>;

// --- Activity Interfaces ---

export interface Activity {
  id: string;
  project_id: string;
  name: string;
  budget_at_completion: number;
  planned_progress: number;
  actual_progress: number;
  actual_cost: number;
  // Computed fields returned by API
  planned_value: number;
  earned_value: number;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  evm: EVMIndicators;
}

/** Alias for Activity — used in components that deal with API responses */
export type ActivityResponse = Activity;

export type ActivityCreate = Omit<Activity, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'evm' | 'planned_value' | 'earned_value' | 'end_date'>;
export type ActivityUpdate = Partial<ActivityCreate>;

// --- API Error Interface ---

export interface ApiError {
  message: string;
  status?: number;
  originalError: any;
}
