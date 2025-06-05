<template>
  <div class="bg-[#0a0a0a] rounded-lg overflow-hidden font-['Lora']">
    <button 
      @click="$emit('toggle')"
      class="w-full p-6 flex justify-between items-center text-left hover:bg-[#1a1a1a] transition-colors"
    >
      <h3 class="text-2xl font-medium text-white leading-relaxed font-['Playfair_Display']">
        {{ question }}
      </h3>
      <span 
        class="text-[#00FF88] transform transition-transform text-xl"
        :class="{ 'rotate-180': isOpen }"
      >
        ▼
      </span>
    </button>
    
    <div v-show="isOpen" class="p-6 border-t border-[#00FF88]/20">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FaqCard',
  props: {
    question: {
      type: String,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle']
}
</script> 