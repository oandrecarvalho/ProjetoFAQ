<template>
    <nav class="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <!-- Logo e Links -->
                <div class="flex items-center space-x-12">
                    <router-link to="/" class="flex items-center space-x-3 group">
                        <div
                            class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00FF88] to-[#00cc6a] flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
                            <span class="text-2xl font-bold text-white">F</span>
                        </div>
                        <span
                            class="text-2xl font-bold text-white group-hover:text-[#00FF88] transition-colors duration-300">
                            FAQ System
                        </span>
                    </router-link>
                    <div class="hidden md:flex space-x-8">
                        <router-link to="/" class="nav-link">
                            <span class="relative">
                                Produtos
                                <span
                                    class="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00FF88] transform scale-x-0 transition-transform duration-300 origin-left"></span>
                            </span>
                        </router-link>
                        <router-link to="/faq" class="nav-link">
                            <span class="relative">
                                FAQ
                                <span
                                    class="absolute -bottom-1 left-0 w-full h-0.5 bg-[#00FF88] transform scale-x-0 transition-transform duration-300 origin-left"></span>
                            </span>
                        </router-link>
                    </div>
                </div>

                <!-- Botão de Login -->
                <div class="flex items-center">
                    <router-link to="/login" class="login-button group">
                        <span class="relative z-10">Sair</span>
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-[#00FF88] to-[#00cc6a] rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left">
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'NavigationBar'
}
</script>

<style scoped>
/* Smooth scroll behavior for the entire page */
html {
    scroll-behavior: smooth;
}

.nav-link {
    @apply px-3 py-2 text-base font-medium text-gray-300 hover:text-white transition-colors duration-300;
}

.nav-link:hover span span {
    @apply scale-x-100;
}

.login-button {
    @apply relative px-6 py-2.5 text-sm font-medium text-white bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#00FF88]/30 hover:border-[#00FF88] transition-all duration-300;
}

.router-link-active {
    @apply text-white;
}

.router-link-active span span {
    @apply scale-x-100;
}

/* Efeito de brilho no hover */
.nav-link:hover {
    text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.login-button:hover {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}
</style>