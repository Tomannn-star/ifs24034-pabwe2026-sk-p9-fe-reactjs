import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthModal from './AuthModal'
import authApi from '../api/authApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/authApi', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
  },
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

describe('AuthModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />)
    expect(screen.queryByText('Masuk ke Delcom Blog')).not.toBeInTheDocument()
  })

  it('renders login form with exact IDs', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    expect(screen.getByText('Masuk ke Delcom Blog')).toBeInTheDocument()
    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).toBeInTheDocument()
  })

  it('submits login successfully and closes modal', async () => {
    authApi.login.mockResolvedValueOnce({
      data: {
        token: 'auth-token',
        user: { id: 1, username: 'testuser', name: '' },
      },
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'testuser' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' })
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({ username: 'testuser' }))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles login error gracefully', async () => {
    authApi.login.mockRejectedValueOnce(new Error('Kredensial salah'))

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'wronguser' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'wrongpwd' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal', 'Kredensial salah')
    })
  })

  it('switches to register mode, submits registration successfully', async () => {
    authApi.register.mockResolvedValueOnce({
      data: {
        token: 'reg-token',
        user: { id: 2, username: 'newuser', name: 'New User' },
      },
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    // Switch to register mode
    fireEvent.click(screen.getByText('Belum punya akun? Buat akun baru'))
    expect(screen.getByText('Daftar Penulis Baru')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Contoh: Abdullah Ubaid'), { target: { value: 'New User' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'new@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'newuser' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@delcom.org',
        username: 'newuser',
        password: 'password123',
      })
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('registers successfully without onSuccess callback', async () => {
    authApi.register.mockResolvedValueOnce({
      data: {
        token: 'reg-token-3',
        user: { id: 4, username: 'newuser3', name: 'New User 3' },
      },
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    fireEvent.click(screen.getByText('Belum punya akun? Buat akun baru'))
    fireEvent.change(screen.getByPlaceholderText('Contoh: Abdullah Ubaid'), { target: { value: 'New User 3' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'new3@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'newuser3' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'password123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles register error and allows closing with X button', async () => {
    authApi.register.mockRejectedValueOnce(new Error('Username sudah digunakan'))

    render(<AuthModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />)

    fireEvent.click(screen.getByText('Belum punya akun? Buat akun baru'))
    fireEvent.change(screen.getByPlaceholderText('Contoh: Abdullah Ubaid'), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'u@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'taken' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pwd' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal', 'Username sudah digunakan')
    })

    fireEvent.click(screen.getByLabelText('Tutup modal'))
    expect(mockOnClose).toHaveBeenCalled()
  })
})
