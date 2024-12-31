import { sha1 } from 'hono/utils/crypto';
import { createHonoApp } from '../libs/hono';
import { authMiddleware } from '../middlewares/auth.middleware';
import { bodyLimit } from 'hono/body-limit';

const memesRouter = createHonoApp();

memesRouter.post(
	'/',
	bodyLimit({
		maxSize: 1024 * 1600, // 1.6MB
	}),
	async (context) => {
		const { response, user } = await authMiddleware(context);

		if (response) {
			return response;
		}

		const formData = await context.req.formData();

		const description = String(formData.get('description'));
		const keywords = String(formData.get('keywords'));
		const dimensions = JSON.parse(String(formData.get('dimensions')));

		const memeFile = formData.get('meme') as File;
		const memeFileData = await memeFile.arrayBuffer();
		const fileHash = await sha1(memeFileData);

		const availableMemeFileTypes = {
			'image/jpeg': 'image',
			'image/webp': 'image',
			'image/png': 'image',
			'video/mp4': 'video',
			'image/gif': 'gif',
		} as Record<string, string>;

		if (!(memeFile.type in availableMemeFileTypes)) {
			return context.json(
				{
					error: {
						message: 'File format is invalid',
					},
				},
				400
			);
		}

		const fileExtension = memeFile.name.substring(memeFile.name.lastIndexOf('.'));
		const memeFileKey = `${user.id}/${fileHash}${fileExtension}`;
		const memeFileUrl = `/media/${memeFileKey}`;

		await context.env.MEMELAND_STORAGE.put(memeFileKey, memeFileData);

		const embeddingResponse = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
			text: description,
		});

		const memeId = crypto.randomUUID();

		const dbResult = await context.env.DB.prepare(
			`
			INSERT INTO meme(id, description, keywords, user_id, file, type, width, height)
			VALUES(?, ?, ?, ?, ?, ?, ?, ?)
		`
		)
			.bind(
				memeId,
				description,
				keywords,
				user.id,
				memeFileUrl,
				availableMemeFileTypes[memeFile.type],
				dimensions?.width,
				dimensions?.height
			)
			.run();

		const vectorResult = await context.env.VECTORIZE.insert([
			{
				id: memeId,
				values: embeddingResponse.data[0],
				metadata: {
					description,
					keywords,
					user_id: user.id,
					file: memeFileUrl,
					type: availableMemeFileTypes[memeFile.type],
					width: dimensions?.width,
					height: dimensions?.height,
				},
			},
		]);

		console.log({ dbResult, vectorResult });

		return context.json({ id: memeId }, 201);
	}
);

memesRouter.get('/search', async (context) => {
	const { response, user } = await authMiddleware(context);

	if (response) {
		return response;
	}

	const querySearch = context.req.query('q')?.trim()?.toLowerCase();

	if (!querySearch) {
		return context.json(
			{
				error: {
					message: 'Query search param is required',
				},
			},
			400
		);
	}

	let queryEmbedding: number[] = JSON.parse((await context.env.MEMELAND_SEARCH.get<string>(querySearch)) || 'null');

	if (!queryEmbedding) {
		const queryEmbeddingResponse = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
			text: querySearch,
		});

		queryEmbedding = queryEmbeddingResponse.data[0];

		await context.env.MEMELAND_SEARCH.put(querySearch, JSON.stringify(queryEmbedding));
	}

	const matches = await context.env.VECTORIZE.query(queryEmbedding, {
		filter: {
			user_id: { $eq: user.id },
		},
		topK: 10,
		returnMetadata: 'all',
	});

	const data = matches.matches.map((match) => ({
		id: match.id,
		...match.metadata,
		keywords: JSON.parse(match.metadata!.keywords as string),
	}));

	return context.json(
		{
			data,
		},
		200
	);
});

memesRouter.get('/', async (context) => {
	const { response, user } = await authMiddleware(context);

	if (response) {
		return response;
	}

	const page = Number(context.req.query('page')) || 0;
	const take = Number(context.req.query('take')) || 20;

	const offset = page * take;

	const [countResult, memesQueryResult] = await Promise.all([
		context.env.DB.prepare('SELECT COUNT(*) total_memes FROM meme WHERE user_id = ?').bind(user.id).run(),
		context.env.DB.prepare('SELECT * FROM meme WHERE user_id = ? LIMIT ? OFFSET ?').bind(user.id, take, offset).run(),
	]);

	const totalMemes = countResult.results[0].total_memes as number;
	const memes = memesQueryResult.results.map((meme) => ({ ...meme, keywords: JSON.parse(meme.keywords as string) }));
	const hasNextPage = offset + memes.length < totalMemes;

	return context.json({ memes, count: totalMemes, hasNextPage });
});

export { memesRouter };
