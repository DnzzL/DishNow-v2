<script setup lang="ts">
import ModeToggle from './ModeToggle.vue'

const links = [
    { to: "/", label: "Home", icon: "i-lucide-home" },
    { to: "/add-recipe", label: "Add Recipe", icon: "i-lucide-plus-circle" },
];
</script>

<template>
  <header class="glass sticky top-0 z-50 animate-slide-in">
    <div class="flex flex-row items-center justify-between px-6 py-4">
      <!-- Logo/Brand -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <UIcon name="i-lucide-utensils" class="text-2xl text-primary group-hover:rotate-12 transition-transform duration-300" />
        <span class="text-xl font-bold gradient-text">DishNow</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary"
          active-class="bg-primary/10 text-primary font-semibold"
        >
          <UIcon :name="link.icon" class="text-lg" />
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Right side actions -->
      <div class="flex items-center gap-3">
        <ModeToggle />
        
        <!-- Mobile menu button -->
        <UButton
          icon="i-lucide-menu"
          size="sm"
          color="gray"
          variant="ghost"
          class="md:hidden"
          @click="$emit('toggleMobileMenu')"
        />
      </div>
    </div>
    <USeparator />
  </header>
</template>
