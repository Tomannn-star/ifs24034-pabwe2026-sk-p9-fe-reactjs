import { describe, it, expect, vi } from 'vitest'
import authApi from './authApi'
import api from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('authApi', () => {
  it('calls correct endpoints with parameters', async () => {
    api.post.mockResolvedValue({ success: true })
    api.get.mockResolvedValue({ success: true })
    api.put.mockResolvedValue({ success: true })

    await authApi.login({ username: 'user', password: 'pwd' })
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', { username: 'user', password: 'pwd' })

    await authApi.register({ name: 'User', username: 'user', email: 'u@delcom.org', password: 'pwd' })
    expect(api.post).toHaveBeenCalledWith('/api/auth/register', { name: 'User', username: 'user', email: 'u@delcom.org', password: 'pwd' })

    await authApi.logout()
    expect(api.post).toHaveBeenCalledWith('/api/auth/logout')

    await authApi.getProfile()
    expect(api.get).toHaveBeenCalledWith('/api/auth/profile')

    await authApi.updateProfile({ name: 'New Name' })
    expect(api.put).toHaveBeenCalledWith('/api/auth/profile', { name: 'New Name' })
  })
})
