export interface MemeEntity {
    id: string;
    description: string;
    keywords?: string[];
    user_id?: string;
    file?: string;
    type?: string;
    width?: number;
    height?: number;
    created_at?: Date;
    updated_at?: Date;
}
