import { AppError } from '../app/errors.js';
import { ProjectRepository } from '../repositories/project-repository.js';
import {
  TaskRepository,
  type TaskRecord,
} from '../repositories/task-repository.js';

const priorities = ['baja', 'media', 'alta'] as const;
const statuses = ['pendiente', 'en_progreso', 'completada'] as const;

export interface TaskInput {
  title: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
  assignee?: unknown;
  dueDate?: unknown;
}

function validateText(value: unknown, field: string, maxLength: number): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== 'string' || [...value].length > maxLength) {
    throw new AppError(400, `${field} no puede superar ${maxLength} caracteres`);
  }
  return value;
}

function validateTitle(value: unknown): string {
  if (typeof value !== 'string') {
    throw new AppError(400, 'El título de la tarea es obligatorio');
  }
  const title = value.trim();
  if ([...title].length < 3 || [...title].length > 100) {
    throw new AppError(400, 'El título debe tener entre 3 y 100 caracteres');
  }
  return title;
}

function validatePriority(value: unknown): TaskRecord['priority'] {
  const priority = value ?? 'media';
  if (!priorities.includes(priority as TaskRecord['priority'])) {
    throw new AppError(400, 'La prioridad de la tarea no es válida');
  }
  return priority as TaskRecord['priority'];
}

function validateStatus(value: unknown): TaskRecord['status'] {
  const status = value ?? 'pendiente';
  if (!statuses.includes(status as TaskRecord['status'])) {
    throw new AppError(400, 'El estado de la tarea no es válido');
  }
  return status as TaskRecord['status'];
}

function currentEcuadorDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guayaquil',
  }).format(new Date());
}

function validateDueDate(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError(400, 'La fecha límite debe tener formato YYYY-MM-DD');
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new AppError(400, 'La fecha límite no es válida');
  }
  if (value < currentEcuadorDate()) {
    throw new AppError(400, 'La fecha límite no puede ser anterior a hoy');
  }
  return value;
}

export class TaskService {
  public constructor(
    private readonly repository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  public list(projectId: number): TaskRecord[] {
    this.ensureProject(projectId);
    return this.repository.findByProjectId(projectId);
  }

  public get(id: number): TaskRecord {
    const task = this.repository.findById(id);
    if (!task) {
      throw new AppError(404, 'Tarea no encontrada');
    }
    return task;
  }

  public create(projectId: number, input: TaskInput): TaskRecord {
    this.ensureProject(projectId);
    const task = this.validateInput(input);
    return this.repository.create({
      projectId,
      ...task,
      status: validateStatus(input.status),
      createdAt: new Date().toISOString(),
    });
  }

  public update(id: number, input: TaskInput): TaskRecord {
    const current = this.get(id);
    const task = this.validateInput(input, current);
    const updated = this.repository.update(id, task);
    if (!updated) {
      throw new AppError(404, 'Tarea no encontrada');
    }
    return updated;
  }

  public remove(id: number, confirmationName: unknown): void {
    const task = this.get(id);
    if (confirmationName !== task.title) {
      throw new AppError(
        400,
        'Debes escribir el título exacto de la tarea para eliminarla',
      );
    }
    if (!this.repository.delete(id)) {
      throw new AppError(404, 'Tarea no encontrada');
    }
  }

  public updateStatus(id: number, status: unknown): TaskRecord {
    const validStatus = validateStatus(status);
    this.get(id);
    return this.repository.updateStatus(id, validStatus) as TaskRecord;
  }

  private validateInput(
    input: TaskInput,
    current?: TaskRecord,
  ) {
    const dueDate =
      input.dueDate === undefined && current
        ? current.due_date
        : validateDueDate(input.dueDate);
    return {
      title: validateTitle(input.title === undefined ? current?.title : input.title),
      description: validateText(
        input.description === undefined ? current?.description : input.description,
        'La descripción',
        500,
      ),
      priority: validatePriority(input.priority === undefined ? current?.priority : input.priority),
      assignee: validateText(
        input.assignee === undefined ? current?.assignee : input.assignee,
        'El responsable',
        255,
      ),
      dueDate,
    };
  }

  private ensureProject(projectId: number): void {
    if (!this.projectRepository.findById(projectId)) {
      throw new AppError(404, 'Proyecto no encontrado');
    }
  }
}
