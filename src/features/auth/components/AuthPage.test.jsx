import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthPage from './AuthPage'
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

describe('AuthPage', () => {
  const mockOnLoginSuccess = vi.fn()
  const mockOnNavigateHome = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form with elements having exact IDs', () => {
    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)

    expect(document.getElementById('login-username')).toBeInTheDocument()
    expect(document.getElementById('login-password')).toBeInTheDocument()
    expect(document.getElementById('login-submit')).toBeInTheDocument()
    expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument()
  })

  it('navigates back to home when clicking back button', () => {
    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)
    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(mockOnNavigateHome).toHaveBeenCalled()
  })

  it('submits login successfully', async () => {
    authApi.login.mockResolvedValueOnce({
      data: {
        token: 'page-token',
        user: { id: 1, username: 'writer', name: '' },
      },
    })

    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'writer' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pass' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ username: 'writer', password: 'pass' })
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
  })

  it('handles login failure on page', async () => {
    authApi.login.mockRejectedValueOnce(new Error('Kredensial tidak valid'))

    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)

    fireEvent.change(document.getElementById('login-username'), { target: { value: 'writer' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'bad' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal', 'Kredensial tidak valid')
    })
  })

  it('switches to register mode, fills form and registers successfully', async () => {
    authApi.register.mockResolvedValueOnce({
      data: {
        token: 'reg-token',
        user: { id: 2, username: 'regwriter', name: 'Reg Writer' },
      },
    })

    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)

    fireEvent.click(screen.getByText('Belum punya akun? Buat akun sekarang'))
    expect(screen.getByText('Buat Akun Penulis')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Nama Anda'), { target: { value: 'Reg Writer' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'reg@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'regwriter' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pwd123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: 'Reg Writer',
        email: 'reg@delcom.org',
        username: 'regwriter',
        password: 'pwd123',
      })
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
  })

  it('registers successfully without onLoginSuccess callback', async () => {
    authApi.register.mockResolvedValueOnce({
      data: {
        token: 'reg-token-2',
        user: { id: 3, username: 'reg2', name: 'Reg 2' },
      },
    })

    render(<AuthPage onNavigateHome={mockOnNavigateHome} />)
    fireEvent.click(screen.getByText('Belum punya akun? Buat akun sekarang'))
    fireEvent.change(screen.getByPlaceholderText('Nama Anda'), { target: { value: 'Reg 2' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'reg2@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'reg2' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pwd123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
    })
  })

  it('handles register failure', async () => {
    authApi.register.mockRejectedValueOnce(new Error('Email sudah terdaftar'))

    render(<AuthPage onLoginSuccess={mockOnLoginSuccess} onNavigateHome={mockOnNavigateHome} />)

    fireEvent.click(screen.getByText('Belum punya akun? Buat akun sekarang'))
    fireEvent.change(screen.getByPlaceholderText('Nama Anda'), { target: { value: 'Reg Writer' } })
    fireEvent.change(screen.getByPlaceholderText('penulis@delcom.org'), { target: { value: 'reg@delcom.org' } })
    fireEvent.change(document.getElementById('login-username'), { target: { value: 'regwriter' } })
    fireEvent.change(document.getElementById('login-password'), { target: { value: 'pwd123' } })
    fireEvent.click(document.getElementById('login-submit'))

    await waitFor(() => {
      expect(toolsHelper.showError).toHaveBeenCalledWith('Gagal', 'Email sudah terdaftar')
    })
  })
})
