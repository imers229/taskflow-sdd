export type Priority = 'baja' | 'media' | 'alta';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';

export interface Project {
  id: number;
  name: string;
  normalized_name: string;
  description: string | null;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ProjectInput {
  name: string;
  description: string | null;
}

export interface TaskInput {
  title: string;
  description: string | null;
  priority: Priority;
  status?: TaskStatus;
  assignee: string | null;
  dueDate: string | null;
}

export interface TaskFilters {
  status: TaskStatus | '';
  priority: Priority | '';
  assignee: string;
  q: string;
  order: 'created_desc' | 'created_asc' | 'title' | 'priority';
}

export interface ProjectSummary {
  total: number;
  pendiente: number;
  en_progreso: number;
  completada: number;
  vencidas: number;
  completedPercentage: number;
}
