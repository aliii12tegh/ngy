export interface Env {
	AI: any;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
	"Access-Control-Allow-Headers": "Content-Type",
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== "POST") {
			return new Response("Method not allowed. Use POST.", { status: 405, headers: corsHeaders });
		}

		try {
			// ==========================================
			// TEXT-TO-SPEECH ENDPOINT
			// ==========================================
			if (url.pathname === "/api/tts") {
				const body: any = await request.json();

				if (!body.text) {
					return new Response('Missing text', { status: 400, headers: corsHeaders });
				}

				let params: any = { text: body.text };
				
				if (body.speaker) params.speaker = body.speaker;
				if (body.encoding) params.encoding = body.encoding;
				if (body.container) params.container = body.container;
				if (body.sample_rate) params.sample_rate = body.sample_rate;
				if (body.bit_rate) params.bit_rate = body.bit_rate;

				// Generate audio stream using Cloudflare Workers AI with Deepgram Aura
				const response = await env.AI.run('@cf/deepgram/aura-2-en', params);

				return new Response(response, {
					headers: {
						'Content-Type': 'audio/mpeg',
						...corsHeaders
					}
				});
			}

			// ==========================================
			// IMAGE-TO-TEXT ENDPOINT
			// ==========================================
			if (url.pathname === "/api/image-to-text") {
				let prompt = "Describe this image in detail.";
				let blob: ArrayBuffer;

				const contentType = request.headers.get("content-type") || "";

				// If it's a multipart form data (from HTML file upload)
				if (contentType.includes("multipart/form-data")) {
					const formData = await request.formData();
					const file = formData.get("image") as File;
					if (!file) {
						throw new Error("No image file uploaded");
					}
					blob = await file.arrayBuffer();

					// Optional custom prompt from the client
					const customPrompt = formData.get("prompt");
					if (customPrompt) {
						prompt = customPrompt.toString();
					}
				} else {
					// Fallback for raw binary upload
					blob = await request.arrayBuffer();
				}

				if (!blob || blob.byteLength === 0) {
					throw new Error("Empty image body");
				}

				// The model expects a flat array of numbers for the image data
				const input = {
					image: [...new Uint8Array(blob)],
					prompt: prompt,
					max_tokens: 512,
				};

				const aiResponse = await env.AI.run(
					"@cf/llava-hf/llava-1.5-7b-hf",
					input
				);

				return new Response(JSON.stringify(aiResponse), {
					headers: {
						...corsHeaders,
						"Content-Type": "application/json",
					},
				});
			}

			return new Response("Not found", { status: 404, headers: corsHeaders });

		} catch (error: any) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json",
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;
