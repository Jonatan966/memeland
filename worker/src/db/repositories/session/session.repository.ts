import { SessionEntity } from './session.entity';

export function makeSessionRepository(db: D1Database) {
	return {
		async create(session: Pick<SessionEntity, 'account_id'>) {
			console.log('[session] create()', session);

			const payload = {
				id: crypto.randomUUID(),
				refresh_id: crypto.randomUUID(),
				account_id: session.account_id,
			};

			await db
				.prepare('INSERT INTO session(id, refresh_id, account_id) VALUES(?, ?, ?)')
				.bind(payload.id, payload.refresh_id, payload.account_id)
				.run();

			return payload;
		},
		async findByRefreshId(refresh_id: string) {
			console.log('[session] findByRefreshId()', { refresh_id });

			const session = await db.prepare('SELECT * FROM session WHERE refresh_id = ?').bind(refresh_id).first<SessionEntity>();

			return session;
		},
		async updateRefreshId(session_id: string) {
			console.log('[session] updateRefreshId()', { session_id });

			const newRefreshId = crypto.randomUUID();

			await db.prepare('UPDATE session SET refresh_id = ? WHERE id = ?').bind(newRefreshId, session_id).run();

			return {
				id: session_id,
				refresh_id: newRefreshId,
			};
		},
	};
}
