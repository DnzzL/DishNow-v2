import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().nullable(),
  unit: z.string(),
  notes: z.string().optional(),
});

export const RecipeSchema = z.object({
  title: z.string().describe("Recipe title"),
  description: z.string().optional(),
  servings: z.number().int().positive("Servings must be a positive integer"),
  prep_time_minutes: z.number().int().nonnegative("Prep time cannot be negative"),
  cook_time_minutes: z.number().int().nonnegative("Cook time cannot be negative"),
  total_time_minutes: z.number().int().nonnegative("Total time cannot be negative"),
  ingredients: z.array(IngredientSchema),
  instructions: z.array(z.string()),
  tags: z.array(z.string()).optional().describe("Tags like 'vegan', 'gluten-free', 'desert', etc."),
  source: z.url("Source must be a valid URL").or(z.string()).optional(),
  author: z.string().optional().describe("User ID of the recipe author"),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
