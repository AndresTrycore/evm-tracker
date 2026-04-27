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

export interface EVMSummary extends EVMIndicators {
  cost_status: 'bajo presupuesto' | 'en presupuesto' | 'sobre presupuesto' | 'sin datos';
  schedule_status: 'adelantado' | 'en cronograma' | 'atrasado' | 'sin datos';
}

// --- Project Interfaces ---

export interface Project {
  activities: any;
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
  created_at: string;
  updated_at: string;
  evm: EVMIndicators;
}

export type ActivityCreate = Omit<Activity, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'evm'>;
export type ActivityUpdate = Partial<ActivityCreate>;

// --- API Error Interface ---

export interface ApiError {
  message: string;
  status?: number;
  originalError: any;
}
