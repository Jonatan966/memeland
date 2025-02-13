import { D1Database } from '@cloudflare/workers-types';
import { MemeEntity } from './meme.entity';

interface FindManyOpt {
	user_id: string;
	take: number;
	offset: number;
}

interface IncrementFrequencyOpt {
	user_id: string;
	meme_id: string;
}

export function makeMemeRepository(db: D1Database) {
	return {
		async count(user_id: string): Promise<number> {
			const result = await db.prepare('SELECT COUNT(*) total_memes FROM meme WHERE user_id = ?').bind(user_id).run();
			const count = result.results[0].total_memes as number;

			return count;
		},
		async findMany({ user_id, take, offset }: FindManyOpt): Promise<MemeEntity[]> {
			const result = await db.prepare('SELECT * FROM meme WHERE user_id = ? LIMIT ? OFFSET ?').bind(user_id, take, offset).run();

			const memes = result.results.map((meme) => ({ ...meme, keywords: JSON.parse(meme.keywords as string) })) as MemeEntity[];

			return memes;
		},
		async create(meme: Omit<MemeEntity, 'created_at' | 'updated_at'>): Promise<any> {
			const result = await db
				.prepare('INSERT INTO meme(id, description, keywords, user_id, file, type, width, height) VALUES(?, ?, ?, ?, ?, ?, ?, ?)')
				.bind(meme.id, meme.description, JSON.stringify(meme.keywords), meme.user_id, meme.file, meme.type, meme.width, meme.height)
				.run();

			return result;
		},
		async incrementFrequency({ meme_id, user_id }: IncrementFrequencyOpt): Promise<boolean> {
			const result = await db
				.prepare('UPDATE meme SET frequency = frequency + 1 WHERE id = ? AND user_id = ?')
				.bind(meme_id, user_id)
				.run();

			return result.success;
		},
	};
}
