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
		const keywords = JSON.parse(String(formData.get('keywords')));
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

		const result = await context.env.VECTORIZE.insert([
			{
				id: crypto.randomUUID(),
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

		return context.json({ id: result.mutationId }, 201);
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
	}));

	return context.json(
		{
			data,
		},
		200
	);
});

export { memesRouter };
