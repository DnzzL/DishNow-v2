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
    processImageFile(file)
  }
}

const processImageFile = (file: File) => {
  // Clear any previous errors
  error.value = ''

  // Check file size (50MB limit per Mistral OCR constraints)
  const maxSize = 50 * 1024 * 1024 // 50MB in bytes
  if (file.size > maxSize) {
    error.value = 'Image file size must be less than 50MB'
    return
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload an image file'
    return
  }

  imageFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imageFile.value = null
  imagePreview.value = null
  error.value = ''
  // Reset the file input
  const fileInput = document.getElementById('image') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

// Drag and drop handlers
const isDragging = ref(false)

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    processImageFile(file)
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
    <!-- Header -->
    <div class="text-center mb-8 animate-fade-in">
      <div class="flex justify-center mb-4">
        <div class="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
          <UIcon name="i-lucide-plus-circle" class="text-3xl text-white" />
        </div>
      </div>
      <h1 class="text-3xl font-bold mb-2 gradient-text">Add New Recipe</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Import a recipe from a URL or extract it from an image using AI
      </p>
    </div>

    <UCard class="animate-fade-in">
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Input Method Selection -->
        <div>
          <label class="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            How would you like to add your recipe?
          </label>
          <div class="grid grid-cols-2 gap-3">
            <UButton
              :variant="inputMethod === 'url' ? 'solid' : 'outline'"
              :color="inputMethod === 'url' ? 'primary' : 'gray'"
              size="lg"
              class="justify-start"
              @click="inputMethod = 'url'"
            >
              <div class="text-left">
                <div class="font-medium">Recipe URL</div>
                <div class="text-xs opacity-75">Import from a website</div>
              </div>
            </UButton>
            <UButton
              :variant="inputMethod === 'image' ? 'solid' : 'outline'"
              :color="inputMethod === 'image' ? 'primary' : 'gray'"
              size="lg"
              class="justify-start"
              @click="inputMethod = 'image'"
            >
              <div class="text-left">
                <div class="font-medium">Image Upload</div>
                <div class="text-xs opacity-75">Extract from a photo using OCR</div>
              </div>
            </UButton>
          </div>
        </div>

        <!-- URL Input -->
        <div v-if="inputMethod === 'url'" class="space-y-2">
          <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe URL
          </label>
          <UInput
            id="url"
            v-model="url"
            type="url"
            required
            icon="i-lucide-link"
            placeholder="https://example.com/recipe"
            size="lg"
            class="w-full"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Paste the URL of any recipe webpage and we'll extract the details automatically.
          </p>
        </div>

        <!-- Image Upload -->
        <div v-if="inputMethod === 'image'" class="space-y-4">
          <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe Image
          </label>

          <!-- Upload Area -->
          <div
            class="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer"
            :class="[
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
            ]"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              id="image"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              required
              class="hidden"
            />
            <label for="image" class="cursor-pointer block">
              <UIcon
                :name="isDragging ? 'i-lucide-download' : 'i-lucide-cloud-upload'"
                class="text-4xl mb-2 mx-auto transition-colors"
                :class="isDragging ? 'text-primary' : 'text-gray-400'"
              />
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ isDragging ? 'Drop your image here' : 'Click to upload or drag and drop' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                JPEG, PNG, GIF up to 50MB
              </p>
            </label>
          </div>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
              <UButton
                icon="i-lucide-trash-2"
                size="xs"
                color="red"
                variant="ghost"
                @click="clearImage"
              >
                Remove
              </UButton>
            </div>
            <div class="relative inline-block">
              <img
                :src="imagePreview"
                class="max-w-full h-64 object-cover rounded-lg shadow-md"
                alt="Recipe preview"
              />
              <div class="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {{ imageFile?.name }}
              </div>
            </div>
            <p class="text-xs text-gray-500">
              File size: {{ imageFile ? (imageFile.size / 1024 / 1024).toFixed(2) : '0' }} MB
            </p>
          </div>

          <UAlert color="blue" variant="soft" icon="i-lucide-info">
            <template #description>
              Our AI will scan your image and extract the recipe details using advanced OCR technology.
            </template>
          </UAlert>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <UButton
            type="submit"
            size="lg"
            :loading="isLoading"
            :disabled="isLoading || (inputMethod === 'url' && !url) || (inputMethod === 'image' && !imageFile)"
            class="w-full shadow-lg"
            icon="i-lucide-sparkles"
          >
            <span v-if="!isLoading">
              {{ inputMethod === 'image' ? 'Extract Recipe from Image' : 'Import Recipe from URL' }}
            </span>
            <span v-else>
              {{ inputMethod === 'image' ? 'Processing with AI...' : 'Extracting Recipe...' }}
            </span>
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      icon="i-lucide-alert-circle"
      class="mt-6"
      :title="error"
    />
  </div>
</template>
