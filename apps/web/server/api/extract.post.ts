 import * as cheerio from "cheerio";
 import { z } from 'zod';
 import { generateObject} from 'ai'
 import { mistral  } from "@ai-sdk/mistral"
 import { Mistral } from '@mistralai/mistralai'
 import { RecipeSchema } from '../../shared/schemas'
 import superuserClient from '../lib/pocketbase'

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || ''
});

const prompt = `
  Task: Extract a recipe from the provided content and format it as JSON using the schema below. Ignore irrelevant text (ads, comments, etc.).

  Rules:
   - Normalize units: Convert "tbsp" → "tablespoon", "oz" → "ounce", etc.
   - Quantities: Use floats (e.g., 0.5 for "½").
   - Time: Convert "1 hour 30 mins" → 90 (total minutes).
   - Instructions: Split into logical steps (1 sentence per step).
   `

export async function extractRecipe({ content }: { content: string }) {
  const { object } = await generateObject({
    model: mistral('mistral-small-latest'),
    schema: RecipeSchema,
    prompt: prompt + content
  });

  return object;
}

export async function extractRecipeFromImage(imageBase64: string) {
  try {
    const ocrResponse = await mistralClient.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:image/jpeg;base64,${imageBase64}`
      },
      includeImageBase64: true
    });

    const extractedText = ocrResponse.pages.map((page: any) => page.markdown).join('\n');
    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the image. Please ensure the image contains readable recipe text.');
    }

    return extractRecipe({ content: extractedText });
  } catch (error: any) {
    if (error.message?.includes('OCR')) {
      throw new Error('Failed to process image with OCR. Please try a different image or use a URL instead.');
    }
    throw new Error(`Image processing failed: ${error.message || 'Unknown error'}`);
  }
}

const ExtractRequestSchema = z.object({
  url: z.url().optional(),
  image: z.string().optional(),
  authorId: z.string(),
}).refine(data => data.url || data.image, {
  message: "Either url or image must be provided"
});

export default defineEventHandler(async (event) => {
  const { url, image, authorId } = await readValidatedBody(event, ExtractRequestSchema.parse);

  let recipe;

  if (url) {
    // Original URL-based extraction
    const response = await fetch(url);
    const content = await response.text();

    const $ = cheerio.load(content);
    const mainContent = $('body').html();
    if (!mainContent) throw new Error('No content found');

    recipe = await extractRecipe({ content: mainContent });
  } else if (image) {
    // New image-based extraction using OCR
    recipe = await extractRecipeFromImage(image);
  }

  const savedRecipe = await superuserClient.collection('recipes').create({
    ...recipe,
    source: url || 'image-upload',
    author: authorId
  });

  return savedRecipe;
})
