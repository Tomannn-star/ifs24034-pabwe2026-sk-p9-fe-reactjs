import { useState, useEffect, useCallback } from 'react'
import StickyNavbar from './features/blog/components/StickyNavbar'
import PublicArticleList from './features/blog/components/PublicArticleList'
import PublicArticleDetail from './features/blog/components/PublicArticleDetail'
import AuthorDashboard from './features/blog/components/AuthorDashboard'
import AdminDashboard from './features/admin/components/AdminDashboard'
import AuthPage from './features/auth/components/AuthPage'
import AuthModal from './features/auth/modals/AuthModal'
import { getUser, removeToken, removeUser } from './helpers/apiHelper'
import { showConfirm, showSuccess } from './helpers/toolsHelper'
import useTheme from './hooks/useTheme'

export const App = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const [currentUser, setCurrentUser] = useState(() => getUser())
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync with browser URL popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    setCurrentPath(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?'
    )
    if (!confirmed) return

    removeToken()
    removeUser()
    setCurrentUser(null)
    showSuccess('Berhasil Keluar', 'Sesi Anda telah berakhir')
    navigate('/')
  }

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)
    setIsAuthModalOpen(false)
    navigate('/author')
  }

  // Route matching
  const renderContent = () => {
    // 1. Standalone /login & /register
    if (currentPath === '/login' || currentPath === '/register') {
      return (
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigate('/')}
        />
      )
    }

    // 2. /posts/:slug
    if (currentPath.startsWith('/posts/')) {
      const slug = currentPath.replace('/posts/', '')
      return (
        <PublicArticleDetail
          slug={slug}
          onBack={() => navigate('/')}
          isDark={isDark}
        />
      )
    }

    // 3. /author
    if (currentPath === '/author') {
      if (!currentUser) {
        return (
          <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center space-y-4 border border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Akses Dibatasi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Anda harus masuk sebagai penulis untuk mengakses Ruang Kerja.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition cursor-pointer"
            >
              Masuk Sekarang
            </button>
          </div>
        )
      }
      return <AuthorDashboard isDark={isDark} />
    }

    // 4. /admin
    if (currentPath === '/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        return (
          <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center space-y-4 border border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Akses Ditolak</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Halaman ini hanya dapat diakses oleh administrator sistem.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        )
      }
      return <AdminDashboard />
    }

    // Default: Homepage / Public article gallery
    return (
      <PublicArticleList
        searchQuery={searchQuery}
        onSelectArticle={(slug) => navigate(`/posts/${slug}`)}
      />
    )
  }

  const isStandaloneAuth = currentPath === '/login' || currentPath === '/register'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {!isStandaloneAuth && (
        <StickyNavbar
          user={currentUser}
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      <main className="flex-1 w-full">{renderContent()}</main>

      {!isStandaloneAuth && (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-xs text-gray-600 dark:text-gray-400">
          <p>© 2026 Delcom Blog. Praktikum 9 Pemrograman Berbasis Web &amp; Mobile.</p>
        </footer>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  )
}

export default App
