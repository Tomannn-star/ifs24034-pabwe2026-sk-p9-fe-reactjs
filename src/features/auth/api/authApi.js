import api from '../../../helpers/apiHelper'

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (payload) => api.post('/api/auth/register', payload),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (payload) => api.put('/api/auth/profile', payload),
}

export default authApi
