import { ref } from 'vue'
import { faqService, answerService } from '../services/api'

// Inicialização do estado
const questions = ref([])
const error = ref(null)

const faqStore = {
    questions,
    error,
    async getQuestions() {
        try {
            console.log('Buscando perguntas...')
            const response = await faqService.getAllQuestions()
            console.log('Resposta da API:', response)

            if (!response || !response.data) {
                console.error('Resposta inválida da API:', response)
                error.value = 'Resposta inválida do servidor'
                questions.value = []
                return []
            }

            // Garantir que response.data seja um array
            const questionsData = Array.isArray(response.data) ? response.data : [response.data]
            console.log('Dados brutos das perguntas:', questionsData)

            const processedQuestions = questionsData.map(q => {
                console.log('Processando pergunta:', q)
                const processed = {
                    id: q.id,
                    question: q.text || q.question,
                    answer: q.answer?.text || q.answer || null,
                    autor: q.author || q.autor || 'Anônimo',
                    data: q.createdAt ? new Date(q.createdAt) : new Date(),
                    productId: q.productId || null,
                    type: q.type || 'GENERAL'
                }
                console.log('Pergunta processada:', processed)
                return processed
            })

            console.log('Todas as perguntas processadas:', processedQuestions)
            questions.value = processedQuestions
            return processedQuestions
        } catch (err) {
            console.error('Erro ao buscar perguntas:', err)
            error.value = err.message || 'Erro ao buscar perguntas'
            questions.value = []
            return []
        }
    },
    async addQuestion(questionData) {
        try {
            console.log('Adicionando pergunta:', questionData)
            const response = await faqService.createQuestion({
                text: questionData.text || questionData.question,
                author: questionData.author || 'Anônimo',
                productId: questionData.productId || null,
                type: questionData.productId ? 'PRODUCT' : 'GENERAL'
            })
            console.log('Resposta da API:', response)

            if (!response.data) {
                throw new Error('Resposta inválida do servidor')
            }

            const newQuestion = {
                id: response.data.id,
                question: response.data.text || response.data.question,
                answer: null,
                autor: response.data.author || questionData.author || 'Anônimo',
                data: new Date(response.data.createdAt || new Date()),
                productId: response.data.productId || questionData.productId || null,
                type: response.data.type || (questionData.productId ? 'PRODUCT' : 'GENERAL')
            }

            console.log('Nova pergunta processada:', newQuestion)
            questions.value = [...questions.value, newQuestion]
            return newQuestion
        } catch (err) {
            console.error('Erro ao adicionar pergunta:', err)
            error.value = err.message || 'Erro ao adicionar pergunta. Por favor, tente novamente.'
            throw error.value
        }
    },
    async updateQuestion(id, questionData) {
        try {
            if (questionData.answer) {
                const answerResponse = await answerService.createAnswer(id, {
                    text: questionData.answer,
                    author: 'Admin'
                })

                if (!answerResponse.data) {
                    throw new Error('Resposta inválida do servidor')
                }

                questions.value = questions.value.map(q =>
                    q.id === id
                        ? { ...q, answer: answerResponse.data.text }
                        : q
                )

                return questions.value.find(q => q.id === id)
            } else {
                const response = await faqService.updateQuestion(id, {
                    text: questionData.question
                })

                if (!response.data) {
                    throw new Error('Resposta inválida do servidor')
                }

                questions.value = questions.value.map(q =>
                    q.id === id
                        ? { ...q, question: response.data.text }
                        : q
                )

                return questions.value.find(q => q.id === id)
            }
        } catch (err) {
            console.error('Erro ao atualizar pergunta:', err)
            error.value = err.message || 'Erro ao atualizar pergunta. Por favor, tente novamente.'
            throw error.value
        }
    },
    async deleteQuestion(id) {
        try {
            await faqService.deleteQuestion(id)
            questions.value = questions.value.filter(q => q.id !== id)
        } catch (err) {
            console.error('Erro ao deletar pergunta:', err)
            error.value = err.message || 'Erro ao deletar pergunta. Por favor, tente novamente.'
            throw error.value
        }
    }
}

export const faqPlugin = {
    install(app) {
        app.provide('faqStore', faqStore)
    }
}

export const useFaqStore = () => faqStore 