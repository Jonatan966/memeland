import { Context } from 'hono';
import * as jose from 'jose';
import { HonoEnv } from '../libs/hono';

export async function authMiddleware(context: Context<HonoEnv>) {
	const tokenPrefix = 'Bearer ';
	const rawToken = context.req.header('authorization');
	const parsedToken = rawToken?.replace(tokenPrefix, '')!;

	const [jwtResult] = await Promise.allSettled([jose.jwtDecrypt(parsedToken, new TextEncoder().encode(context.env.JWT_SECRET))]);

	if (jwtResult.status === 'rejected' || !rawToken?.includes(tokenPrefix)) {
		return {
			response: context.json(
				{
					error: {
						message: 'Token is not valid',
					},
				},
				401
			),
		};
	}

	return {
		account: {
			id: jwtResult.value.payload.sub,
		},
	};
}
