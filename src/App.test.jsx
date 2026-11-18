import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import App from './App'
import * as apiHelper from './helpers/apiHelper'
import * as toolsHelper from './helpers/toolsHelper'

vi.mock('./features/blog/components/StickyNavbar', () => ({
  default: ({ user, onNavigate, onOpenLogin, onLogout, onSearchChange }) => (
    <nav data-testid="mock-navbar">
      <button onClick={() => onNavigate('/')}>Nav Home</button>
      <button onClick={() => onNavigate('/author')}>Nav Author</button>
      <button onClick={() => onNavigate('/admin')}>Nav Admin</button>
      <button onClick={() => onNavigate('/login')}>Nav Login</button>
      <button onClick={onOpenLogin}>Open Login Modal</button>
      <input
        placeholder="Mock Search"
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
      />
      {user && <button onClick={onLogout}>Logout User</button>}
    </nav>
  ),
}))

vi.mock('./features/blog/components/PublicArticleList', () => ({
  default: ({ onSelectArticle }) => (
    <div data-testid="mock-public-list">
      <span>Galeri Artikel Publik</span>
      <button onClick={() => onSelectArticle('artikel-uji')}>Pilih Artikel</button>
    </div>
  ),
}))

vi.mock('./features/blog/components/PublicArticleDetail', () => ({
  default: ({ slug, onBack }) => (
    <div data-testid="mock-public-detail">
      <span>Detail Artikel: {slug}</span>
      <button onClick={onBack}>Kembali</button>
    </div>
  ),
}))

vi.mock('./features/blog/components/AuthorDashboard', () => ({
  default: () => <div data-testid="mock-author-dashboard">Author Dashboard Content</div>,
}))

vi.mock('./features/admin/components/AdminDashboard', () => ({
  default: () => <div data-testid="mock-admin-dashboard">Admin Dashboard Content</div>,
}))

vi.mock('./features/auth/components/AuthPage', () => ({
  default: ({ onLoginSuccess, onNavigateHome }) => (
    <div data-testid="mock-auth-page">
      <button onClick={() => onLoginSuccess({ id: 1, username: 'writer', role: 'member' })}>
        Submit Login Page
      </button>
      <button onClick={onNavigateHome}>Home Page</button>
    </div>
  ),
}))

vi.mock('./features/auth/modals/AuthModal', () => ({
  default: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div data-testid="mock-auth-modal">
        <button onClick={() => onSuccess({ id: 1, username: 'writer', role: 'member' })}>
          Submit Login Modal
        </button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}))

vi.mock('./helpers/toolsHelper', () => ({
  showConfirm: vi.fn(),
  showSuccess: vi.fn(),
}))

describe('App Component Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  it('renders public gallery on initial load /, triggers search and modal toggle', () => {
    render(<App />)

    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()

    // Test search change
    fireEvent.change(screen.getByPlaceholderText('Mock Search'), { target: { value: 'ai' } })

    // Open login modal from navbar
    fireEvent.click(screen.getByText('Open Login Modal'))
    expect(screen.getByTestId('mock-auth-modal')).toBeInTheDocument()

    // Close login modal
    fireEvent.click(screen.getByText('Close Modal'))
    expect(screen.queryByTestId('mock-auth-modal')).not.toBeInTheDocument()
  })

  it('navigates to article detail on selecting an article and navigates back', () => {
    render(<App />)

    fireEvent.click(screen.getByText('Pilih Artikel'))

    expect(screen.getByTestId('mock-public-detail')).toBeInTheDocument()
    expect(screen.getByText('Detail Artikel: artikel-uji')).toBeInTheDocument()

    // Click back
    fireEvent.click(screen.getByText('Kembali'))
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()
  })

  it('blocks unauthenticated access to /author and opens login modal', () => {
    window.history.pushState({}, '', '/author')
    render(<App />)

    expect(screen.getByText('Akses Dibatasi')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Masuk Sekarang'))
    expect(screen.getByTestId('mock-auth-modal')).toBeInTheDocument()

    // Successful modal login
    fireEvent.click(screen.getByText('Submit Login Modal'))
    expect(screen.getByTestId('mock-author-dashboard')).toBeInTheDocument()
  })

  it('blocks non-admin access to /admin and navigates back to home', () => {
    window.history.pushState({}, '', '/admin')
    render(<App />)

    expect(screen.getByText('Akses Ditolak')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Kembali ke Beranda'))
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()
  })

  it('allows admin to access /admin', () => {
    vi.spyOn(apiHelper, 'getUser').mockReturnValueOnce({ id: 99, username: 'admin', role: 'admin' })
    window.history.pushState({}, '', '/admin')

    render(<App />)

    expect(screen.getByTestId('mock-admin-dashboard')).toBeInTheDocument()
  })

  it('renders standalone AuthPage on /login and handles success and home navigation', () => {
    window.history.pushState({}, '', '/login')
    render(<App />)

    expect(screen.getByTestId('mock-auth-page')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-navbar')).not.toBeInTheDocument()

    // Test navigate home
    fireEvent.click(screen.getByText('Home Page'))
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()

    // Navigate to /register
    window.history.pushState({}, '', '/register')
    render(<App />)
    fireEvent.click(screen.getAllByText('Submit Login Page')[0])
    expect(screen.getByTestId('mock-author-dashboard')).toBeInTheDocument()
  })

  it('handles popstate browser back/forward buttons', () => {
    render(<App />)

    act(() => {
      window.history.pushState({}, '', '/posts/slug-pop')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(screen.getByText('Detail Artikel: slug-pop')).toBeInTheDocument()
  })

  it('logs out current user with confirmation', async () => {
    vi.spyOn(apiHelper, 'getUser').mockReturnValueOnce({ id: 1, username: 'user1', role: 'member' })
    toolsHelper.showConfirm.mockResolvedValueOnce(true)

    render(<App />)

    fireEvent.click(screen.getByText('Logout User'))

    await waitFor(() => {
      expect(toolsHelper.showConfirm).toHaveBeenCalled()
      expect(toolsHelper.showSuccess).toHaveBeenCalled()
      expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()
    })
  })

  it('cancels logout when prompt is dismissed', async () => {
    vi.spyOn(apiHelper, 'getUser').mockReturnValueOnce({ id: 1, username: 'user1', role: 'member' })
    toolsHelper.showConfirm.mockResolvedValueOnce(false)

    render(<App />)

    fireEvent.click(screen.getByText('Logout User'))

    await waitFor(() => {
      expect(toolsHelper.showConfirm).toHaveBeenCalled()
      expect(toolsHelper.showSuccess).not.toHaveBeenCalled()
    })
  })
})
