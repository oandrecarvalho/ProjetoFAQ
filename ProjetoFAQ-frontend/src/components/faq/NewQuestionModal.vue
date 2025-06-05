<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div
      class="bg-[#1a1a1a] rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
      <h2
        class="text-2xl sm:text-3xl font-semibold text-[#00FF88] font-['Playfair_Display'] tracking-wide mb-6 sm:mb-8">
        Nova Pergunta
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-6">
        <!-- Tipo de Pergunta -->
        <div class="space-y-3 sm:space-y-4">
          <label class="block text-white text-lg sm:text-xl font-['Lora']">Sobre o que você quer perguntar?</label>

          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Opção Serviços -->
            <div class="flex-1 p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-300" :class="[
              formData.tipo === 'servicos'
                ? 'border-[#00FF88] bg-[#00FF88]/10'
                : 'border-[#00FF88]/20 hover:border-[#00FF88]/50'
            ]" @click="selectTipo('servicos')">
              <div class="flex items-center space-x-3 sm:space-x-4">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center" :class="[
                  formData.tipo === 'servicos'
                    ? 'border-[#00FF88]'
                    : 'border-[#00FF88]/50'
                ]">
                  <div v-if="formData.tipo === 'servicos'" class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#00FF88] rounded-full">
                  </div>
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl text-white font-['Playfair_Display']">Serviços Gerais</h3>
                  <p class="text-sm sm:text-base text-gray-400 font-['Lora']">Dúvidas sobre entregas, pagamentos,
                    garantias, etc.</p>
                </div>
              </div>
            </div>

            <!-- Opção Produtos -->
            <div class="flex-1 p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-300" :class="[
              formData.tipo === 'produto'
                ? 'border-[#00FF88] bg-[#00FF88]/10'
                : 'border-[#00FF88]/20 hover:border-[#00FF88]/50'
            ]" @click="selectTipo('produto')">
              <div class="flex items-center space-x-3 sm:space-x-4">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center" :class="[
                  formData.tipo === 'produto'
                    ? 'border-[#00FF88]'
                    : 'border-[#00FF88]/50'
                ]">
                  <div v-if="formData.tipo === 'produto'" class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#00FF88] rounded-full">
                  </div>
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl text-white font-['Playfair_Display']">Produto Específico</h3>
                  <p class="text-sm sm:text-base text-gray-400 font-['Lora']">Dúvidas sobre características,
                    especificações, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seleção de Produto -->
        <div v-if="formData.tipo === 'produto'" class="space-y-2 sm:space-y-3">
          <label class="block text-white text-lg sm:text-xl font-['Lora']">Qual produto?</label>
          <select v-model="formData.produtoId" class="w-full px-4 sm:px-6 py-2 sm:py-3 bg-[#0a0a0a] text-white rounded-lg 
                   border-2 border-[#00FF88]/20 
                   hover:border-[#00FF88]/40
                   focus:border-[#00FF88] focus:outline-none 
                   text-base sm:text-lg font-['Lora'] 
                   transition-colors duration-300">
            <option value="" disabled>Escolha um produto</option>
            <option v-for="produto in produtos" :key="produto.id" :value="produto.id">
              {{ produto.nome }}
            </option>
          </select>
        </div>

        <!-- Campo da Pergunta -->
        <BaseInput v-model="formData.question" label="Qual é a sua dúvida?" tag="textarea" rows="3"
          placeholder="Descreva sua pergunta detalhadamente..." />

        <!-- Campo do Nome -->
        <BaseInput v-model="formData.autor" label="Seu Nome" type="text" placeholder="Como podemos te chamar?" />

        <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
          <BaseButton variant="secondary" @click="$emit('close')" class="w-full sm:w-auto">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" :disabled="!isFormValid" class="w-full sm:w-auto">
            Enviar Pergunta
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import { faqService } from '@/services/api'

export default {
  name: 'NewQuestionModal',
  components: {
    BaseButton,
    BaseInput
  },
  props: {
    produtos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        tipo: '',
        produtoId: '',
        question: '',
        autor: ''
      },
      isLoading: false,
      error: null
    }
  },
  computed: {
    isFormValid() {
      const basicValidation = this.formData.tipo &&
        this.formData.question &&
        this.formData.autor

      if (this.formData.tipo === 'produto') {
        return basicValidation && this.formData.produtoId
      }

      return basicValidation
    }
  },
  methods: {
    selectTipo(tipo) {
      this.formData.tipo = tipo
      if (tipo === 'servicos') {
        this.formData.produtoId = ''
      }
    },
    async handleSubmit() {
      if (!this.isFormValid) return

      this.isLoading = true
      this.error = null

      try {
        const questionData = {
          text: this.formData.question,
          author: this.formData.autor,
          productId: this.formData.tipo === 'produto' ? parseInt(this.formData.produtoId) : null
        }

        const response = await faqService.createQuestion(questionData)
        
        // Alerta de sucesso
        await this.$swal.fire({
          icon: 'success',
          title: 'Pergunta enviada com sucesso!',
          text: 'Sua dúvida foi registrada e será respondida em breve.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })

        this.$emit('submit', response.data)
        this.resetForm()
        this.$emit('close')
      } catch (err) {
        console.error('Error submitting question:', err)
        this.error = err.response?.data?.message || 'Erro ao enviar pergunta. Tente novamente.'
        
        // Alerta de erro
        await this.$swal.fire({
          icon: 'error',
          title: 'Ops! Algo deu errado',
          text: this.error,
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      } finally {
        this.isLoading = false
      }
    },
    resetForm() {
      this.formData = {
        tipo: '',
        produtoId: '',
        question: '',
        autor: ''
      }
      this.error = null
    }
  },
  emits: ['close', 'submit']
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #00FF88 #1a1a1a;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #00FF88;
  border-radius: 4px;
  border: 2px solid #1a1a1a;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #00cc6a;
}
</style>