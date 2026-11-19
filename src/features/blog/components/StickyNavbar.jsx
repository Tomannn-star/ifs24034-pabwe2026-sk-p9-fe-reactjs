import { IconSun, IconMoon, IconSearch, IconWriting, IconShieldCheck, IconLogout, IconLogin } from '@tabler/icons-react'

export const StickyNavbar = ({
  user,
  currentPath = '/',
  onNavigate,
  onOpenLogin,
  onLogout,
  theme,
  toggleTheme,
  searchQuery = '',
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('/')}
            aria-label="Beranda Delcom Blog"
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30 group-hover:scale-105 transition">
              D
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                Delcom<span className="text-blue-600">Blog</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                AI Powered
              </span>
            </div>
          </button>
        </div>

        {/* Search input (visible in public views) */}
        {currentPath === '/' && onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <IconSearch className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                id="search-input"
                name="search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Cari artikel, topik, atau kata kunci"
                placeholder="Cari artikel, topik, atau kata kunci..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Right side navigation & Actions */}
        <div className="flex items-center gap-3">
          {/* Dark mode button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle tema gelap atau terang"
            className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>

          {/* Navigation based on auth state */}
          {user ? (
            <div className="flex items-center gap-2">
              {currentPath !== '/' && (
                <button
                  onClick={() => onNavigate('/')}
                  aria-label="Menuju beranda"
                  className="hidden sm:inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Beranda
                </button>
              )}

              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('/admin')}
                  aria-label="Buka panel administrasi"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    currentPath === '/admin'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconShieldCheck size={18} className="text-purple-600" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('/author')}
                aria-label="Buka ruang kerja penulis"
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  currentPath === '/author'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <IconWriting size={18} className="text-blue-600" />
                <span className="hidden sm:inline">Ruang Kerja</span>
              </button>

              <button
                onClick={onLogout}
                aria-label="Logout"
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <IconLogout size={18} />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                aria-label="Buka form masuk akun"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition cursor-pointer"
              >
                <IconLogin size={18} />
                <span>Masuk</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default StickyNavbar
