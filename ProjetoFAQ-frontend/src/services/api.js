import axios from 'axios';
import { setUserRole } from './auth';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// URL base da API
const API_URL = 'https://q6dn5s2g-5242.brs.devtunnels.ms/api';

// Função para obter o token do localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    console.log('[API] Token encontrado:', token ? 'Sim' : 'Não');
    return token ? `Bearer ${token}` : null;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    timeout: 30000,
    withCredentials: false,
    proxy: false,
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
});

// Função para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    config => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = token;
            console.log('[API] Requisição:', {
                url: config.url,
                method: config.method,
                headers: config.headers,
                data: config.data
            });
        } else {
            console.log('[API] Requisição sem token:', {
                url: config.url,
                method: config.method,
                data: config.data
            });
        }
        return config;
    },
    error => {
        console.error('[API Request Interceptor Error]', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => {
        console.log('[API] Resposta:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('[API] Erro:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            console.log('[API] Erro de autenticação detectado');
            localStorage.removeItem('token');
        }

        return Promise.reject(error);
    }
);

// Função para retry em caso de falha
const retryRequest = async (config, retries = MAX_RETRIES) => {
    try {
        return await api(config);
    } catch (error) {
        if (retries > 0 && error.response?.status >= 500) {
            console.log(`[API] Tentativa ${MAX_RETRIES - retries + 1} falhou. Tentando novamente...`);
            await delay(RETRY_DELAY);
            return retryRequest(config, retries - 1);
        }
        throw error;
    }
};

export const authService = {
    login: async (credentials) => {
        console.log('Iniciando login com:', credentials.email)
        const response = await retryRequest({ method: 'post', url: '/auth/login', data: credentials });

        // Força o papel de admin se o email contiver 'admin'
        const isAdminUser = credentials.email.toLowerCase().includes('admin')
        console.log('É admin?', isAdminUser)

        // Define o papel do usuário
        setUserRole(isAdminUser ? 'admin' : 'user')

        // Verifica se o papel foi definido corretamente
        const currentRole = localStorage.getItem('userRole')
        console.log('Papel definido como:', currentRole)

        // Armazena o token
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
        }

        return response;
    }
};

export const faqService = {
    getAllQuestions: async () => {
        console.log('[FAQ Service] Buscando todas as perguntas');
        try {
            const response = await retryRequest({ method: 'get', url: '/questions' });
            console.log('[FAQ Service] Resposta recebida:', response);
            return response;
        } catch (error) {
            console.error('[FAQ Service] Erro ao buscar perguntas:', error);
            throw error;
        }
    },
    createQuestion: (questionData) => {
        console.log('[FAQ Service] Criando pergunta:', questionData);
        return retryRequest({ method: 'post', url: '/questions', data: questionData });
    },
    updateQuestion: (id, questionData) => {
        console.log('[FAQ Service] Atualizando pergunta:', { id, questionData });
        return retryRequest({ method: 'put', url: `/questions/${id}`, data: questionData });
    },
    deleteQuestion: (id) => {
        console.log('[FAQ Service] Deletando pergunta:', id);
        return retryRequest({
            method: 'post',
            url: `/questions/${id}/delete`,
            data: { cascade: true }
        });
    }
};

export const answerService = {
    createAnswer: (questionId, data) => {
        console.log('Criando resposta:', { questionId, data })
        return retryRequest({ method: 'post', url: `/answers`, data: { ...data, questionId } })
    },
    updateAnswer: (questionId, answerId, data) => {
        console.log('Atualizando resposta:', { questionId, answerId, data })
        return retryRequest({ method: 'put', url: `/answers/${answerId}`, data: { ...data, questionId } })
    },
    deleteAnswer: (questionId, answerId) => {
        console.log('Deletando resposta:', { questionId, answerId })
        return retryRequest({ method: 'delete', url: `/answers/${answerId}` })
    }
};

export const productService = {
    getAllProducts: () => retryRequest({ method: 'get', url: '/products' }),
    getProductById: (id) => retryRequest({ method: 'get', url: `/products/${id}` }),
    createProduct: (data) => retryRequest({ method: 'post', url: '/products', data }),
    updateProduct: (id, data) => retryRequest({ method: 'put', url: `/products/${id}`, data }),
    deleteProduct: (id) => retryRequest({ method: 'delete', url: `/products/${id}` })
};

export { api }; 