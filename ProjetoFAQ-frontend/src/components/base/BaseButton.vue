<template>
  <button 
    :class="[
      'px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-[\'Playfair_Display\'] text-base sm:text-xl',
      variants[variant],
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'toggle'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      variants: {
        primary: 'bg-[#00FF88] text-[#1a1a1a] hover:bg-[#00cc6a]',
        secondary: 'text-[#00FF88] hover:text-[#00cc6a]',
        toggle: 'border border-[#00FF88]/20 hover:border-[#00FF88]'
      }
    }
  }
}
</script> 