import { D1Database } from '@cloudflare/workers-types';
import { MemeEntity } from './meme.entity';

interface FindManyOpt {
	account_id: string;
	take: number;
	offset: number;
}

interface IncrementFrequencyOpt {
	account_id: string;
	meme_id: string;
}

export function makeMemeRepository(db: D1Database) {
	return {
		async count(account_id: string): Promise<number> {
			const result = await db.prepare('SELECT COUNT(*) total_memes FROM meme WHERE account_id = ?').bind(account_id).run();
			const count = result.results[0].total_memes as number;

			return count;
		},
		async findMany({ account_id, take, offset }: FindManyOpt): Promise<MemeEntity[]> {
			const result = await db.prepare('SELECT * FROM meme WHERE account_id = ? LIMIT ? OFFSET ?').bind(account_id, take, offset).run();

			const memes = result.results.map((meme) => ({ ...meme, keywords: JSON.parse(meme.keywords as string) })) as MemeEntity[];

			return memes;
		},
		async create(meme: Omit<MemeEntity, 'created_at' | 'updated_at'>): Promise<any> {
			const result = await db
				.prepare('INSERT INTO meme(id, description, keywords, account_id, file, type, width, height) VALUES(?, ?, ?, ?, ?, ?, ?, ?)')
				.bind(meme.id, meme.description, JSON.stringify(meme.keywords), meme.account_id, meme.file, meme.type, meme.width, meme.height)
				.run();

			return result;
		},
		async incrementFrequency({ meme_id, account_id }: IncrementFrequencyOpt): Promise<boolean> {
			const result = await db
				.prepare('UPDATE meme SET frequency = frequency + 1 WHERE id = ? AND account_id = ?')
				.bind(meme_id, account_id)
				.run();

			return result.success;
		},
	};
}
