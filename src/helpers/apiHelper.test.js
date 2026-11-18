import { describe, it, expect, beforeEach, vi } from 'vitest'
import api, {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  request,
} from './apiHelper'

describe('apiHelper', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('manages token in localStorage correctly', () => {
    expect(getToken()).toBeNull()
    setToken('sample-jwt-token')
    expect(getToken()).toBe('sample-jwt-token')
    removeToken()
    expect(getToken()).toBeNull()
  })

  it('manages user in localStorage correctly and handles corrupt JSON', () => {
    expect(getUser()).toBeNull()
    const userObj = { id: 1, name: 'Penulis' }
    setUser(userObj)
    expect(getUser()).toEqual(userObj)

    localStorage.setItem('delcom_blog_user', 'invalid-json')
    expect(getUser()).toBeNull()

    removeUser()
    expect(getUser()).toBeNull()
  })

  it('executes successful request with token and json body', async () => {
    setToken('mock-token')
    const mockResponseData = { success: true, data: { id: 10 } }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseData,
    })

    const result = await request('/api/posts', {
      method: 'POST',
      body: { title: 'New Post' },
      headers: { 'X-Custom': 'Val' },
    })

    expect(fetch).toHaveBeenCalledWith('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom': 'Val',
        Authorization: 'Bearer mock-token',
      },
      body: JSON.stringify({ title: 'New Post' }),
    })
    expect(result).toEqual(mockResponseData)
  })

  it('handles 204 No Content response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    })

    const result = await request('/api/posts/1', { method: 'DELETE' })
    expect(result).toBeNull()
  })

  it('handles non-json successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Not JSON')
      },
    })

    const result = await request('/api/text')
    expect(result).toBeNull()
  })

  it('handles error response with message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad request payload' }),
    })

    await expect(request('/api/fail')).rejects.toThrow('Bad request payload')
  })

  it('handles error response with fallback error field or status', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden access' }),
    })

    await expect(request('/api/forbidden')).rejects.toThrow('Forbidden access')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('No body')
      },
    })

    await expect(request('/api/crash')).rejects.toThrow('HTTP error! status: 500')
  })

  it('supports api helper shortcut methods', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })

    await api.get('/api/test')
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'GET' }))

    await api.post('/api/test', { a: 1 })
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'POST' }))

    await api.put('/api/test', { b: 2 })
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'PUT' }))

    await api.patch('/api/test', { c: 3 })
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'PATCH' }))

    await api.delete('/api/test')
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'DELETE' }))
  })
})
