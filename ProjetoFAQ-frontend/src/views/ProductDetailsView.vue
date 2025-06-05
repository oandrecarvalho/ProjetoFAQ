<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
      <!-- Cabeçalho com botão voltar -->
      <div class="p-4 border-b border-[#00FF88]/20">
        <button 
          @click="$router.push('/')"
          class="text-[#00FF88] hover:text-[#00cc6a] transition-colors font-['Orbitron'] flex items-center"
        >
          <span class="mr-2">←</span> Voltar
        </button>
      </div>

      <!-- Conteúdo do Produto -->
      <div v-if="product" class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Coluna da Esquerda - Imagem -->
          <div class="relative">
            <img 
              :src="product.image" 
              :alt="product.nome"
              class="w-[712px] h-[712px] object-cover rounded-lg"
            />
          </div>

          <!-- Coluna da Direita - Detalhes -->
          <div class="space-y-6">
            <h1 class="text-3xl font-bold text-[#00FF88] font-['Orbitron']">{{ product.nome }}</h1>
            
            <div class="text-2xl font-bold text-white">
              R$ {{ product.preco.toFixed(2) }}
            </div>

            <div class="space-y-4">
              <h2 class="text-xl font-bold text-[#00FF88] font-['Orbitron']">Características</h2>
              <p class="text-gray-300">{{ product.descricao }}</p>
            </div>

            <!-- FAQ do Produto com Dropdown -->
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold text-[#00FF88] font-['Orbitron']">Perguntas Frequentes do Produto</h2>
                <button 
                  @click="showNewQuestionModal = true"
                  class="px-4 py-2 bg-[#00FF88] text-[#1a1a1a] rounded-lg hover:bg-[#00cc6a] transition-colors font-['Orbitron']"
                >
                  Nova Pergunta
                </button>
              </div>
              <div class="space-y-2">
                <div 
                  v-for="faq in productFaqs" 
                  :key="faq.id"
                  class="bg-[#0a0a0a] rounded-lg overflow-hidden"
                >
                  <!-- Cabeçalho do Dropdown -->
                  <button 
                    @click="toggleFaq(faq.id)"
                    class="w-full p-4 flex justify-between items-center text-left hover:bg-[#1a1a1a] transition-colors"
                  >
                    <h3 class="text-lg font-semibold text-white">{{ faq.question }}</h3>
                    <span class="text-[#00FF88] transform transition-transform" :class="{ 'rotate-180': openFaqs.includes(faq.id) }">
                      ▼
                    </span>
                  </button>
                  
                  <!-- Conteúdo do Dropdown -->
                  <div 
                    v-show="openFaqs.includes(faq.id)"
                    class="p-4 border-t border-[#00FF88]/20"
                  >
                    <p class="text-gray-300 mb-2">{{ faq.answer }}</p>
                    <div class="text-sm text-[#00FF88]">
                      <p>Autor: {{ faq.autor }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="p-6 text-center text-white">
        Carregando...
      </div>
    </div>

    <!-- Modal de Nova Pergunta -->
    <div v-if="showNewQuestionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-bold text-[#00FF88] font-['Orbitron'] mb-4">Nova Pergunta</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-white mb-2">Sua Pergunta</label>
            <textarea 
              v-model="novaPergunta.question"
              class="w-full px-4 py-2 bg-[#0a0a0a] text-white rounded-lg border border-[#00FF88]/20 focus:border-[#00FF88] focus:outline-none"
              rows="3"
            ></textarea>
          </div>
          <div>
            <label class="block text-white mb-2">Seu Nome</label>
            <input 
              v-model="novaPergunta.autor"
              type="text"
              class="w-full px-4 py-2 bg-[#0a0a0a] text-white rounded-lg border border-[#00FF88]/20 focus:border-[#00FF88] focus:outline-none"
            />
          </div>
          <div class="flex justify-end space-x-4">
            <button 
              @click="showNewQuestionModal = false"
              class="px-4 py-2 text-[#00FF88] hover:text-[#00cc6a] transition-colors font-['Orbitron']"
            >
              Cancelar
            </button>
            <button 
              @click="enviarNovaPergunta"
              class="px-4 py-2 bg-[#00FF88] text-[#1a1a1a] rounded-lg hover:bg-[#00cc6a] transition-colors font-['Orbitron']"
            >
              Enviar Pergunta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService, faqService } from '@/services/api'
import Swal from 'sweetalert2'
import { hasPermission } from '@/services/auth'

export default {
  name: 'ProductDetailsView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const produto = ref(null)
    const showNewQuestionModal = ref(false)
    const novaPergunta = ref({
      question: '',
      autor: ''
    })

    const verificarAutenticacao = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Você precisa estar logado para acessar os detalhes do produto.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        }).then(() => {
          router.push('/login')
        })
        return false
      }
      return true
    }

    const verificarPermissao = (acao) => {
      if (!hasPermission(acao)) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você não tem permissão para realizar esta ação.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return false
      }
      return true
    }

    const carregarProduto = async () => {
      try {
        const response = await productService.getProductById(route.params.id)
        produto.value = response.data
      } catch (error) {
        console.error('Erro ao carregar produto:', error)
        Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar produto',
          text: 'Não foi possível carregar os detalhes do produto. Por favor, tente novamente.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      }
    }

    const enviarNovaPergunta = async () => {
      if (!verificarPermissao('create:question')) return

      if (!novaPergunta.value.question.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao enviar pergunta',
          text: 'Por favor, digite sua pergunta.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
        return
      }

      try {
        await faqService.createQuestion({
          text: novaPergunta.value.question,
          author: novaPergunta.value.autor,
          productId: produto.value.id
        })

        showNewQuestionModal.value = false
        novaPergunta.value = {
          question: '',
          autor: ''
        }

        Swal.fire({
          icon: 'success',
          title: 'Pergunta enviada!',
          text: 'Sua pergunta foi enviada com sucesso.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      } catch (error) {
        console.error('Erro ao enviar pergunta:', error)
        Swal.fire({
          icon: 'error',
          title: 'Erro ao enviar pergunta',
          text: 'Não foi possível enviar sua pergunta. Por favor, tente novamente.',
          confirmButtonColor: '#00FF88',
          background: '#1a1a1a',
          color: '#ffffff'
        })
      }
    }

    onMounted(async () => {
      if (verificarAutenticacao()) {
        await carregarProduto()
      }
    })

    return {
      produto,
      showNewQuestionModal,
      novaPergunta,
      enviarNovaPergunta
    }
  }
}
</script> 