/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight request
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': 'https://religious-wonders.pages.dev/',
					'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}
		if (request.method === 'POST') {
			const body = await request.json();
			const option = body.option;

			console.log('Vote received for:', option);

			// TODO: Save to a storage backend like KV or external DB
			return new Response('Vote received: ' + option, { status: 200 });
		}

		return new Response('Use POST to submit vote', { status: 405 });
	},
};
