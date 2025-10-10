<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

const fields = [{
  name: 'username',
  type: 'text' as const,
  label: 'Username',
  placeholder: 'Enter your username',
  required: true
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'passwordConfirm',
  label: 'Confirm Password',
  type: 'password' as const,
  placeholder: 'Confirm your password'
}]

const schema = z.object({
  username: z.string('Username is required').min(3, 'Must be at least 3 characters'),
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
  passwordConfirm: z.string('Password confirmation is required')
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    const { $pb } = useNuxtApp()
    await $pb.collection('users').create({
      username: payload.data.username,
      email: payload.data.email,
      password: payload.data.password,
      passwordConfirm: payload.data.passwordConfirm
    })
    toast.add({
      title: 'Account created successfully!',
      description: 'You can now sign in with your credentials.',
      color: 'success'
    })
    await navigateTo('/login')
  } catch (error: any) {
    toast.add({
      title: 'Signup failed',
      description: error.message || 'An error occurred during signup.',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="w-full max-w-md animate-fade-in">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="p-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
            <UIcon name="i-lucide-user-plus" class="text-3xl text-white" />
          </div>
        </div>
        <h1 class="text-2xl font-bold gradient-text mb-2">Join DishNow</h1>
        <p class="text-gray-600 dark:text-gray-400">Start your culinary journey today</p>
      </div>

      <!-- Signup Form -->
      <UCard class="glass shadow-xl">
        <UAuthForm
          :schema="schema"
          :fields="fields"
          title="Create Account"
          icon="i-lucide-user-plus"
          @submit="onSubmit"
          :ui="{ container: 'space-y-6' }"
        >
          <template #description>
            Already have an account? 
            <ULink to="/login" class="text-primary font-medium hover:underline">
              Sign in here
            </ULink>
          </template>

          <!-- Password Strength Indicator -->
          <template #after-fields>
            <UAlert color="blue" variant="soft" icon="i-lucide-shield-check">
              <template #description>
                Your password should be at least 8 characters long for security.
              </template>
            </UAlert>
          </template>
          
          <template #footer>
            <div class="text-center text-xs text-gray-500">
              By creating an account, you agree to our 
              <ULink to="#" class="text-primary font-medium hover:underline">Terms of Service</ULink> 
              and 
              <ULink to="#" class="text-primary font-medium hover:underline">Privacy Policy</ULink>
            </div>
          </template>
        </UAuthForm>
      </UCard>

      <!-- Benefits -->
      <div class="mt-6 text-center">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="space-y-1">
            <UIcon name="i-lucide-book-open" class="text-xl text-primary mx-auto" />
            <p class="text-xs text-gray-600">Save Recipes</p>
          </div>
          <div class="space-y-1">
            <UIcon name="i-lucide-users" class="text-xl text-primary mx-auto" />
            <p class="text-xs text-gray-600">Share & Discover</p>
          </div>
          <div class="space-y-1">
            <UIcon name="i-lucide-sparkles" class="text-xl text-primary mx-auto" />
            <p class="text-xs text-gray-600">AI-Powered</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
