<template>
  <div class="faq-container">
    <div class="faq-header">
      <h1 class="faq-title">FAQ</h1>
      <div class="faq-actions">
        <button v-if="hasPermission('create_question')" class="btn btn-primary" @click="showNewQuestionModal = true">
          <i class="fas fa-plus"></i>
          Nova Pergunta
        </button>
      </div>
    </div>

    <div class="faq-sections">
      <!-- Seção de Perguntas Não Respondidas -->
      <div class="section">
        <div class="section-header">
          <i class="fas fa-question-circle"></i>
          <h2>Perguntas Não Respondidas</h2>
        </div>
        <div class="section-content">
          <div v-if="unansweredQuestions.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nenhuma pergunta pendente.</p>
          </div>
          <QuestionCard
            v-for="question in unansweredQuestions"
            :key="question.id"
            :question="question"
            :can-answer="hasPermission('answer_question')"
            :can-delete="hasPermission('delete_question')"
            @answer="handleAnswer"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Seção de Perguntas Respondidas -->
      <div class="section">
        <div class="section-header">
          <i class="fas fa-check-circle"></i>
          <h2>Perguntas Respondidas</h2>
        </div>
        <div class="section-content">
          <div v-if="answeredQuestions.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nenhuma pergunta respondida ainda.</p>
          </div>
          <QuestionCard
            v-for="question in answeredQuestions"
            :key="question.id"
            :question="question"
            :can-answer="hasPermission('answer_question')"
            :can-delete="hasPermission('delete_question')"
            @answer="handleAnswer"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Nova Pergunta -->
    <NewQuestionModal
      v-if="showNewQuestionModal"
      :produtos="produtos"
      @close="showNewQuestionModal = false"
      @submit="handleNewQuestion"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFaqStore } from '../store/faq'
import { productService } from '../services/api'
import NewQuestionModal from '../components/faq/NewQuestionModal.vue'
import QuestionCard from '../components/faq/QuestionCard.vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { hasPermission } from '@/services/auth'

const faqStore = useFaqStore()
const router = useRouter()
const showNewQuestionModal = ref(false)
const successMessage = ref('')
const produtos = ref([])
const isLoading = ref(true)
const questions = ref([])

const answeredQuestions = computed(() => {
  console.log('Computando perguntas respondidas:', questions.value)
  if (!Array.isArray(questions.value)) {
    console.error('questions.value não é um array:', questions.value)
    return []
  }
  const answered = questions.value
    .filter(q => q && q.answer)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
  console.log('Perguntas respondidas:', answered)
  return answered
})

const unansweredQuestions = computed(() => {
  console.log('Computando perguntas não respondidas:', questions.value)
  if (!Array.isArray(questions.value)) {
    console.error('questions.value não é um array:', questions.value)
    return []
  }
  const unanswered = questions.value
    .filter(q => q && !q.answer)
    .sort((a, b) => new Date(b.data) - new Date(a.data))
  console.log('Perguntas não respondidas:', unanswered)
  return unanswered
})

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

const loadData = async () => {
  try {
    isLoading.value = true
    console.log('Iniciando carregamento de dados...')

    // Primeiro carrega as perguntas
    const questionsResponse = await faqStore.getQuestions()
    console.log('Resposta do store:', questionsResponse)

    // Atualiza o estado local com as perguntas do store
    if (Array.isArray(questionsResponse)) {
      questions.value = questionsResponse
      console.log('Estado local atualizado:', {
        questions: questions.value,
        answered: answeredQuestions.value,
        unanswered: unansweredQuestions.value
      })
    } else {
      console.error('Resposta inválida do store:', questionsResponse)
      questions.value = []
    }

    // Depois carrega os produtos
    await loadProducts()
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    Swal.fire({
      icon: 'error',
      title: 'Erro ao carregar dados',
      text: 'Não foi possível carregar as perguntas. Por favor, tente novamente.',
      confirmButtonColor: '#00FF88',
      background: '#1a1a1a',
      color: '#ffffff'
    })
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
    console.log('Recebendo nova pergunta:', questionData)
    await faqStore.addQuestion(questionData)
    showNewQuestionModal.value = false
    successMessage.value = 'Pergunta enviada com sucesso!'
    
    // Atualiza o estado local com as perguntas do store
    if (Array.isArray(faqStore.questions.value)) {
      questions.value = [...faqStore.questions.value]
      console.log('Lista de perguntas atualizada:', questions.value)
    } else {
      console.error('faqStore.questions não é um array:', faqStore.questions.value)
      questions.value = []
    }
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Erro ao adicionar pergunta:', err)
    Swal.fire({
      icon: 'error',
      title: 'Erro ao adicionar pergunta',
      text: 'Não foi possível adicionar a pergunta. Por favor, tente novamente.',
      confirmButtonColor: '#00FF88',
      background: '#1a1a1a',
      color: '#ffffff'
    })
  }
}

const handleAnswer = async (questionId) => {
  try {
    const { value: answer } = await Swal.fire({
      title: 'Responder Pergunta',
      input: 'textarea',
      inputLabel: 'Sua resposta',
      inputPlaceholder: 'Digite sua resposta aqui...',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00FF88',
      background: '#1a1a1a',
      color: '#ffffff',
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor, digite uma resposta!'
        }
      }
    })

    if (answer) {
      await faqStore.answerQuestion(questionId, answer)
      await loadData() // Recarrega os dados para atualizar a lista
      Swal.fire({
        icon: 'success',
        title: 'Resposta enviada!',
        text: 'Sua resposta foi registrada com sucesso.',
        confirmButtonColor: '#00FF88',
        background: '#1a1a1a',
        color: '#ffffff'
      })
    }
  } catch (err) {
    console.error('Erro ao responder pergunta:', err)
    Swal.fire({
      icon: 'error',
      title: 'Erro ao responder',
      text: 'Não foi possível enviar sua resposta. Por favor, tente novamente.',
      confirmButtonColor: '#00FF88',
      background: '#1a1a1a',
      color: '#ffffff'
    })
  }
}

const handleDelete = async (questionId) => {
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
      await faqStore.deleteQuestion(questionId)
      questions.value = Array.isArray(faqStore.questions.value) ? [...faqStore.questions.value] : []
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

.faq-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 80px);
  background: linear-gradient(to bottom, rgba(26, 26, 26, 0.95), rgba(26, 26, 26, 0.98));
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(0, 255, 136, 0.1);
  position: relative;
}

.faq-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100px;
  height: 2px;
  background: linear-gradient(to right, #00FF88, transparent);
}

.faq-title {
  font-size: 2.5rem;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.faq-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.875rem 1.75rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn i {
  font-size: 1.2rem;
}

.btn-primary {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 106, 0.1));
  color: #00FF88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.2));
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 8px 16px rgba(0, 255, 136, 0.15);
}

.faq-sections {
  display: grid;
  gap: 2.5rem;
}

.section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.section:hover {
  border-color: rgba(0, 255, 136, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  font-size: 1.75rem;
  color: #fff;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.section-header i {
  font-size: 1.75rem;
  color: #00FF88;
  filter: drop-shadow(0 2px 4px rgba(0, 255, 136, 0.2));
}

.section-content {
  display: grid;
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: rgba(0, 255, 136, 0.2);
  background: rgba(255, 255, 255, 0.03);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: rgba(0, 255, 136, 0.3);
  filter: drop-shadow(0 2px 4px rgba(0, 255, 136, 0.1));
}

@media (max-width: 768px) {
  .faq-container {
    padding: 1.5rem;
  }

  .faq-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    margin-bottom: 2rem;
  }

  .faq-title {
    font-size: 2rem;
    text-align: center;
  }

  .faq-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .section {
    padding: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }
}
</style>