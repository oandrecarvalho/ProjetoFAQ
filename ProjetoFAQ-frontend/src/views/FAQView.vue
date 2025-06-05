<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Cabeçalho -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">FAQ</h1>
        <p class="text-gray-400">Gerencie as perguntas frequentes do sistema</p>
      </div>
      <BaseButton @click="showNewQuestionModal = true" class="bg-primary hover:bg-primary-dark flex items-center gap-2">
        Nova Pergunta
      </BaseButton>
    </div>

    <!-- Mensagem de sucesso -->
    <div v-if="successMessage" class="mb-4 p-4 bg-[#00FF88]/20 text-[#00FF88] rounded-lg">
      {{ successMessage }}
    </div>

    <!-- Lista de FAQs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Perguntas sem resposta -->
      <div v-for="faq in unansweredQuestions" :key="faq.id"
        class="bg-dark/50 rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-colors">
        <div class="flex flex-col h-full">
          <div class="flex-1">
            <p class="text-white text-lg mb-2">{{ faq.question }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>{{ faq.autor }}</span>
              <span>{{ formatDate(faq.data) }}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <BaseButton @click="toggleResponseForm(faq.id)" class="bg-primary hover:bg-primary-dark flex-1">
              Responder
            </BaseButton>
            <BaseButton @click="deleteQuestion(faq.id)"
              class="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 flex-1">
              Excluir
            </BaseButton>
          </div>

          <!-- Formulário de resposta -->
          <div v-if="activeResponseForm === faq.id" class="mt-4 pt-4 border-t border-gray-800">
            <div class="mb-4">
              <BaseInput v-model="responseText" placeholder="Digite sua resposta..."
                class="w-full bg-dark/50 border-gray-700 focus:border-primary" :error="responseError" />
              <p v-if="responseError" class="text-red-500 text-sm mt-1">{{ responseError }}</p>
            </div>
            <div class="flex justify-end gap-2">
              <BaseButton @click="cancelResponse" class="bg-gray-700 hover:bg-gray-600">
                Cancelar
              </BaseButton>
              <BaseButton @click="submitResponse(faq.id)" class="bg-primary hover:bg-primary-dark"
                :disabled="!responseText">
                Enviar Resposta
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Perguntas respondidas -->
      <div v-for="faq in answeredQuestions" :key="faq.id"
        class="bg-dark/50 rounded-xl p-6 border border-gray-800 hover:border-primary/50 transition-colors">
        <div class="flex flex-col h-full">
          <div class="flex-1">
            <p class="text-white text-lg mb-2">{{ faq.question }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>{{ faq.autor }}</span>
              <span>{{ formatDate(faq.data) }}</span>
            </div>
            <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p class="text-white">{{ faq.answer }}</p>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <BaseButton @click="deleteQuestion(faq.id)"
              class="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 w-full">
              Excluir
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Mensagem quando não há perguntas -->
      <div v-if="!isLoading && (!questions || questions.length === 0)"
        class="col-span-full text-center py-12 bg-dark/50 rounded-xl">
        <p class="text-white text-lg">Nenhuma pergunta encontrada.</p>
        <p class="text-gray-400 mt-2">Clique em "Nova Pergunta" para começar.</p>
      </div>
    </div>

    <!-- Modal de nova pergunta -->
    <NewQuestionModal v-if="showNewQuestionModal" :show="showNewQuestionModal" @close="showNewQuestionModal = false"
      @submit="handleNewQuestion" :produtos="produtos" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFaqStore } from '../store/faq'
import BaseButton from '../components/base/BaseButton.vue'
import BaseInput from '../components/base/BaseInput.vue'
import { productService } from '../services/api'
import NewQuestionModal from '../components/faq/NewQuestionModal.vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { hasPermission } from '@/services/auth'

const faqStore = useFaqStore()
const router = useRouter()
const showNewQuestionModal = ref(false)
const activeResponseForm = ref(null)
const responseText = ref('')
const responseError = ref('')
const successMessage = ref('')
const produtos = ref([])
const isLoading = ref(true)
const questions = ref([])

const answeredQuestions = computed(() => {
  if (!Array.isArray(questions.value)) return []
  return questions.value.filter(q => q && q.answer)
})

const unansweredQuestions = computed(() => {
  if (!Array.isArray(questions.value)) return []
  return questions.value.filter(q => q && !q.answer)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const verificarAutenticacao = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Você precisa estar logado para acessar o FAQ.',
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

const loadData = async () => {
  try {
    isLoading.value = true
    console.log('Iniciando carregamento de dados...')

    // Primeiro carrega as perguntas
    const questionsResponse = await faqStore.getQuestions()
    console.log('Perguntas carregadas:', questionsResponse)

    // Depois carrega os produtos
    const productsResponse = await loadProducts()
    console.log('Produtos carregados:', productsResponse)

    // Atualiza o estado local com as perguntas do store
    questions.value = faqStore.questions.value
    console.log('Estado atualizado:', {
      questions: questions.value,
      answered: answeredQuestions.value,
      unanswered: unansweredQuestions.value
    })
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    successMessage.value = 'Erro ao carregar dados. Por favor, tente novamente.'
  } finally {
    isLoading.value = false
  }
}

const loadProducts = async () => {
  try {
    const response = await productService.getAllProducts()
    produtos.value = response.data
    return response.data
  } catch (err) {
    console.error('Erro ao carregar produtos:', err)
    throw err
  }
}

const handleNewQuestion = async (questionData) => {
  try {
    await faqStore.addQuestion(questionData)
    showNewQuestionModal.value = false
    successMessage.value = 'Pergunta enviada com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
    
    // Atualiza a lista de perguntas
    questions.value = [...faqStore.questions]
  } catch (err) {
    console.error('Erro ao adicionar pergunta:', err)
    successMessage.value = 'Erro ao adicionar pergunta. Por favor, tente novamente.'
  }
}

const toggleResponseForm = (id) => {
  if (activeResponseForm.value === id) {
    activeResponseForm.value = null
    responseText.value = ''
    responseError.value = ''
  } else {
    activeResponseForm.value = id
  }
}

const cancelResponse = () => {
  activeResponseForm.value = null
  responseText.value = ''
  responseError.value = ''
}

const submitResponse = async (id) => {
  if (!verificarPermissao('create:question')) return

  if (!responseText.value.trim()) {
    responseError.value = 'Por favor, digite uma resposta'
    return
  }

  try {
    await faqStore.updateQuestion(id, {
      answer: responseText.value.trim()
    })

    // Atualiza a lista de perguntas após a resposta
    questions.value = [...faqStore.questions]

    successMessage.value = 'Resposta enviada com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

    responseText.value = ''
    activeResponseForm.value = null
  } catch (err) {
    console.error('Erro ao enviar resposta:', err)
    responseError.value = 'Erro ao enviar resposta. Por favor, tente novamente.'
  }
}

const deleteQuestion = async (id) => {
  if (!verificarPermissao('delete:question')) return

  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: "Esta ação não poderá ser revertida!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#00FF88',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar',
    background: '#1a1a1a',
    color: '#ffffff'
  })

  if (result.isConfirmed) {
    try {
      await faqStore.deleteQuestion(id)
      // Atualiza a lista de perguntas após a exclusão
      questions.value = [...faqStore.questions]
      successMessage.value = 'Pergunta excluída com sucesso!'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (err) {
      console.error('Erro ao excluir pergunta:', err)
      Swal.fire({
        icon: 'error',
        title: 'Erro ao excluir pergunta',
        text: 'Não foi possível excluir a pergunta. Por favor, tente novamente.',
        confirmButtonColor: '#00FF88',
        background: '#1a1a1a',
        color: '#ffffff'
      })
    }
  }
}

onMounted(async () => {
  console.log('Componente montado, iniciando carregamento...')
  if (verificarAutenticacao()) {
    await loadData()
  }
})
</script>

<style scoped>
.bg-dark {
  background-color: #1a1a1a;
}
</style>