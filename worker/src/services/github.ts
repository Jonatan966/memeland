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
				},
			});

			const authResult = await response.json<AccessTokenResponse>();

			return authResult;
		},
		async getUser(access_token: string): Promise<User> {
			const response = await fetch('https://api.github.com/user', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			});

			const userResult = await response.json<User>();

			return userResult;
		},
	};
}
