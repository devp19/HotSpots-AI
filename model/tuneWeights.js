// File: tuneWeights.js
import { createRequire } from 'module';
import path from 'path';
import { PredictionServiceClient } from '@google-cloud/aiplatform';

const require = createRequire(import.meta.url);
const samples = require('./samples.json');

const keyFile = path.resolve(
  '/Users/devpatel/Documents/GitHub/Hotspots-AI/HotSpots-AI',
  'hotspot-464320-f6bfc4362ce8.json'
);

async function tuneWeights() {
  const client = new PredictionServiceClient({ keyFilename: keyFile });

  const project  = 'hotspot-464320';
  const location = 'us-central1';
  const model    = 'gemini-2.5-flash'; 
  const endpoint = 
    `projects/${project}` +
    `/locations/${location}` +
    `/publishers/google/models/${model}`;

// sample prompt below, gives best results when testing amongst LLAMA models. 
// when adding more details it starts to give worse results for some reason??? darsh check this.
  const prompt = `
Here are some zones:
${JSON.stringify(samples, null, 2)}

Suggest new values for w1, w2, w3 in the formula:
  V = w1*norm(temp) - w2*norm(ndvi) + w3*norm(bldDensity)
to improve hotspot accuracy.
Respond with JSON exactly like: { "w1": 0.5, "w2": 0.3, "w3": 0.2 }.
  `.trim();

  try {
    const [response] = await client.predict({
      endpoint,
      instances: [{ content: prompt, mimeType: 'text/plain' }],
      parameters: { temperature: 0.2, maxOutputTokens: 300 }
    });

    const reply = response.predictions[0].content;
    console.log('Raw Gemini reply:\n', reply);

    const weights = JSON.parse(reply);
    console.log('New weights:', weights);

  } catch (err) {
    console.error('Error calling Gemini:', err);
    process.exit(1);
  }
}

tuneWeights();
