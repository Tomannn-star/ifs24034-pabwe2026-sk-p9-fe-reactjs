import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PublicArticleDetail from './PublicArticleDetail'
import blogApi from '../api/blogApi'

vi.mock('../api/blogApi', () => ({
  default: {
    getPublicPostBySlug: vi.fn(),
  },
}))

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ initialValue }) => <div data-testid="mock-markdown-viewer">{initialValue}</div>,
}))

describe('PublicArticleDetail', () => {
  const mockOnBack = vi.fn()

  const samplePost = {
    id: 1,
    title: 'Masa Depan AI di Delcom',
    slug: 'masa-depan-ai-di-delcom',
    category: 'Teknologi',
    excerpt: 'Eksplorasi kecerdasan buatan',
    content: '## Konten Lengkap Markdown\nIsi artikel...',
    cover_image_path: 'https://img.com/ai.jpg',
    reading_time: 4,
    published_at: '2026-11-18T10:00:00Z',
    author_name: 'Abdullah',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and renders article detail with full elements', async () => {
    blogApi.getPublicPostBySlug.mockResolvedValueOnce({ data: samplePost })

    render(<PublicArticleDetail slug="masa-depan-ai-di-delcom" onBack={mockOnBack} isDark={true} />)

    await waitFor(() => {
      expect(screen.getByText('Masa Depan AI di Delcom')).toBeInTheDocument()
      expect(screen.getByText('Eksplorasi kecerdasan buatan')).toBeInTheDocument()
      expect(screen.getByTestId('mock-markdown-viewer')).toBeInTheDocument()
      expect(screen.getByAltText('Masa Depan AI di Delcom')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Kembali ke Jelajah Artikel'))
    expect(mockOnBack).toHaveBeenCalled()
  })

  it('renders article without cover image, excerpt, and author name', async () => {
    const minimalPost = {
      id: 2,
      title: 'Artikel Minimalis',
      slug: 'artikel-minimalis',
      content: '',
    }

    blogApi.getPublicPostBySlug.mockResolvedValueOnce({ data: minimalPost })

    render(<PublicArticleDetail slug="artikel-minimalis" onBack={mockOnBack} isDark={false} />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Minimalis')).toBeInTheDocument()
      expect(screen.queryByAltText('Artikel Minimalis')).not.toBeInTheDocument()
    })
  })

  it('renders error state and back button when article fails to load', async () => {
    blogApi.getPublicPostBySlug.mockRejectedValueOnce(new Error('Artikel tidak ditemukan'))

    render(<PublicArticleDetail slug="slug-salah" onBack={mockOnBack} />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Tidak Ditemukan')).toBeInTheDocument()
      expect(screen.getByText('Artikel tidak ditemukan')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Kembali ke Daftar Artikel'))
    expect(mockOnBack).toHaveBeenCalled()
  })

  it('handles empty slug and null post data fallback', async () => {
    // Empty slug branch
    render(<PublicArticleDetail slug="" onBack={mockOnBack} />)
    expect(screen.getByText('Artikel Tidak Ditemukan')).toBeInTheDocument()

    // Null post data with default message fallback
    blogApi.getPublicPostBySlug.mockResolvedValueOnce({ data: null })
    render(<PublicArticleDetail slug="tidak-ada" onBack={mockOnBack} />)
    await waitFor(() => {
      expect(
        screen.getByText('Artikel yang Anda cari tidak tersedia atau belum diterbitkan.')
      ).toBeInTheDocument()
    })
  })
})
