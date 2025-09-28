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
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Create Account"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account? <ULink to="/login" class="text-primary font-medium">Sign in</ULink>.
        </template>

        <template #footer>
          By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
