<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white">
    <NavigationBar v-if="route.name !== 'login'" :paginaAtual="route.name" @navegar="mudarPagina" />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'

const router = useRouter()
const route = useRoute()

const mudarPagina = (novaPagina) => {
  router.push({ name: novaPagina })
}
</script>