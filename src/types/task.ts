
export interface TUser {
  id: number;
  email?: string;
  name: string;
  avatar?: string;
  domain: string;
}

export interface TTaskNote {
    id: number;
    content: string;
    user_id: number;
    domain: string;
    month: number;
    year: number;
}

export interface TBoardColumn{
    id: number;
    name: string;
    color: string;
}

export interface TTask{
    id: number;
    user_id: number;
    domain: string;
    title: string;
    description: string;
    boardColumn: {
        id: number;
        name: string;
        color: string;
    };
    due_date: Date | null;
    time: string | null;
    assignee: {
        id: number;
        name: string;
        avatar: string | null;
    };
    task_collaborators: {
        id: number;
        domain: string;
        user_id: number;
    }[];
    task_status_collaborators: {
        user_id: number;
        domain: string;
        status: string;
    }[];
}

export interface TCollaborator{
    id: number;
    user_id: number;
    task_id: number;
}

export interface TStatusCollaborator{
    id: number;
    user_id: number;
    task_id: number;
    status: string;
}