import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const NOISE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'my', 'our', 'your',
  'his', 'her', 'its', 'their', 'this', 'that', 'these', 'those',
  'am', 'pm', 'vs', 'w/', 'w', 're', 'no', 'not', 'so', 'up',
]);

function fallbackQuery(title: string, location?: string): string {
  const words = title
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !NOISE_WORDS.has(w.toLowerCase()))
    .slice(0, 3);

  if (words.length === 0 && location) {
    return location.split(',')[0].trim();
  }

  return words.length > 0 ? words.join(' ') : 'calendar event';
}

export async function generateSearchQuery(
  title: string,
  location?: string,
  description?: string,
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return fallbackQuery(title, location);
  }

  const parts = [`Event title: "${title}"`];
  if (location) parts.push(`Location: "${location}"`);
  if (description) parts.push(`Description: "${description.substring(0, 200)}"`);

  const prompt = `Given this calendar event, generate a 2-4 word search query for finding a relevant, beautiful stock photo on Unsplash. Focus on the activity or theme, not specific names or brands. Return ONLY the search query, nothing else.

${parts.join('\n')}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 },
        },
      },
      {
        headers: { 'content-type': 'application/json' },
        timeout: 5000,
      },
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text && text.length > 0 && text.length < 100) {
      return text;
    }
    return fallbackQuery(title, location);
  } catch (error) {
    console.error('Gemini query generation failed, using fallback:', (error as Error).message);
    return fallbackQuery(title, location);
  }
}
