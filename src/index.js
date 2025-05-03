/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const allowedOrigins = ['https://religious-wonders.pages.dev', 'http://localhost:5173'];

export default {
	async fetch(request, env, ctx) {
		const origin = request.headers.get('Origin');
		console.log('Incoming request from:', origin);
		const isAllowedOrigin = allowedOrigins.includes(origin);
		const corsHeaders = {
			'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
			'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		if (request.method === 'OPTIONS') {
			// Handle CORS preflight request
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}
		if (request.method === 'POST') {
			const body = await request.json();
			const option = body.option;

			console.log('Vote received for:', option);

			// TODO: Save to a storage backend like KV or external DB
			return new Response('Vote received: ' + option, { status: 200, headers: corsHeaders });
		}

		return new Response('Use POST to submit vote', { status: 405, headers: corsHeaders });
	},
};
