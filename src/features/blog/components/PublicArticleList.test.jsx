import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PublicArticleList from './PublicArticleList'
import blogApi from '../api/blogApi'

vi.mock('../api/blogApi', () => ({
  default: {
    getPublicPosts: vi.fn(),
  },
}))

describe('PublicArticleList', () => {
  const mockOnSelectArticle = vi.fn()

  const samplePosts = [
    {
      id: 1,
      title: 'Artikel React Modern',
      slug: 'artikel-react-modern',
      category: 'Teknologi',
      excerpt: 'Panduan lengkap React',
      content: 'Isi lengkap artikel...',
      cover_image_path: 'https://img.com/cover.jpg',
      reading_time: 3,
      published_at: '2026-11-18T10:00:00Z',
      author_name: 'Ubaid',
    },
    {
      id: 2,
      title: 'Artikel Tanpa Cover',
      slug: 'artikel-tanpa-cover',
      category: '',
      excerpt: '',
      content: 'Isi panjang...',
      cover_image_path: '',
      reading_time: 2,
      published_at: '',
      created_at: '2026-11-18T10:00:00Z',
      author_name: '',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially and then displays articles', async () => {
    blogApi.getPublicPosts.mockResolvedValueOnce({ data: samplePosts })

    render(<PublicArticleList searchQuery="" onSelectArticle={mockOnSelectArticle} />)

    expect(screen.getAllByTestId('article-skeleton').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Artikel React Modern' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Artikel Tanpa Cover' })).toBeInTheDocument()
    })

    // Click article
    fireEvent.click(screen.getByRole('heading', { name: 'Artikel React Modern' }))
    expect(mockOnSelectArticle).toHaveBeenCalledWith('artikel-react-modern')
  })

  it('filters by category pills', async () => {
    blogApi.getPublicPosts.mockResolvedValue({ data: [samplePosts[0]] })

    render(<PublicArticleList searchQuery="" onSelectArticle={mockOnSelectArticle} />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Artikel React Modern' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))

    await waitFor(() => {
      expect(blogApi.getPublicPosts).toHaveBeenCalledWith('', 'Teknologi')
    })
  })

  it('displays empty state when no articles returned or error occurs', async () => {
    blogApi.getPublicPosts.mockResolvedValueOnce({})

    render(<PublicArticleList searchQuery="notfound" onSelectArticle={mockOnSelectArticle} />)

    await waitFor(() => {
      expect(screen.getByText('Tidak ada artikel ditemukan')).toBeInTheDocument()
    })

    // Error branch
    blogApi.getPublicPosts.mockRejectedValueOnce(new Error('Network error'))
    fireEvent.click(screen.getByText('Bisnis'))

    await waitFor(() => {
      expect(screen.getByText('Tidak ada artikel ditemukan')).toBeInTheDocument()
    })
  })
})
