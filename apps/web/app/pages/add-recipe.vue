<script setup lang="ts">
import type { Recipe } from '#shared/schemas'

const { $pb } = useNuxtApp()

const inputMethod = ref<'url' | 'image'>('url')
const url = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const isLoading = ref(false)
const error = ref('')

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Check file size (50MB limit per Mistral OCR constraints)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      error.value = 'Image file size must be less than 50MB'
      return
    }

    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const submit = async () => {
  if (inputMethod.value === 'url' && !url.value) return
  if (inputMethod.value === 'image' && !imageFile.value) return

  isLoading.value = true
  error.value = ''

  try {
    const currentUser = $pb.authStore.baseModel
    let body: any = { authorId: currentUser?.id }

    if (inputMethod.value === 'url') {
      body.url = url.value
    } else if (inputMethod.value === 'image' && imageFile.value) {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // Remove the data:image/jpeg;base64, prefix
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFile.value)
      })
      body.image = base64
    }

    const response = await $fetch('/api/extract', {
      method: 'POST',
      body
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
      <!-- Input Method Selection -->
      <div>
        <label class="block text-sm font-medium mb-2">Input Method</label>
        <div class="flex space-x-4 mb-4">
          <button
            type="button"
            @click="inputMethod = 'url'"
            :class="[
              'px-4 py-2 rounded-md font-medium transition-colors',
              inputMethod === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Recipe URL
          </button>
          <button
            type="button"
            @click="inputMethod = 'image'"
            :class="[
              'px-4 py-2 rounded-md font-medium transition-colors',
              inputMethod === 'image'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Image Upload
          </button>
        </div>
      </div>

      <!-- URL Input -->
      <div v-if="inputMethod === 'url'">
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

      <!-- Image Upload -->
      <div v-if="inputMethod === 'image'">
        <label for="image" class="block text-sm font-medium mb-2">Recipe Image</label>
        <input
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div v-if="imagePreview" class="mt-4">
          <img :src="imagePreview" class="max-w-xs rounded-md border border-gray-300" />
        </div>
        <p class="mt-2 text-sm text-gray-600">
          Upload an image of a recipe (JPEG, PNG, etc.). The system will extract the recipe using OCR.
        </p>
      </div>

      <button
        type="submit"
        :disabled="isLoading || (inputMethod === 'url' && !url) || (inputMethod === 'image' && !imageFile)"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">
          {{ inputMethod === 'image' ? 'Processing Image with OCR...' : 'Extracting Recipe...' }}
        </span>
        <span v-else>Add Recipe</span>
      </button>
    </form>

    <div v-if="error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>
  </div>
</template>
