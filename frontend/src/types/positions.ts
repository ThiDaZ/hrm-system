export interface Department {
    id: number;
    name: string;
}

export interface Position {
    id: number;
    title: string;
    description: string | null;
    department_id: number;
    is_active: boolean;
}
