import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostModal from './PostModal'
import blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  default: {
    createPost: vi.fn(),
    updatePost: vi.fn(),
  },
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('../../../components/MarkdownEditor', () => ({
  default: ({ initialValue, onChange }) => (
    <textarea
      data-testid="mock-editor"
      value={initialValue}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}))

describe('PostModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSaved = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<PostModal isOpen={false} onClose={mockOnClose} onSaved={mockOnSaved} />)
    expect(screen.queryByText('Tulis Artikel Baru')).not.toBeInTheDocument()
  })

  it('renders create mode and validates required title', async () => {
    render(<PostModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} />)

    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()

    // Try submit with empty title
    fireEvent.click(screen.getByText('Simpan Artikel'))
    expect(toolsHelper.showError).toHaveBeenCalledWith('Validasi Gagal', 'Judul artikel wajib diisi')
  })

  it('creates post successfully', async () => {
    blogApi.createPost.mockResolvedValueOnce({ data: { id: 10 } })

    render(<PostModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} />)

    fireEvent.change(screen.getByPlaceholderText(/Masukkan judul/), { target: { value: 'Belajar Golang' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Pendidikan' } })
    fireEvent.change(screen.getByPlaceholderText(/Ringkasan singkat/), { target: { value: 'Ringkasan singkat artikel' } })
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/images/), { target: { value: 'https://cover.jpg' } })
    fireEvent.change(screen.getByTestId('mock-editor'), { target: { value: 'Konten markdown lengkap' } })
    fireEvent.click(screen.getByRole('checkbox'))

    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() => {
      expect(blogApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Belajar Golang',
          excerpt: 'Ringkasan singkat artikel',
          cover_image_path: 'https://cover.jpg',
          content: 'Konten markdown lengkap',
          is_published: true,
        })
      )
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnSaved).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('renders edit mode with initialData and updates post', async () => {
    const editData = {
      id: 5,
      title: 'Judul Lama',
      category: 'Bisnis',
      excerpt: 'Excerpt lama',
      cover_image_path: 'https://old.jpg',
      content: 'Isi lama',
      is_published: true,
    }

    blogApi.updatePost.mockResolvedValueOnce({ data: { id: 5 } })

    render(
      <PostModal
        isOpen={true}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
        initialData={editData}
      />
    )

    expect(screen.getByText('Edit Artikel')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Judul Lama')).toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('Judul Lama'), { target: { value: 'Judul Baru' } })
    fireEvent.click(screen.getByText('Perbarui Artikel'))

    await waitFor(() => {
      expect(blogApi.updatePost).toHaveBeenCalledWith(
        5,
        expect.objectContaining({
          title: 'Judul Baru',
        })
      )
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnSaved).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles server save error and allows closing modal with cancel or X button', async () => {
    blogApi.createPost.mockRejectedValueOnce(new Error('Server error'))

    render(<PostModal isOpen={true} onClose={mockOnClose} onSaved={mockOnSaved} />)

    fireEvent.change(screen.getByPlaceholderText(/Masukkan judul/), { target: { value: 'Judul' } })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Menyimpan', 'Server error')
    })

    fireEvent.click(screen.getByText('Batal'))
    expect(mockOnClose).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tutup editor modal'))
    expect(mockOnClose).toHaveBeenCalled()

    // Error without error message
    blogApi.createPost.mockRejectedValueOnce({})
    fireEvent.click(screen.getByText('Simpan Artikel'))
    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith(
        'Gagal Menyimpan',
        'Terjadi kesalahan pada server'
      )
    })
  })

  it('handles empty initialData object and renders without onSaved prop', async () => {
    blogApi.createPost.mockResolvedValueOnce({ data: { id: 99 } })

    render(<PostModal isOpen={true} onClose={mockOnClose} initialData={{}} />)

    fireEvent.change(screen.getByPlaceholderText(/Masukkan judul/), {
      target: { value: 'Artikel Dari Kosong' },
    })
    fireEvent.click(screen.getByText('Simpan Artikel'))

    await waitFor(() => {
      expect(blogApi.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Artikel Dari Kosong',
          category: 'Teknologi',
        })
      )
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})
