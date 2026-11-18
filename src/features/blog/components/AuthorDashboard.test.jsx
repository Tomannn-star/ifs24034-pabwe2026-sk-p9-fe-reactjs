import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthorDashboard from './AuthorDashboard'
import blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  default: {
    getAuthorPosts: vi.fn(),
    getPostStats: vi.fn(),
    togglePublish: vi.fn(),
    deletePost: vi.fn(),
  },
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showConfirm: vi.fn(),
  formatDate: (d) => d || '-',
  formatReadingTime: (m) => `${m || 1} menit baca`,
}))

vi.mock('./PostStats', () => ({
  default: () => <div data-testid="mock-post-stats">Stats</div>,
}))

vi.mock('../modals/PostModal', () => ({
  default: ({ isOpen, onClose, onSaved, initialData }) =>
    isOpen ? (
      <div data-testid="mock-post-modal">
        <span>Modal Editor: {initialData?.title || 'Baru'}</span>
        <button onClick={() => { if (onSaved) onSaved(); if (onClose) onClose(); }}>Simpan Mock</button>
        <button onClick={onClose}>Tutup Mock</button>
      </div>
    ) : null,
}))

vi.mock('../modals/AiPostGeneratorModal', () => ({
  default: ({ isOpen, onClose, onApply }) =>
    isOpen ? (
      <div data-testid="mock-ai-modal">
        <button onClick={() => { if (onApply) onApply({ title: 'AI Post', category: 'Teknologi', excerpt: 'AI Excerpt', content: 'AI Content' }); if (onClose) onClose(); }}>
          Apply AI Mock
        </button>
        <button onClick={onClose}>Tutup AI Mock</button>
      </div>
    ) : null,
}))

describe('AuthorDashboard', () => {
  const samplePosts = [
    {
      id: 1,
      title: 'Artikel Milik Saya',
      slug: 'artikel-milik-saya',
      category: 'Teknologi',
      reading_time: 3,
      is_published: true,
      published_at: '2026-11-18',
    },
    {
      id: 2,
      title: 'Artikel Draf Saya',
      slug: 'artikel-draf-saya',
      category: '',
      reading_time: 2,
      is_published: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    blogApi.getAuthorPosts.mockResolvedValue({ data: samplePosts })
    blogApi.getPostStats.mockResolvedValue({ data: { total: 2, total_published: 1, total_draft: 1 } })
  })

  it('renders author dashboard, loads stats and posts table', async () => {
    render(<AuthorDashboard isDark={false} />)

    await waitFor(() => {
      expect(screen.getByText('Ruang Kerja Penulis')).toBeInTheDocument()
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
      expect(screen.getByText('Artikel Draf Saya')).toBeInTheDocument()
      expect(screen.getByTestId('mock-post-stats')).toBeInTheDocument()
    })
  })

  it('filters posts using search input', async () => {
    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText(/Cari artikel di ruang kerja/), {
      target: { value: 'Draf' },
    })

    expect(screen.queryByText('Artikel Milik Saya')).not.toBeInTheDocument()
    expect(screen.getByText('Artikel Draf Saya')).toBeInTheDocument()
  })

  it('toggles post publish status', async () => {
    blogApi.togglePublish.mockResolvedValueOnce({ data: { is_published: false } })
    blogApi.getPostStats.mockResolvedValueOnce({})

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle status artikel Artikel Milik Saya'))

    await waitFor(() => {
      expect(blogApi.togglePublish).toHaveBeenCalledWith(1)
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith(
        'Status Berubah',
        'Artikel berhasil diubah menjadi Draf'
      )
    })

    // Toggle from draft to published
    blogApi.togglePublish.mockResolvedValueOnce({ data: { is_published: true } })
    fireEvent.click(screen.getByLabelText('Toggle status artikel Artikel Draf Saya'))
    await waitFor(() => {
      expect(toolsHelper.showSuccess).toHaveBeenCalledWith(
        'Status Berubah',
        'Artikel berhasil diubah menjadi Terbit'
      )
    })
  })

  it('handles toggle publish failure', async () => {
    blogApi.togglePublish.mockRejectedValueOnce(new Error('Gagal toggle status'))

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('Toggle status artikel Artikel Milik Saya'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Mengubah Status', 'Gagal toggle status')
    })
  })

  it('deletes post via kebab menu and confirm prompt', async () => {
    toolsHelper.showConfirm.mockResolvedValueOnce(true)
    blogApi.deletePost.mockResolvedValueOnce({ success: true })
    blogApi.getPostStats.mockResolvedValueOnce({})

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    // Open and toggle close kebab menu to cover branch
    const kebabButtons = screen.getAllByLabelText('Menu artikel')
    fireEvent.click(kebabButtons[0])
    fireEvent.click(kebabButtons[0])
    fireEvent.click(kebabButtons[0])

    // Click delete
    fireEvent.click(screen.getByText('Hapus'))

    await waitFor(() => {
      expect(toolsHelper.showConfirm).toHaveBeenCalled()
      expect(blogApi.deletePost).toHaveBeenCalledWith(1)
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
    })
  })

  it('handles empty responses for posts and stats', async () => {
    blogApi.getAuthorPosts.mockResolvedValueOnce({})
    blogApi.getPostStats.mockResolvedValueOnce({})

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Ruang Kerja Penulis')).toBeInTheDocument()
    })
  })

  it('aborts delete post when confirmation cancelled or handles delete failure', async () => {
    toolsHelper.showConfirm.mockResolvedValueOnce(false)

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    const kebabButtons = screen.getAllByLabelText('Menu artikel')
    fireEvent.click(kebabButtons[0])
    fireEvent.click(screen.getByText('Hapus'))

    expect(blogApi.deletePost).not.toHaveBeenCalled()

    // Delete failure branch
    toolsHelper.showConfirm.mockResolvedValueOnce(true)
    blogApi.deletePost.mockRejectedValueOnce(new Error('Gagal delete'))
    fireEvent.click(kebabButtons[0])
    fireEvent.click(screen.getByText('Hapus'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Menghapus', 'Gagal delete')
    })
  })

  it('opens and closes PostModal for create and edit', async () => {
    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    // Open new post modal
    fireEvent.click(screen.getByText('Tulis Artikel Baru'))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Editor: Baru')).toBeInTheDocument()

    // Save and close
    fireEvent.click(screen.getByText('Simpan Mock'))
    expect(screen.queryByTestId('mock-post-modal')).not.toBeInTheDocument()

    // Wait for table to reload after fetchData
    await waitFor(() => {
      expect(screen.getByText('Artikel Milik Saya')).toBeInTheDocument()
    })

    // Open edit via kebab
    const kebabButtons = screen.getAllByLabelText('Menu artikel')
    fireEvent.click(kebabButtons[0])
    fireEvent.click(screen.getByText('Edit Artikel'))

    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Editor: Artikel Milik Saya')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tutup Mock'))
    expect(screen.queryByTestId('mock-post-modal')).not.toBeInTheDocument()
  })

  it('opens AI modal and applies generated draft to post modal', async () => {
    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Ruang Kerja Penulis')).toBeInTheDocument()
    })

    // Open AI modal
    fireEvent.click(screen.getByText('AI Blog Generator'))
    expect(screen.getByTestId('mock-ai-modal')).toBeInTheDocument()

    // Apply AI mock
    fireEvent.click(screen.getByText('Apply AI Mock'))

    // Post modal should open with AI title
    expect(screen.queryByTestId('mock-ai-modal')).not.toBeInTheDocument()
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Editor: AI Post')).toBeInTheDocument()
  })

  it('handles load failure and empty posts list', async () => {
    blogApi.getAuthorPosts.mockRejectedValueOnce(new Error('Koneksi terputus'))

    render(<AuthorDashboard />)

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Memuat Data', 'Koneksi terputus')
      expect(screen.getByText('Belum ada artikel di ruang kerja')).toBeInTheDocument()
    })
  })
})
