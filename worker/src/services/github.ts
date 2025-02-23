interface AccessTokenResponse {
	access_token: string;
	scope: string;
	token_type: string;
}

interface User {
	id: number;
}

export function createGithubService(envs: Env) {
	return {
		async getAccessToken(code: string): Promise<AccessTokenResponse> {
			const response = await fetch('https://github.com/login/oauth/access_token', {
				method: 'POST',
				body: JSON.stringify({
					code,
					client_id: envs.GITHUB_CLIENT_ID,
					client_secret: envs.GITHUB_CLIENT_SECRET,
					redirect_uri: envs.GITHUB_REDIRECT_URI,
				}),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'User-Agent': 'memeland',
				},
			});

			const authResult = await response.json<AccessTokenResponse>();

			if ([200, 201].includes(response.status)) {
				console.log('[githubService] getAccessToken() error', authResult);
			}

			return authResult;
		},
		async getUser(access_token: string): Promise<User> {
			const response = await fetch('https://api.github.com/user', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${access_token}`,
					'User-Agent': 'memeland',
				},
			});

			const userResult = await response.json<User>();

			if (response.status !== 200) {
				console.log('[githubService] getUser() error', userResult);
			}

			return userResult;
		},
	};
}
