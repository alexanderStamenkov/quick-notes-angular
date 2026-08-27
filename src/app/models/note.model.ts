export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateNote {
  title: string;
  content: string;
}
