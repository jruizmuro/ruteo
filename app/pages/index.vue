<script setup lang="ts">
useSeoMeta({
  title: 'Ruteo — Rutas circulares para runners y ciclistas',
  description: 'Define distancia y desnivel; Ruteo genera la ruta circular ideal.',
})
</script>

<template>
  <main
    class="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center"
  >
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Ruteo</h1>
    <p class="text-lg text-neutral-600 dark:text-neutral-400">
      Planificador de rutas circulares para runners y ciclistas.
    </p>
    <UButton to="/planner" size="xl" color="primary"> Planificar mi ruta </UButton>
  </main>
</template>
