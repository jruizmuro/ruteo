<script setup lang="ts">
useSeoMeta({ robots: 'noindex,nofollow' })

const nuxtApp = useNuxtApp()
const authStore = useAuthStore()

onMounted(async () => {
  const supabase = nuxtApp.$supabase
  if (!supabase) {
    await navigateTo('/')
    return
  }
  await authStore.fetchUser(supabase)
  await navigateTo('/')
})
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center">
    <UIcon name="i-heroicons-arrow-path" class="size-10 animate-spin text-primary" />
  </div>
</template>
