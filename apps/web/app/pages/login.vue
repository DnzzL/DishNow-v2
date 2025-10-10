<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

const fields = [{
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
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  try {
    const { $pb } = useNuxtApp()
    await $pb.collection('users').authWithPassword(payload.data.email, payload.data.password)
    toast.add({
      title: 'Login successful!',
      description: 'Welcome back.',
      color: 'success'
    })
    await navigateTo('/')
  } catch (error: any) {
    toast.add({
      title: 'Login failed',
      description: error.message || 'Invalid email or password.',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="w-full max-w-md animate-fade-in">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <div class="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <UIcon name="i-lucide-utensils-crossed" class="text-3xl text-white" />
          </div>
        </div>
        <h1 class="text-2xl font-bold gradient-text mb-2">DishNow</h1>
        <p class="text-gray-600 dark:text-gray-400">Welcome back to your recipe collection</p>
      </div>

      <!-- Login Form -->
      <UCard class="glass shadow-xl">
        <UAuthForm
          :schema="schema"
          :fields="fields"
          title="Sign In"
          icon="i-lucide-user"
          @submit="onSubmit"
          :ui="{ container: 'space-y-6' }"
        >
          <template #description>
            Don't have an account?
            <ULink to="/signup" class="text-primary font-medium hover:underline">
              Create one here
            </ULink>
          </template>

          <template #password-hint>
            <div class="flex justify-end">
              <ULink to="#" class="text-primary font-medium text-sm hover:underline" tabindex="-1">
                Forgot password?
              </ULink>
            </div>
          </template>

          <!-- Divider -->
          <template #after-fields>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <USeparator class="w-full" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <!-- Social Login Buttons -->
            <div class="grid grid-cols-2 gap-3">
              <UButton
                color="white"
                variant="outline"
                size="lg"
                class="justify-center"
                @click="handleSocialLogin('google')"
              >
                <UIcon name="i-lucide-chrome" class="w-4 h-4" />
                Google
              </UButton>
              <UButton
                color="white"
                variant="outline"
                size="lg"
                class="justify-center"
                @click="handleSocialLogin('github')"
              >
                <UIcon name="i-lucide-github" class="w-4 h-4" />
                GitHub
              </UButton>
            </div>
          </template>

          <template #footer>
            <div class="text-center text-xs text-gray-500">
              By signing in, you agree to our
              <ULink to="#" class="text-primary font-medium hover:underline">Terms of Service</ULink>
              and
              <ULink to="#" class="text-primary font-medium hover:underline">Privacy Policy</ULink>
            </div>
          </template>
        </UAuthForm>
      </UCard>

      <!-- Quick Links -->
      <div class="mt-6 text-center space-y-2">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          New to DishNow?
          <ULink to="/signup" class="text-primary font-medium hover:underline">
            Start your culinary journey
          </ULink>
        </p>
      </div>
    </div>
  </div>
</template>
