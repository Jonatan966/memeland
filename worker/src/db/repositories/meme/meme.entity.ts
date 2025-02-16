export interface MemeEntity {
	id: string;
	description: string;
	keywords?: string[];
	account_id?: string;
	frequency?: number;
	file?: string;
	type?: string;
	width?: number;
	height?: number;
	created_at?: Date;
	updated_at?: Date;
}
