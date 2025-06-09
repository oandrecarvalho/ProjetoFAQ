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

            if (questionsData.length === 0) {
                console.log('Nenhuma pergunta encontrada')
                questions.value = []
                return []
            }

            const processedQuestions = questionsData.map(q => {
                console.log('Processando pergunta:', q)
                const processed = {
                    id: q.id,
                    question: q.text || q.question,
                    answer: q.answers && q.answers.length > 0 ? q.answers[0].text : null,
                    autor: q.author || q.autor || 'Anônimo',
                    data: q.createdAt ? new Date(q.createdAt) : new Date(),
                    productId: q.productId || null,
                    type: q.type || 'GENERAL'
                }
                console.log('Pergunta processada:', processed)
                return processed
            })

            console.log('Perguntas processadas:', processedQuestions)
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

            // Buscar todas as perguntas novamente para garantir consistência
            await this.getQuestions()
            return response.data
        } catch (err) {
            console.error('Erro ao adicionar pergunta:', err)
            error.value = err.message || 'Erro ao adicionar pergunta. Por favor, tente novamente.'
            throw error.value
        }
    },
    async updateQuestion(id, questionData) {
        try {
            console.log('Atualizando pergunta:', { id, questionData })
            if (questionData.answer) {
                console.log('Criando resposta para pergunta:', id)
                const answerResponse = await answerService.createAnswer(id, {
                    text: questionData.answer,
                    author: 'Admin'
                })
                console.log('Resposta da API (answer):', answerResponse)

                if (!answerResponse.data) {
                    throw new Error('Resposta inválida do servidor')
                }

                const updatedQuestions = questions.value.map(q => {
                    if (q.id === id) {
                        console.log('Atualizando pergunta com resposta:', q.id)
                        return { ...q, answer: answerResponse.data.text }
                    }
                    return q
                })
                console.log('Perguntas atualizadas:', updatedQuestions)
                questions.value = updatedQuestions

                return questions.value.find(q => q.id === id)
            } else {
                console.log('Atualizando texto da pergunta:', id)
                const response = await faqService.updateQuestion(id, {
                    text: questionData.question
                })
                console.log('Resposta da API (update):', response)

                if (!response.data) {
                    throw new Error('Resposta inválida do servidor')
                }

                const updatedQuestions = questions.value.map(q => {
                    if (q.id === id) {
                        console.log('Atualizando texto da pergunta:', q.id)
                        return { ...q, question: response.data.text }
                    }
                    return q
                })
                console.log('Perguntas atualizadas:', updatedQuestions)
                questions.value = updatedQuestions

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
            return true
        } catch (err) {
            console.error('Erro ao deletar pergunta:', err)
            error.value = err.message || 'Erro ao deletar pergunta. Por favor, tente novamente.'
            throw error.value
        }
    },
    async answerQuestion(id, answer) {
        try {
            console.log('Respondendo pergunta:', { id, answer })
            const response = await answerService.createAnswer(id, {
                text: answer,
                author: 'Admin'
            })
            console.log('Resposta da API:', response)

            if (!response.data) {
                throw new Error('Resposta inválida do servidor')
            }

            // Atualiza a pergunta localmente
            const updatedQuestions = questions.value.map(q => {
                if (q.id === id) {
                    return { ...q, answer: response.data.text }
                }
                return q
            })
            questions.value = updatedQuestions

            return response.data
        } catch (err) {
            console.error('Erro ao responder pergunta:', err)
            error.value = err.message || 'Erro ao responder pergunta. Por favor, tente novamente.'
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