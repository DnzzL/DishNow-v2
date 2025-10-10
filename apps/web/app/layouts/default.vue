<script setup>
const mobileMenuOpen = ref(false)
const route = useRoute()

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

// Close mobile menu when route changes
watch(() => route.path, () => {
  closeMobileMenu()
})

// Hide header on auth pages
const showHeader = computed(() => {
  return !['/login', '/signup'].includes(route.path)
})
</script>

<template>
  <div class="grid grid-rows-[auto_1fr] h-svh">
    <!-- Header (only shown on non-auth pages) -->
    <Header v-if="showHeader" @toggle-mobile-menu="toggleMobileMenu" />
    
    <!-- Mobile Menu Overlay -->
    <div 
      v-if="mobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="closeMobileMenu"
    />
    
    <!-- Mobile Menu Sidebar -->
    <div 
      :class="[
        'fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 md:hidden',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="p-4">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-utensils" class="text-2xl text-primary" />
            <span class="text-xl font-bold">DishNow</span>
          </div>
          <UButton
            icon="i-lucide-x"
            size="sm"
            color="gray"
            variant="ghost"
            @click="closeMobileMenu"
          />
        </div>
        
        <nav class="space-y-2">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            active-class="bg-primary/10 text-primary font-semibold"
            @click="closeMobileMenu"
          >
            <UIcon name="i-lucide-home" class="text-lg" />
            Home
          </NuxtLink>
          <NuxtLink
            to="/add-recipe"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            active-class="bg-primary/10 text-primary font-semibold"
            @click="closeMobileMenu"
          >
            <UIcon name="i-lucide-plus-circle" class="text-lg" />
            Add Recipe
          </NuxtLink>
        </nav>
      </div>
    </div>
    
    <main class="overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
