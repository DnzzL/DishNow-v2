<script setup lang="ts">
import type { Recipe } from '#shared/schemas'
import Loader from '~/components/Loader.vue'

const route = useRoute()
const recipeId = route.params.id as string

const { $pb } = useNuxtApp()
const recipe = ref<(Recipe & { id: string; author?: string; expand?: { author?: { name: string } } }) | null>(null)
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const data = await $pb.collection('recipes').getOne(recipeId, {
      expand: 'author'
    })
    recipe.value = data
  } catch (err: any) {
    error.value = err.message || 'Failed to load recipe'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto max-w-3xl px-4 py-8">
    <div v-if="isLoading" class="flex justify-center">
      <Loader />
    </div>

    <div v-else-if="error" class="text-center text-red-600">
      {{ error }}
    </div>

    <div v-else-if="recipe" class="space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold mb-2">{{ recipe.title }}</h1>
        <p v-if="recipe.description" class="text-gray-600">{{ recipe.description }}</p>
        <div class="text-sm text-gray-500 mt-2 space-y-1">
          <p v-if="recipe.expand?.author">By: {{ recipe.expand.author.name }}</p>
          <p>Source: <a :href="recipe.source" target="_blank" class="text-blue-600">{{ recipe.source }}</a></p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold">{{ recipe.servings }}</div>
          <div class="text-sm text-gray-600">Servings</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold">{{ recipe.prep_time_minutes }}</div>
          <div class="text-sm text-gray-600">Prep Time (min)</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg text-center">
          <div class="text-2xl font-bold">{{ recipe.total_time_minutes }}</div>
          <div class="text-sm text-gray-600">Total Time (min)</div>
        </div>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-4">Ingredients</h2>
        <ul class="space-y-2">
          <li v-for="ingredient in recipe.ingredients" :key="ingredient.name" class="flex items-center">
            <span class="w-20 text-right mr-4">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
            <span>{{ ingredient.name }}</span>
            <span v-if="ingredient.notes" class="text-gray-500 ml-2">({{ ingredient.notes }})</span>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="text-xl font-semibold mb-4">Instructions</h2>
        <ol class="space-y-3">
          <li v-for="(instruction, index) in recipe.instructions" :key="index" class="flex">
            <span class="font-bold mr-3">{{ index + 1 }}.</span>
            <span>{{ instruction }}</span>
          </li>
        </ol>
      </div>

      <div v-if="recipe.tags && recipe.tags.length">
        <h2 class="text-xl font-semibold mb-4">Tags</h2>
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in recipe.tags" :key="tag" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
