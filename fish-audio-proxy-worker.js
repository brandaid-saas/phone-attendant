/**
 * Fish Audio TTS Proxy — Cloudflare Worker
 * ─────────────────────────────────────────
 * Bridges Vapi's Custom TTS requests to the Fish Audio API.
 *
 * Environment variables to set in Cloudflare dashboard:
 *   FISH_API_KEY   — your Fish Audio API key
 *   FISH_VOICE_ID  — your Fish Audio reference_id (voice/model ID)
 */

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // --- Parse Vapi's request ---
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid JSON body', { status: 400 });
    }

    // Log body keys for debugging
    console.log('VAPI KEYS:', Object.keys(body));
    console.log('VAPI BODY:', JSON.stringify(body).slice(0, 300));

    // Try every known field path Vapi might use
    const text = body.input || body.text || body.speech || body.message?.speech || body.message?.input || body.message?.text;
    if (!text) {
      return new Response(`Missing text. Keys: ${Object.keys(body).join(', ')}`, { status: 400 });
    }

    console.log('EXTRACTED TEXT:', text.slice(0, 100));

    // Voice ID from request or env fallback
    const voiceId = (typeof body.voice === 'string' ? body.voice : body.voice?.voiceId) || env.FISH_VOICE_ID;

    if (!voiceId) {
      return new Response('No voice ID. Set FISH_VOICE_ID in Worker env vars.', { status: 400 });
    }

    // --- Call Fish Audio API ---
    let fishResponse;
    try {
      fishResponse = await fetch('https://api.fish.audio/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.FISH_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          reference_id: voiceId,
          format: 'pcm',
          sample_rate: 16000,
          normalize: true,
          latency: 'normal',
        }),
      });
    } catch (err) {
      return new Response(`Failed to reach Fish Audio: ${err.message}`, { status: 502 });
    }

    if (!fishResponse.ok) {
      const errorText = await fishResponse.text();
      console.log('FISH ERROR:', fishResponse.status, errorText);
      return new Response(`Fish Audio error (${fishResponse.status}): ${errorText}`, { status: 502 });
    }

    // Buffer the full audio response
    const audioBuffer = await fishResponse.arrayBuffer();
    console.log('AUDIO BYTES:', audioBuffer.byteLength);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/raw',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  },
};
