import api from '../../../helpers/apiHelper'

export const adminApi = {
  getUsers: () => api.get('/api/admin/users'),
  getPosts: () => api.get('/api/admin/posts'),
  getUserPosts: (userId) => api.get(`/api/admin/users/${userId}/posts`),
}

export default adminApi
