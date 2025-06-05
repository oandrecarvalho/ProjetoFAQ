<template>
  <div class="space-y-2 sm:space-y-3">
    <label v-if="label" class="block text-white text-lg sm:text-xl mb-2 sm:mb-3 font-['Lora']">{{ label }}</label>
    <component
      :is="tag"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#0a0a0a] text-white rounded-lg border border-[#00FF88]/20 focus:border-[#00FF88] focus:outline-none text-base sm:text-lg font-['Lora']"
      :class="{ 'border-red-500': error }"
      v-bind="$attrs"
    />
    <p v-if="error" class="text-red-500 text-base sm:text-lg mt-2 sm:mt-3 font-['Lora']">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: 'input',
      validator: value => ['input', 'textarea', 'select'].includes(value)
    }
  },
  emits: ['update:modelValue']
}
</script> 