// File: tuneWeightsGemini.js
import { createRequire } from 'module';
import { GoogleGenAI }   from '@google/genai';

const require = createRequire(import.meta.url);
const samples = require('./samples.json');

async function main() {
  const ai = new GoogleGenAI({ apiVersion: 'v1' });  // assumes GEMINI_API_KEY is set

  const prompt = `
Here are some zones:
${JSON.stringify(samples, null, 2)}

Suggest new values for w1, w2, w3 in the formula:
  V = w1*norm(temp) - w2*norm(ndvi) + w3*norm(bldDensity)
to improve hotspot accuracy.
Respond with JSON exactly like: { "w1": 0.5, "w2": 0.3, "w3": 0.2 }.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model:    'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature:     0.2,
        maxOutputTokens: 300
      }
    });

    // 1) Inspect raw response
    console.log('Full API response:', JSON.stringify(response, null, 2));

    // 2) Extract text (with fences)
    let text = response.text;
    console.log('Raw text reply:\n', text);

    // 3) Strip markdown fences ``` or ```json
    text = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
    console.log('Cleaned JSON text:\n', text);

    // 4) Parse JSON
    const weights = JSON.parse(text);
    console.log('➜ New weights:', weights);

  } catch (err) {
    console.error('Error calling Gemini:', err);
    process.exit(1);
  }
}

main();
