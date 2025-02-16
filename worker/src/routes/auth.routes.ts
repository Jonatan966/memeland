import { zValidator } from '@hono/zod-validator';
import * as jose from 'jose';
import { createHonoApp } from '../libs/hono';
import { z } from 'zod';
import ms from 'ms';
import { createGithubService } from '../services/github';
import { makeAccountRepository } from '../db/repositories/account/account.repository';
import { makeSessionRepository } from '../db/repositories/session/session.repository';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = createHonoApp();

authRouter.post(
	'/',
	zValidator(
		'json',
		z.object({
			code: z.string(),
		})
	),
	async (context) => {
		const githubService = createGithubService(context.env);
		const accountRepository = makeAccountRepository(context.env.DB);
		const sessionRepository = makeSessionRepository(context.env.DB);

		const body = context.req.valid('json');

		const accessTokenResult = await githubService.getAccessToken(body.code);
		const githubUser = await githubService.getUser(accessTokenResult.access_token);

		let accountId = (await accountRepository.findByUserId(githubUser.id))?.id;

		if (!accountId) {
			const newAccountId = crypto.randomUUID();

			await accountRepository.create({ id: newAccountId, user_id: githubUser.id });

			accountId = newAccountId;
		}

		const session = await sessionRepository.create({ account_id: accountId });

		const tokenExpirationTime = '1h';
		const refreshTokenExpirationTime = '1w';
		const expiresInMargin = ms('5 minutes');

		const [token, refreshToken] = await Promise.all([
			new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setSubject(session.account_id)
				.setExpirationTime(tokenExpirationTime)
				.sign(new TextEncoder().encode(context.env.JWT_SECRET)),
			new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setSubject(session.account_id)
				.setJti(session.refresh_id)
				.setExpirationTime(refreshTokenExpirationTime)
				.sign(new TextEncoder().encode(context.env.JWT_REFRESH_SECRET)),
		]);

		return context.json({
			token: { data: token, expiresIn: ms(tokenExpirationTime) - expiresInMargin },
			refreshToken: { data: refreshToken, expiresIn: ms(refreshTokenExpirationTime) - expiresInMargin },
		});
	}
);

authRouter.post(
	'/refresh',
	zValidator(
		'json',
		z.object({
			refreshToken: z.string().includes('Bearer '),
		})
	),
	async (context) => {
		const body = context.req.valid('json');
		const parsedRefreshToken = body.refreshToken.replace('Bearer ', '');

		const [jwtResult] = await Promise.allSettled([
			jose.jwtVerify(parsedRefreshToken, new TextEncoder().encode(context.env.JWT_REFRESH_SECRET)),
		]);

		if (jwtResult.status === 'rejected' || !jwtResult.value?.payload?.jti) {
			return context.json(
				{
					error: {
						message: 'Refresh token is not valid',
					},
				},
				401
			);
		}

		const sessionRepository = makeSessionRepository(context.env.DB);

		const session = await sessionRepository.findByRefreshId(jwtResult.value.payload.jti);

		if (!session) {
			return context.json(
				{
					error: {
						message: 'Refresh token is expired or invalidated',
					},
				},
				401
			);
		}

		const updatedSession = await sessionRepository.updateRefreshId(session.id);

		const tokenExpirationTime = '1h';
		const refreshTokenExpirationTime = '1w';
		const expiresInMargin = ms('5 minutes');

		const [token, refreshToken] = await Promise.all([
			new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setSubject(session.account_id)
				.setExpirationTime(tokenExpirationTime)
				.sign(new TextEncoder().encode(context.env.JWT_SECRET)),
			new jose.SignJWT()
				.setProtectedHeader({ alg: 'HS256' })
				.setSubject(session.account_id)
				.setJti(updatedSession.refresh_id)
				.setExpirationTime(refreshTokenExpirationTime)
				.sign(new TextEncoder().encode(context.env.JWT_REFRESH_SECRET)),
		]);

		return context.json({
			token: { data: token, expiresIn: ms(tokenExpirationTime) - expiresInMargin },
			refreshToken: { data: refreshToken, expiresIn: ms(refreshTokenExpirationTime) - expiresInMargin },
		});
	}
);

authRouter.get('/me', async (context) => {
	const { response, account } = await authMiddleware(context);

	if (response) {
		return response;
	}

	return context.json({ id: account.id });
});

export { authRouter };
