import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side env var (no VITE_ prefix)
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { systemPrompt, prompt, maxTokens = 200 } = body;

    if (!systemPrompt || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: systemPrompt and prompt' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call OpenAI API securely on the server
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const content = completion.choices[0].message.content?.trim() || '';

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate AI response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
