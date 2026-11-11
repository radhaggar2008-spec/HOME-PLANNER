import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '20mb' }));

  // Initialize Google GenAI if key available
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI();
  }

  // API Route: AI Interior & Floor Plan Analysis
  app.post('/api/gemini/analyze', async (req, res) => {
    const { roomType, stylePreference, roomDimensions, budgetINR } = req.body;

    if (!ai) {
      // Return structured fallback if API key is not yet set in environment
      return res.json({
        fallback: true,
        message: 'Running in local architectural synthesis mode.'
      });
    }

    try {
      const prompt = `You are a high-end architectural interior designer specializing in warm, cozy homes in India with natural materials (teak, brass, linen, cane, mango wood).
Analyze this request:
Room Type: ${roomType}
Style Preference: ${stylePreference}
Dimensions: ${roomDimensions}
Target Budget: ${budgetINR}

Provide a JSON response with this exact structure:
{
  "styleName": "${stylePreference}",
  "tagline": "A short poetic one-line design motto",
  "description": "2-3 sentences explaining architectural vision, spatial balance, and coziness.",
  "colorPalette": [
    {"name": "Warm Linen", "hex": "#EBE5DA", "role": "Dominant upholstery"},
    {"name": "Nilambur Teak", "hex": "#7C4A28", "role": "Wood joinery"},
    {"name": "Burnt Terracotta", "hex": "#C26343", "role": "Accents"},
    {"name": "Brushed Brass", "hex": "#C79A46", "role": "Lighting"},
    {"name": "Forest Olive", "hex": "#4A5538", "role": "Botanicals"}
  ],
  "architecturalNotes": "Advice on scale, circulation clearance, and organic forms.",
  "circulationTip": "Specific placement guidance for comfortable movement.",
  "lightingPlan": "Layered lighting guidance with warm 2700K color temperatures.",
  "recommendedFurniture": [
    {
      "name": "Cloud Linen 3-Seater Low Profile Sofa",
      "category": "seating",
      "placement": "Center facing natural window light",
      "estimatedINR": 48900,
      "storeItemId": "prod-linen-sofa",
      "modelType": "sofa",
      "recommendedFinish": "linen",
      "colorHex": "#E8E1D5"
    },
    {
      "name": "Organic Curved Mango Wood Coffee Table",
      "category": "tables",
      "placement": "In front of sofa",
      "estimatedINR": 16800,
      "storeItemId": "prod-coffee-table",
      "modelType": "coffee-table",
      "recommendedFinish": "teak",
      "colorHex": "#8E5A36"
    },
    {
      "name": "Jodhpur Cane & Teak Lounge Armchair",
      "category": "seating",
      "placement": "Angled at 45 degrees",
      "estimatedINR": 24999,
      "storeItemId": "prod-teak-chair",
      "modelType": "lounge-chair",
      "recommendedFinish": "cane",
      "colorHex": "#7C4A28"
    },
    {
      "name": "Moradabad Pleated Brass Floor Lamp",
      "category": "lighting",
      "placement": "Corner reading glow",
      "estimatedINR": 8499,
      "storeItemId": "prod-brass-lamp",
      "modelType": "floor-lamp",
      "recommendedFinish": "brass",
      "colorHex": "#D4AF37"
    },
    {
      "name": "Bhadohi Raw Wool Area Rug",
      "category": "decor",
      "placement": "Anchoring seating area",
      "estimatedINR": 15400,
      "storeItemId": "prod-wool-rug",
      "modelType": "area-rug",
      "recommendedFinish": "boucle",
      "colorHex": "#DDD5C7"
    }
  ]
}
Return ONLY pure JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return res.json({ suggestion: parsed });
    } catch (err: any) {
      console.error('Gemini API error, returning fallback:', err);
      return res.json({ fallback: true });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nivaas server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
