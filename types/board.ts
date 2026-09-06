export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
}

export interface BoardsResponse {
  success: boolean;
  message: string;
  data: Board[];
}

export interface BoardResponse {
  success: boolean;
  message: string;
  data: Board;
}