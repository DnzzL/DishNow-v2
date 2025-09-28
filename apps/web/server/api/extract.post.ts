 import * as cheerio from "cheerio";
 import { z } from 'zod';
 import { generateObject} from 'ai'
 import { mistral  } from "@ai-sdk/mistral"
 import { RecipeSchema } from '../../shared/schemas'
 import superuserClient from '../lib/pocketbase'

const prompt = `
  Task: Extract a recipe from the provided website content and format it as JSON using the schema below. Ignore irrelevant text (ads, comments, etc.).

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

const ExtractRequestSchema = z.object({
  url: z.url(),
  authorId: z.string(),
});

export default defineEventHandler(async (event) => {
  const { url, authorId } = await readValidatedBody(event, ExtractRequestSchema.parse);

  const response = await fetch(url);
  const content = await response.text();

  const $ = cheerio.load(content);
  const mainContent = $('body').html();
  if (!mainContent) throw new Error('No content found');

   const recipe = await extractRecipe({ content: mainContent });

   const savedRecipe = await superuserClient.collection('recipes').create({
     ...recipe,
     source: url,
     author: authorId
   });

   return savedRecipe;
})
