import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AiPostGeneratorModal from './AiPostGeneratorModal'
import blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  default: {
    generateAiArticle: vi.fn(),
  },
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('../../../components/MarkdownViewer', () => ({
  default: ({ initialValue }) => <div data-testid="mock-viewer">{initialValue}</div>,
}))

describe('AiPostGeneratorModal', () => {
  const mockOnClose = vi.fn()
  const mockOnApply = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<AiPostGeneratorModal isOpen={false} onClose={mockOnClose} onApply={mockOnApply} />)
    expect(screen.queryByText('AI Blog Generator & Search Engine')).not.toBeInTheDocument()
  })

  it('validates empty topic', () => {
    render(<AiPostGeneratorModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />)
    fireEvent.click(screen.getByText('Generate Artikel AI'))
    expect(toolsHelper.showError).toHaveBeenCalledWith('Validasi Gagal', 'Topik artikel wajib diisi')
  })

  it('generates AI article with web search sources and applies to editor', async () => {
    const aiResponse = {
      data: {
        title: 'Pengembangan Microservices dengan Go',
        category: 'Teknologi',
        excerpt: 'Membangun aplikasi terdistribusi modern',
        content: '## Pendahuluan\nGo sangat efisien...',
        sources: [
          {
            title: 'Dokumentasi Resmi Go',
            url: 'https://golang.org/doc',
            snippet: 'Panduan dan referensi resmi Go',
          },
        ],
      },
    }

    blogApi.generateAiArticle.mockResolvedValueOnce(aiResponse)

    render(<AiPostGeneratorModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} isDark={true} />)

    fireEvent.change(screen.getByPlaceholderText(/Contoh: Manfaat Framework/), {
      target: { value: 'Go Microservices' },
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Bisnis' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('checkbox'))

    fireEvent.click(screen.getByText('Generate Artikel AI'))

    await waitFor(() => {
      expect(blogApi.generateAiArticle).toHaveBeenCalledWith({
        topic: 'Go Microservices',
        category: 'Bisnis',
        include_web_search: true,
      })
      expect(screen.getByText('Pengembangan Microservices dengan Go')).toBeInTheDocument()
      expect(screen.getByText('Dokumentasi Resmi Go')).toBeInTheDocument()
      expect(screen.getByText('Terapkan ke Editor')).toBeInTheDocument()
    })

    // Apply to editor
    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(mockOnApply).toHaveBeenCalledWith(aiResponse.data)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles AI generation failure and supports closing modal', async () => {
    blogApi.generateAiArticle.mockRejectedValueOnce(new Error('Rate limit exceeded'))

    render(<AiPostGeneratorModal isOpen={true} onClose={mockOnClose} onApply={mockOnApply} />)

    fireEvent.change(screen.getByPlaceholderText(/Contoh: Manfaat Framework/), {
      target: { value: 'Topik Gagal' },
    })
    fireEvent.click(screen.getByText('Generate Artikel AI'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Generate', 'Rate limit exceeded')
    })

    fireEvent.click(screen.getByText('Tutup'))
    expect(mockOnClose).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Tutup AI modal'))
    expect(mockOnClose).toHaveBeenCalled()

    // Error without message
    blogApi.generateAiArticle.mockRejectedValueOnce({})
    fireEvent.click(screen.getByText('Generate Artikel AI'))
    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith(
        'Gagal Generate',
        'Terjadi kesalahan saat memanggil AI service'
      )
    })
  })

  it('renders without onApply handler and handles empty category/content result', async () => {
    blogApi.generateAiArticle.mockResolvedValueOnce({
      data: {
        title: 'Artikel Minimalis',
        category: '',
        content: '',
      },
    })

    render(<AiPostGeneratorModal isOpen={true} onClose={mockOnClose} />)
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Manfaat Framework/), {
      target: { value: 'Topik Minimal' },
    })
    fireEvent.click(screen.getByText('Generate Artikel AI'))

    await waitFor(() => {
      expect(screen.getByText('Artikel Minimalis')).toBeInTheDocument()
      expect(screen.getByText('Terapkan ke Editor')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Terapkan ke Editor'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
