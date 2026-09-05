// =====================================================
// TASK TYPES
// =====================================================

import type {
  TaskAssignee,
  TaskPriority,
  TaskStatus,
} from "./task";

// =====================================================
// ASSIGNEE
// =====================================================

export interface Assignee {
  id: string;
  name: string;
  email: string;
}

// =====================================================
// COLUMN TASK
// =====================================================

export interface ColumnTask {
  id: string;

  title: string;

  description?: string | null;

  priority: TaskPriority;

  status: TaskStatus;

  position: number;

  columnId: string;

  assigneeId?: string | null;

  createdAt: string;

  updatedAt: string;

  assignee?: TaskAssignee | null;
}

// =====================================================
// COLUMN
// =====================================================

export interface Column {
  id: string;

  name: string;

  boardId: string;

  position: number;

  createdAt: string;

  updatedAt: string;

  tasks: ColumnTask[];
}

// =====================================================
// CREATE COLUMN
// =====================================================

export interface CreateColumnRequest {
  boardId: string;

  name: string;
}

// =====================================================
// UPDATE COLUMN
// =====================================================

export interface UpdateColumnRequest {
  name: string;
}

// =====================================================
// REORDER COLUMN
// =====================================================

export interface ReorderColumnRequest {
  position: number;
}

// =====================================================
// COLUMNS RESPONSE
// =====================================================

export interface ColumnsResponse {
  success: boolean;

  message: string;

  data: Column[];
}

// =====================================================
// COLUMN RESPONSE
// =====================================================

export interface ColumnResponse {
  success: boolean;

  message: string;

  data: Column;
}

// =====================================================
// DELETE COLUMN RESPONSE
// =====================================================

export interface DeleteColumnResponse {
  success: boolean;

  message: string;

  data: {
    id: string;
  };
}

// =====================================================
// REORDER COLUMNS RESPONSE
// =====================================================

export interface ReorderColumnsResponse {
  success: boolean;

  message: string;

  data: Column[];
}