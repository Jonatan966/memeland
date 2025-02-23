import { sha1 } from 'hono/utils/crypto';
import { createHonoApp } from '../libs/hono';
import { authMiddleware } from '../middlewares/auth.middleware';
import { bodyLimit } from 'hono/body-limit';
import { makeMemeRepository } from '../db/repositories/meme/meme.repository';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const memesRouter = createHonoApp();

memesRouter.post(
	'/',
	bodyLimit({
		maxSize: 1024 * 1600, // 1.6MB
	}),
	async (context) => {
		const { response, account } = await authMiddleware(context);

		if (response) {
			return response;
		}

		const formData = await context.req.formData();

		const description = String(formData.get('description'));
		const keywords = String(formData.get('keywords'));

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
		const memeFileKey = `${account.id}/${fileHash}${fileExtension}`;
		const memeFileUrl = `/media/${memeFileKey}`;

		const memeRepository = makeMemeRepository(context.env.DB);

		await context.env.MEMELAND_STORAGE.put(memeFileKey, memeFileData);

		const embeddingResponse = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', {
			text: description,
		});

		const memeId = crypto.randomUUID();

		const dbResult = await memeRepository.create({
			id: memeId,
			description,
			keywords: JSON.parse(keywords),
			account_id: account.id,
			file: memeFileUrl,
			type: availableMemeFileTypes[memeFile.type],
		});

		const vectorResult = await context.env.VECTORIZE.insert([
			{
				id: memeId,
				values: embeddingResponse.data[0],
				metadata: {
					description,
					keywords,
					user_id: account.id!,
					file: memeFileUrl,
					type: availableMemeFileTypes[memeFile.type],
				},
			},
		]);

		console.log({ dbResult, vectorResult });

		return context.json({ id: memeId }, 201);
	}
);

memesRouter.get('/search', async (context) => {
	const { response, account } = await authMiddleware(context);

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
			user_id: { $eq: account.id },
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
	const { response, account } = await authMiddleware(context);

	if (response) {
		return response;
	}

	const page = Number(context.req.query('page')) || 0;
	const take = Number(context.req.query('take')) || 20;

	const offset = page * take;

	const memeRepository = makeMemeRepository(context.env.DB);

	const [totalMemes, memes] = await Promise.all([
		memeRepository.count(account.id!),
		memeRepository.findMany({ account_id: account.id!, offset, take }),
	]);

	const hasNextPage = offset + memes.length < totalMemes;

	return context.json({ memes, count: totalMemes, hasNextPage });
});

memesRouter.put('/:meme_id/frequency', async (context) => {
	const { response, account } = await authMiddleware(context);

	if (response) {
		return response;
	}

	const { meme_id } = context.req.param();

	const memeRepository = makeMemeRepository(context.env.DB);

	await memeRepository.incrementFrequency({
		meme_id,
		account_id: account.id!,
	});

	return context.status(200);
});

memesRouter.post('/vector', zValidator('json', z.array(z.object({ id: z.string(), vectors: z.array(z.number()) }))), async (context) => {
	const memes = context.req.valid('json');

	const memeRepository = makeMemeRepository(context.env.DB);

	const payload = [] as VectorizeVector[];

	for (const basicMeme of memes) {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const meme = await memeRepository.findById(basicMeme.id);

		payload.push({
			id: basicMeme.id,
			values: basicMeme.vectors,
			metadata: {
				description: meme.description,
				keywords: JSON.stringify(meme.keywords),
				user_id: meme.account_id!,
				file: meme.file!,
				type: meme.type!,
			},
		});
	}

	const vectorResult = await context.env.VECTORIZE.insert(payload);

	return context.json(vectorResult);
});

export { memesRouter };
