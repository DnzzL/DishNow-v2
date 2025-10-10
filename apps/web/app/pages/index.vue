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
      expand: 'author',
      sort: '-created'
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
  <div class="container mx-auto max-w-6xl px-4 py-8">
    <!-- Hero Section -->
    <div class="text-center mb-12 animate-fade-in">
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <UIcon name="i-lucide-utensils-crossed" class="text-4xl text-white" />
        </div>
      </div>
      <h1 class="text-5xl font-bold mb-4 gradient-text">DishNow</h1>
      <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Discover, save, and share your favorite recipes with our smart recipe management platform
      </p>
    </div>

    <!-- Search Section -->
    <div class="mb-8 animate-fade-in">
      <div class="max-w-2xl mx-auto">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          size="lg"
          placeholder="Search recipes by title, description, or tags..."
          class="w-full"
          :ui="{ icon: { trailing: { pointer: '' } } }"
        >
          <template #trailing>
            <UButton
              v-if="searchQuery"
              icon="i-lucide-x"
              size="xs"
              color="gray"
              variant="ghost"
              @click="searchQuery = ''"
            />
          </template>
        </UInput>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-center">
        <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary mb-4" />
        <p class="text-gray-600">Loading delicious recipes...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRecipes.length === 0" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <UIcon name="i-lucide-chef-hat" class="text-6xl text-gray-300 mb-4 mx-auto" />
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {{ searchQuery ? 'No recipes found' : 'No recipes yet' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ searchQuery ? 'Try adjusting your search terms' : 'Start building your recipe collection' }}
        </p>
        <UButton
          v-if="!searchQuery"
          to="/add-recipe"
          icon="i-lucide-plus"
          size="lg"
          class="shadow-lg"
        >
          Add Your First Recipe
        </UButton>
      </div>
    </div>

    <!-- Recipe Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <NuxtLink
        v-for="(recipe, index) in filteredRecipes"
        :key="recipe.id"
        :to="`/recipe/${recipe.id}`"
        class="group animate-fade-in"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <UCard class="h-full card-hover cursor-pointer overflow-hidden">
          <!-- Card Header -->
          <div class="relative">
            <div class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <UIcon name="i-lucide-utensils" class="text-4xl text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            
            <!-- Quick stats overlay -->
            <div class="absolute top-2 right-2 flex gap-2">
              <UBadge color="white" variant="solid" size="xs" class="shadow-md">
                <UIcon name="i-lucide-clock" class="w-3 h-3 mr-1" />
                {{ recipe.total_time_minutes }}m
              </UBadge>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-4">
            <h3 class="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {{ recipe.title }}
            </h3>
            
            <p v-if="recipe.expand?.author" class="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
              <UIcon name="i-lucide-user" class="w-3 h-3 mr-1" />
              {{ recipe.expand.author.name }}
            </p>
            
            <p v-if="recipe.description" class="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {{ recipe.description }}
            </p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span class="flex items-center">
                <UIcon name="i-lucide-users" class="w-3 h-3 mr-1" />
                {{ recipe.servings }} servings
              </span>
            </div>
            
            <!-- Tags -->
            <div v-if="recipe.tags && recipe.tags.length" class="flex flex-wrap gap-1">
              <UBadge
                v-for="tag in recipe.tags.slice(0, 3)"
                :key="tag"
                color="blue"
                variant="soft"
                size="xs"
              >
                {{ tag }}
              </UBadge>
              <UBadge
                v-if="recipe.tags.length > 3"
                color="gray"
                variant="soft"
                size="xs"
              >
                +{{ recipe.tags.length - 3 }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </NuxtLink>
    </div>
  </div>
</template>
