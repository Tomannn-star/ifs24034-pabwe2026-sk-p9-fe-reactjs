import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StickyNavbar from './StickyNavbar'

describe('StickyNavbar', () => {
  const mockOnNavigate = vi.fn()
  const mockOnOpenLogin = vi.fn()
  const mockOnLogout = vi.fn()
  const mockToggleTheme = vi.fn()
  const mockOnSearchChange = vi.fn()

  it('renders guest state with login button and search input', () => {
    render(
      <StickyNavbar
        user={null}
        currentPath="/"
        onNavigate={mockOnNavigate}
        onOpenLogin={mockOnOpenLogin}
        onLogout={mockOnLogout}
        theme="light"
        toggleTheme={mockToggleTheme}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    )

    expect(screen.getByText('Masuk')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Cari artikel/)).toBeInTheDocument()

    // Test search change
    fireEvent.change(screen.getByPlaceholderText(/Cari artikel/), { target: { value: 'golang' } })
    expect(mockOnSearchChange).toHaveBeenCalledWith('golang')

    // Test login click
    fireEvent.click(screen.getByText('Masuk'))
    expect(mockOnOpenLogin).toHaveBeenCalled()

    // Test theme toggle
    fireEvent.click(screen.getByLabelText('Toggle tema gelap atau terang'))
    expect(mockToggleTheme).toHaveBeenCalled()

    // Test brand click
    fireEvent.click(screen.getByText('Blog'))
    expect(mockOnNavigate).toHaveBeenCalledWith('/')
  })

  it('renders author state with workspace button and logout', () => {
    const authorUser = { id: 2, username: 'author1', role: 'member' }

    render(
      <StickyNavbar
        user={authorUser}
        currentPath="/author"
        onNavigate={mockOnNavigate}
        onOpenLogin={mockOnOpenLogin}
        onLogout={mockOnLogout}
        theme="dark"
        toggleTheme={mockToggleTheme}
      />
    )

    expect(screen.getByText('Ruang Kerja')).toBeInTheDocument()
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    expect(screen.getByText('Beranda')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Beranda'))
    expect(mockOnNavigate).toHaveBeenCalledWith('/')

    fireEvent.click(screen.getByText('Ruang Kerja'))
    expect(mockOnNavigate).toHaveBeenCalledWith('/author')

    fireEvent.click(screen.getByLabelText('Keluar'))
    expect(mockOnLogout).toHaveBeenCalled()
  })

  it('renders admin button when user has admin role', () => {
    const adminUser = { id: 1, username: 'admin1', role: 'admin' }

    const { rerender } = render(
      <StickyNavbar
        user={adminUser}
        currentPath="/admin"
        onNavigate={mockOnNavigate}
        onOpenLogin={mockOnOpenLogin}
        onLogout={mockOnLogout}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )

    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Admin Panel'))
    expect(mockOnNavigate).toHaveBeenCalledWith('/admin')

    rerender(
      <StickyNavbar
        user={adminUser}
        currentPath="/"
        onNavigate={mockOnNavigate}
        onOpenLogin={mockOnOpenLogin}
        onLogout={mockOnLogout}
        theme="light"
        toggleTheme={mockToggleTheme}
      />
    )
  })
})
