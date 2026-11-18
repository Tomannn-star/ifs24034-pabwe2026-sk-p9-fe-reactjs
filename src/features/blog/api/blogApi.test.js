import { describe, it, expect, vi } from 'vitest'
import blogApi from './blogApi'
import api from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('blogApi', () => {
  it('calls correct endpoints with parameters', async () => {
    api.get.mockResolvedValue({ success: true })
    api.post.mockResolvedValue({ success: true })
    api.put.mockResolvedValue({ success: true })
    api.patch.mockResolvedValue({ success: true })
    api.delete.mockResolvedValue({ success: true })

    await blogApi.getCategories()
    expect(api.get).toHaveBeenCalledWith('/api/public/categories')

    await blogApi.getPublicPosts('react', 'Teknologi')
    expect(api.get).toHaveBeenCalledWith('/api/public/posts?q=react&category=Teknologi')

    await blogApi.getPublicPosts('', 'Semua')
    expect(api.get).toHaveBeenCalledWith('/api/public/posts')

    await blogApi.getPublicPostBySlug('judul-slug')
    expect(api.get).toHaveBeenCalledWith('/api/public/posts/judul-slug')

    await blogApi.getAuthorPosts()
    expect(api.get).toHaveBeenCalledWith('/api/posts')

    await blogApi.getPostStats()
    expect(api.get).toHaveBeenCalledWith('/api/posts/stats')

    await blogApi.getAuthorPostByID(5)
    expect(api.get).toHaveBeenCalledWith('/api/posts/5')

    await blogApi.createPost({ title: 'New' })
    expect(api.post).toHaveBeenCalledWith('/api/posts', { title: 'New' })

    await blogApi.updatePost(5, { title: 'Updated' })
    expect(api.put).toHaveBeenCalledWith('/api/posts/5', { title: 'Updated' })

    await blogApi.togglePublish(5)
    expect(api.patch).toHaveBeenCalledWith('/api/posts/5/toggle-publish')

    await blogApi.deletePost(5)
    expect(api.delete).toHaveBeenCalledWith('/api/posts/5')

    await blogApi.generateAiArticle({ topic: 'AI' })
    expect(api.post).toHaveBeenCalledWith('/api/posts/ai-generate', { topic: 'AI' })
  })
})
