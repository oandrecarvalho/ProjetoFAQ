import { api } from './api'

export const faqService = {
    getAllQuestions: async () => {
        console.log('[FAQ Service] Buscando todas as perguntas...')
        try {
            const response = await api.get('/questions')
            console.log('[FAQ Service] Resposta recebida:', response)
            return response
        } catch (error) {
            console.error('[FAQ Service] Erro ao buscar perguntas:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config
            })
            throw error
        }
    },
    createQuestion: async (data) => {
        console.log('[FAQ Service] Criando nova pergunta:', data)
        try {
            const response = await api.post('/questions', data)
            console.log('[FAQ Service] Resposta recebida:', response)
            return response
        } catch (error) {
            console.error('[FAQ Service] Erro ao criar pergunta:', error)
            throw error
        }
    },
    updateQuestion: async (id, data) => {
        console.log('[FAQ Service] Atualizando pergunta:', { id, data })
        try {
            const response = await api.put(`/questions/${id}`, data)
            console.log('[FAQ Service] Resposta recebida:', response)
            return response
        } catch (error) {
            console.error('[FAQ Service] Erro ao atualizar pergunta:', error)
            throw error
        }
    },
    deleteQuestion: async (id) => {
        console.log('[FAQ Service] Excluindo pergunta:', id)
        try {
            const response = await api.delete(`/questions/${id}`)
            console.log('[FAQ Service] Resposta recebida:', response)
            return response
        } catch (error) {
            console.error('[FAQ Service] Erro ao excluir pergunta:', error)
            throw error
        }
    }
};