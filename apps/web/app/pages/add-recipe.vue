<script setup lang="ts">
import type { Recipe } from '#shared/schemas'

const { $pb } = useNuxtApp()

const url = ref('')
const isLoading = ref(false)
const error = ref('')

const submit = async () => {
  if (!url.value) return

  isLoading.value = true
  error.value = ''

  try {
    const currentUser = $pb.authStore.baseModel
    const response = await $fetch('/api/extract', {
      method: 'POST',
      body: {
        url: url.value,
        authorId: currentUser?.id
      }
    }) as Recipe & { id: string }

    // Redirect to the recipe detail page
    await navigateTo(`/recipe/${response.id}`)
  } catch (err: any) {
    error.value = err.message || 'Failed to extract recipe'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto max-w-2xl px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Add Recipe</h1>

    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label for="url" class="block text-sm font-medium mb-2">Recipe URL</label>
        <input
          id="url"
          v-model="url"
          type="url"
          required
          placeholder="https://example.com/recipe"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Extracting Recipe...</span>
        <span v-else>Add Recipe</span>
      </button>
    </form>

    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>
