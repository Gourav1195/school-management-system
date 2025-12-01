import { NextRequest, NextResponse } from 'next/server'
import dotenv from 'dotenv'

dotenv.config()

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 })
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_CLOUD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a AI Question Generator' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    }),
  })

  const data = await response.json()

  const safeJSONParse = (input: string) => {
  try {
    const arr = JSON.parse(input);
    return Array.isArray(arr) ? arr : null;
  } catch {
    try {
      // If double-encoded, try decoding once first
      const unescaped = JSON.parse(`"${input}"`);
      return JSON.parse(unescaped);
    } catch {
      return null;
    }
  }
};
try {
  const message = data.choices?.[0]?.message?.content?.trim();

  // Try to extract the JSON array
  const jsonMatch = message.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in AI response');

  let jsonStr = jsonMatch[0];

  // Handle escaped inner quotes if it's double-encoded
  if (jsonStr.includes('\\\"')) {
    jsonStr = JSON.parse(`"${jsonStr}"`); // decode the stringified array
  }

  // ✅ Use the possibly-decoded `jsonStr`, not the raw match
  const questions = safeJSONParse(jsonStr);
  if (!questions) throw new Error('AI returned invalid or malformed JSON array');

  return NextResponse.json(questions);

} catch (e) {
  console.error('Failed to parse response as JSON array:', e);
  return NextResponse.json({ error: 'AI returned invalid response', raw: data }, { status: 500 });
}

}