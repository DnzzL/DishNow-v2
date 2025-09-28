<script setup lang="ts">
import type { Recipe } from '#shared/schemas'
import Loader from '~/components/Loader.vue'

const { $pb } = useNuxtApp()

const recipes = ref<(Recipe & { id: string; author?: string; expand?: { author?: { name: string } } })[]>([])
const searchQuery = ref('')
const isLoading = ref(true)

const filteredRecipes = computed(() => {
  if (!searchQuery.value) return recipes.value
  return recipes.value.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

onMounted(async () => {
  try {
    const data = await $pb.collection('recipes').getFullList({
      expand: 'author'
    })
    recipes.value = data
  } catch (err) {
    console.error('Failed to load recipes:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4">DishNow</h1>
      <p class="text-gray-600">Discover and save your favorite recipes</p>
    </div>

    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search recipes..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div v-if="isLoading" class="flex justify-center">
      <Loader />
    </div>

    <div v-else-if="filteredRecipes.length === 0" class="text-center text-gray-500">
      <p>No recipes found. <NuxtLink to="/add-recipe" class="text-blue-600">Add your first recipe</NuxtLink></p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :to="`/recipe/${recipe.id}`"
        class="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <h3 class="text-lg font-semibold mb-2">{{ recipe.title }}</h3>
        <p v-if="recipe.expand?.author" class="text-sm text-gray-500 mb-1">By {{ recipe.expand.author.name }}</p>
        <p v-if="recipe.description" class="text-gray-600 text-sm mb-3 line-clamp-2">{{ recipe.description }}</p>
        <div class="flex justify-between text-sm text-gray-500 mb-3">
          <span>{{ recipe.servings }} servings</span>
          <span>{{ recipe.total_time_minutes }} min</span>
        </div>
        <div v-if="recipe.tags && recipe.tags.length" class="flex flex-wrap gap-1">
          <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {{ tag }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
