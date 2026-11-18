import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminDashboard from './AdminDashboard'
import adminApi from '../api/adminApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/adminApi', () => ({
  default: {
    getUsers: vi.fn(),
    getPosts: vi.fn(),
    getUserPosts: vi.fn(),
  },
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showError: vi.fn(),
  formatDate: (d) => d || '-',
  formatReadingTime: (m) => `${m || 1} menit baca`,
}))

describe('AdminDashboard', () => {
  const sampleUsers = [
    {
      id: 1,
      username: 'admin',
      name: 'Administrator',
      email: 'admin@delcom.org',
      role: 'admin',
      total_posts: 5,
      published_posts: 4,
    },
    {
      id: 2,
      username: 'penulis1',
      name: 'Penulis Satu',
      email: 'penulis1@delcom.org',
      role: 'member',
      total_posts: 3,
      published_posts: 2,
    },
    {
      id: 3,
      username: 'penulis_noname',
      name: '',
      email: 'noname@delcom.org',
      role: 'member',
      total_posts: 0,
      published_posts: 0,
    },
  ]

  const samplePosts = [
    {
      id: 10,
      title: 'Global Post 1',
      slug: 'global-post-1',
      author_name: 'Penulis Satu',
      category: 'Teknologi',
      reading_time: 2,
      is_published: true,
      published_at: '2026-11-18',
    },
    {
      id: 11,
      title: 'Global Post Draft',
      slug: 'global-post-draft',
      author_name: '',
      category: 'Bisnis',
      reading_time: 1,
      is_published: false,
      created_at: '2026-11-18',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    adminApi.getUsers.mockResolvedValue({ data: sampleUsers })
    adminApi.getPosts.mockResolvedValue({ data: samplePosts })
  })

  it('loads and renders users table, switches tab to posts archive', async () => {
    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Panel Administrasi Delcom')).toBeInTheDocument()
      expect(screen.getByText('Administrator')).toBeInTheDocument()
      expect(screen.getByText('Penulis Satu')).toBeInTheDocument()
      expect(screen.getByText('penulis_noname')).toBeInTheDocument()
    })

    // Switch to posts tab
    fireEvent.click(screen.getByText(/Arsip Seluruh Artikel/))
    expect(screen.getByText('Global Post 1')).toBeInTheDocument()

    // Switch back to users tab
    fireEvent.click(screen.getByText(/Daftar Pengguna/))
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('inspects user posts in modal and closes modal', async () => {
    adminApi.getUserPosts.mockResolvedValueOnce({ data: samplePosts })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    const inspectButtons = screen.getAllByText('Lihat Artikel')
    fireEvent.click(inspectButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Artikel oleh Administrator')).toBeInTheDocument()
      expect(screen.getByText('Global Post 1')).toBeInTheDocument()
    })

    // Close modal via close button
    fireEvent.click(screen.getByText('Tutup'))
    expect(screen.queryByText('Artikel oleh Administrator')).not.toBeInTheDocument()

    // Inspect user with empty name to cover username fallback in modal title
    adminApi.getUserPosts.mockResolvedValueOnce({})
    fireEvent.click(inspectButtons[2])
    await waitFor(() => {
      expect(screen.getByText('Artikel oleh penulis_noname')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Tutup'))
  })

  it('handles empty responses for users and posts', async () => {
    adminApi.getUsers.mockResolvedValueOnce({})
    adminApi.getPosts.mockResolvedValueOnce({})

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Daftar Pengguna (0)')).toBeInTheDocument()
      expect(screen.getByText('Arsip Seluruh Artikel (0)')).toBeInTheDocument()
    })
  })

  it('handles empty user posts and error when inspecting', async () => {
    adminApi.getUserPosts.mockResolvedValueOnce({ data: [] })

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument()
    })

    const inspectButtons = screen.getAllByText('Lihat Artikel')
    fireEvent.click(inspectButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Pengguna ini belum menulis artikel apapun.')).toBeInTheDocument()
    })

    // Close via X button
    fireEvent.click(screen.getByLabelText('Tutup inspeksi pengguna'))
    expect(screen.queryByText('Artikel oleh Administrator')).not.toBeInTheDocument()

    // Error branch on user posts
    adminApi.getUserPosts.mockRejectedValueOnce(new Error('Koneksi terputus'))
    fireEvent.click(inspectButtons[0])

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Memuat Artikel Pengguna', 'Koneksi terputus')
    })
  })

  it('handles initial load failure', async () => {
    adminApi.getUsers.mockRejectedValueOnce(new Error('Akses ditolak'))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal Memuat Data Admin', 'Akses ditolak')
    })
  })
})
