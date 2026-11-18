import { describe, it, expect, vi } from 'vitest'
import adminApi from './adminApi'
import api from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('adminApi', () => {
  it('calls admin endpoints correctly', async () => {
    api.get.mockResolvedValue({ success: true })

    await adminApi.getUsers()
    expect(api.get).toHaveBeenCalledWith('/api/admin/users')

    await adminApi.getPosts()
    expect(api.get).toHaveBeenCalledWith('/api/admin/posts')

    await adminApi.getUserPosts(3)
    expect(api.get).toHaveBeenCalledWith('/api/admin/users/3/posts')
  })
})
