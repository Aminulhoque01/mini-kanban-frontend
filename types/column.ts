export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateColumnRequest {
  boardId: string;
  name: string;
}

export interface UpdateColumnRequest {
  name: string;
}

export interface ReorderColumnRequest {
  order: number;
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