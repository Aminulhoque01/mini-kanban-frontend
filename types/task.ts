export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

// =====================================================
// ASSIGNEE
// =====================================================

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

// =====================================================
// TASK
// =====================================================

export interface Task {
  id: string;

  title: string;

  description?: string | null;

  priority: TaskPriority;

  status: TaskStatus;

  position: number;

  boardId: string;

  columnId: string;

  assigneeId?: string | null;

  createdAt: string;

  updatedAt: string;

  assignee?: TaskAssignee | null;
}

// =====================================================
// CREATE TASK
// =====================================================

export interface CreateTaskRequest {
  boardId: string;

  columnId: string;

  title: string;

  description?: string;

  priority?: TaskPriority;

  assigneeId?: string;
}

// =====================================================
// UPDATE TASK
// =====================================================

export interface UpdateTaskRequest {
  title?: string;

  description?: string;

  priority?: TaskPriority;

  status?: TaskStatus;

  assigneeId?: string | null;
}

// =====================================================
// MOVE TASK
// =====================================================

export interface MoveTaskRequest {
  columnId: string;

  position: number;
}

// =====================================================
// TASK RESPONSE
// =====================================================

export interface TaskResponse {
  success: boolean;

  message: string;

  data: Task;
}

// =====================================================
// TASKS RESPONSE
// =====================================================

export interface TasksResponse {
  success: boolean;

  message: string;

  data: Task[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}

// =====================================================
// DELETE TASK RESPONSE
// =====================================================

export interface DeleteTaskResponse {
  success: boolean;

  message: string;
}