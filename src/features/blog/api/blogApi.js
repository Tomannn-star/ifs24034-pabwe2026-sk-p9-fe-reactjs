import api from '../../../helpers/apiHelper'

export const blogApi = {
  getCategories: () => api.get('/api/public/categories'),
  getPublicPosts: (q = '', category = '') => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category && category !== 'Semua') params.set('category', category)
    const qs = params.toString()
    return api.get(`/api/public/posts${qs ? `?${qs}` : ''}`)
  },
  getPublicPostBySlug: (slug) => api.get(`/api/public/posts/${slug}`),
  getAuthorPosts: () => api.get('/api/posts'),
  getPostStats: () => api.get('/api/posts/stats'),
  getAuthorPostByID: (id) => api.get(`/api/posts/${id}`),
  createPost: (payload) => api.post('/api/posts', payload),
  updatePost: (id, payload) => api.put(`/api/posts/${id}`, payload),
  togglePublish: (id) => api.patch(`/api/posts/${id}/toggle-publish`),
  deletePost: (id) => api.delete(`/api/posts/${id}`),
  generateAiArticle: (payload) => api.post('/api/posts/ai-generate', payload),
}

export default blogApi
