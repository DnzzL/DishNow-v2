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
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-center">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary mb-4" />
        <p class="text-gray-600">Loading recipe...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <UCard class="max-w-md mx-auto">
        <div class="text-center">
          <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-500 mb-4 mx-auto" />
          <h3 class="text-lg font-semibold text-red-700 mb-2">Recipe Not Found</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <UButton to="/" icon="i-lucide-arrow-left" variant="outline">
            Back to Recipes
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Recipe Content -->
    <div v-else-if="recipe" class="space-y-8 animate-fade-in">
      <!-- Header Section -->
      <div class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <UIcon name="i-lucide-utensils-crossed" class="text-3xl text-white" />
          </div>
        </div>
        <h1 class="text-4xl font-bold gradient-text">{{ recipe.title }}</h1>
        <p v-if="recipe.description" class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ recipe.description }}
        </p>

        <!-- Recipe Meta -->
        <div class="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div v-if="recipe.expand?.author" class="flex items-center gap-1">
            <UIcon name="i-lucide-user" class="w-4 h-4" />
            <span>{{ recipe.expand.author.name }}</span>
          </div>
          <div v-if="recipe.source" class="flex items-center gap-1">
            <UIcon name="i-lucide-link" class="w-4 h-4" />
            <a :href="recipe.source" target="_blank" class="text-primary hover:underline">
              View Source
            </a>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard class="text-center">
          <div class="space-y-2">
            <UIcon name="i-lucide-users" class="text-2xl text-primary mx-auto" />
            <div class="text-2xl font-bold">{{ recipe.servings }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Servings</div>
          </div>
        </UCard>

        <UCard class="text-center">
          <div class="space-y-2">
            <UIcon name="i-lucide-clock" class="text-2xl text-blue-500 mx-auto" />
            <div class="text-2xl font-bold">{{ recipe.prep_time_minutes }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Prep Time</div>
          </div>
        </UCard>

        <UCard class="text-center">
          <div class="space-y-2">
            <UIcon name="i-lucide-timer" class="text-2xl text-green-500 mx-auto" />
            <div class="text-2xl font-bold">{{ recipe.total_time_minutes }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
          </div>
        </UCard>

        <UCard class="text-center">
          <div class="space-y-2">
            <UIcon name="i-lucide-list-checks" class="text-2xl text-purple-500 mx-auto" />
            <div class="text-2xl font-bold">{{ recipe.ingredients?.length || 0 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Ingredients</div>
          </div>
        </UCard>
      </div>

      <!-- Ingredients Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shopping-basket" class="text-xl text-primary" />
            <h2 class="text-xl font-semibold">Ingredients</h2>
          </div>
        </template>

        <div class="grid gap-3">
          <div
            v-for="ingredient in recipe.ingredients"
            :key="ingredient.name"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              <span class="font-medium">{{ ingredient.name }}</span>
              <span v-if="ingredient.notes" class="text-sm text-gray-500">({{ ingredient.notes }})</span>
            </div>
            <div class="text-sm font-semibold text-primary">
              {{ ingredient.quantity }} {{ ingredient.unit }}
            </div>
          </div>
        </div>
      </UCard>

      <!-- Instructions Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="text-xl text-primary" />
            <h2 class="text-xl font-semibold">Instructions</h2>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="(instruction, index) in recipe.instructions"
            :key="index"
            class="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
              {{ index + 1 }}
            </div>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ instruction }}</p>
          </div>
        </div>
      </UCard>

      <!-- Tags Section -->
      <div v-if="recipe.tags && recipe.tags.length" class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-tags" class="text-xl text-primary" />
          <h2 class="text-xl font-semibold">Tags</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tag in recipe.tags"
            :key="tag"
            color="blue"
            variant="soft"
            size="lg"
            class="px-3 py-1"
          >
            {{ tag }}
          </UBadge>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-center gap-4 pt-4">
        <UButton to="/" icon="i-lucide-arrow-left" variant="outline" size="lg">
          Back to Recipes
        </UButton>
        <UButton icon="i-lucide-share-2" color="primary" size="lg" @click="shareRecipe">
          Share Recipe
        </UButton>
      </div>
    </div>
  </div>
</template>
