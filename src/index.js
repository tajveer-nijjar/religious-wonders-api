/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { nanoid } from 'nanoid'; // Generate UUIDs easily

const allowedOrigins = ['https://religious-wonders.pages.dev'];

export default {
	async fetch(request, env, ctx) {
		const origin = request.headers.get('Origin');
		console.log('Incoming request from:', origin);
		const isDev = origin && origin.startsWith('http://localhost');
		const isAllowedOrigin = allowedOrigins.includes(origin) || isDev;
		const corsHeaders = {
			'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
			'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400',
		};

		if (request.method === 'OPTIONS') {
			// Handle CORS preflight request
			return new Response(null, {
				status: 204,
				headers: corsHeaders,
			});
		}

		// Checking if can vote.
		const recentVote = await env.VOTE_BLOCKLIST.get(ip);
		if (recentVote) {
			return new Response('You have already voted recently. Try again after 4 hours.', {
				status: 429,
				headers: corsHeaders,
			});
		}
		// If the IP is not in the blocklist, proceed with the vote
		await env.VOTE_BLOCKLIST.put(ip, 'true', { expirationTtl: 14400 }); // Block for 4 hours

		if (request.method === 'POST') {
			try {
				const body = await request.json();

				const { option, ip, country, city, device } = body;
				console.log('hehehaha' + body);

				const uuid = crypto.randomUUID();

				// 1. Save full vote record
				await env.VOTES_TABLE.put(uuid, JSON.stringify({ ip, option, country, city, device, timespamp: Date.now() }));

				// 2. Save country count
				let countryCount = await env.COUNTRY_TABLE.get(country);
				countryCount = countryCount ? parseInt(countryCount) : 0;
				await env.COUNTRY_TABLE.put(country, (countryCount + 1).toString());

				// 3. Save city count
				let cityCount = await env.CITY_TABLE.get(city);
				cityCount = cityCount ? parseInt(cityCount) : 0;
				await env.CITY_TABLE.put(city, (cityCount + 1).toString());

				// 4. Save device count
				let deviceCount = await env.DEVICE_TABLE.get(device);
				deviceCount = deviceCount ? parseInt(deviceCount) : 0;
				await env.DEVICE_TABLE.put(device, (deviceCount + 1).toString());

				// 5. Save total count
				let totalCount = await env.TOTAL_VOTE_COUNT.get('total');
				totalCount = totalCount ? parseInt(totalCount) : 0;
				totalCount += 1;
				await env.TOTAL_VOTE_COUNT.put('total', totalCount.toString());

				console.log('Vote received for:', option);

				// TODO: Save to a storage backend like KV or external DB
				return new Response('Vote received: ' + option, { status: 200, headers: corsHeaders });
			} catch (error) {
				console.error('Error handling POST:', error);
				return new Response('Internal Server Error', {
					status: 500,
					headers: corsHeaders,
				});
			}
		}

		return new Response('Use POST to submit vote', { status: 405, headers: corsHeaders });
	},
};
