export interface Assignee {
  id: string;
  name: string;
  email: string;
}

export interface ColumnTask {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  columnId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Assignee | null;
}

export interface Column {
  id: string;
  name: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks: ColumnTask[];
}

export interface CreateColumnRequest {
  boardId: string;
  name: string;
}

export interface UpdateColumnRequest {
  name: string;
}

export interface ReorderColumnRequest {
  position: number;
}

export interface ColumnsResponse {
  success: boolean;
  message: string;
  data: Column[];
}

export interface ColumnResponse {
  success: boolean;
  message: string;
  data: Column;
}

export interface DeleteColumnResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

export interface ReorderColumnsResponse {
  success: boolean;
  message: string;
  data: Column[];
}