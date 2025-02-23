import { AccountEntity } from './account.entity';

export function makeAccountRepository(db: D1Database) {
	return {
		async create(account: Pick<AccountEntity, 'id' | 'user_id'>): Promise<boolean> {
			console.log('[account] create()', account);

			const result = await db
				.prepare('INSERT INTO account(id, user_id) VALUES(?, ?)')
				.bind(account.id, account.user_id)
				.run<AccountEntity>();

			return result.success;
		},
		async findByUserId(user_id: number): Promise<AccountEntity | null> {
			console.log('[account] findByUserId()', { user_id });

			const account = await db.prepare('SELECT * FROM account WHERE user_id = ?').bind(user_id).first<AccountEntity>();

			return account;
		},
		async findById(id: string): Promise<AccountEntity | null> {
			console.log('[account] findById()', { id });

			const account = await db.prepare('SELECT * FROM account WHERE id = ?').bind(id).first<AccountEntity>();

			return account;
		},
	};
}
