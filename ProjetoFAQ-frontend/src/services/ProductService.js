export const ProductService = {
    getAllQuestions: () => api.get('/questions'),
    createQuestion: (data) => api.post('/questions', data),
    updateQuestion: (id, data) => api.put(`/questions/${id}`, data),
    deleteQuestion: (id) => api.delete(`/questions/${id}`)
};
