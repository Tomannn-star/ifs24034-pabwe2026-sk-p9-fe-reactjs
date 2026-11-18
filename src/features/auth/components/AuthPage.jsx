import { useState } from 'react'
import { IconLock, IconUser, IconMail, IconArrowLeft } from '@tabler/icons-react'
import authApi from '../api/authApi'
import { setToken, setUser } from '../../../helpers/apiHelper'
import { showSuccess, showError } from '../../../helpers/toolsHelper'

export const AuthPage = ({ onLoginSuccess, onNavigateHome }) => {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const res = await authApi.register({ name, username, email, password })
        const { token, user: userData } = res.data
        setToken(token)
        setUser(userData)
        showSuccess('Pendaftaran Berhasil', 'Akun berhasil dibuat!')
        if (onLoginSuccess) onLoginSuccess(userData)
      } else {
        const res = await authApi.login({ username, password })
        const { token, user: userData } = res.data
        setToken(token)
        setUser(userData)
        showSuccess('Login Berhasil', `Selamat datang kembali, ${userData.name || username}!`)
        if (onLoginSuccess) onLoginSuccess(userData)
      }
    } catch (err) {
      showError('Gagal', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 mb-4 transition"
            >
              <IconArrowLeft size={16} className="mr-1" /> Kembali ke Beranda
            </button>
          )}
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isRegister ? 'Buat Akun Penulis' : 'Masuk ke Delcom Blog'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isRegister
              ? 'Mulai publikasikan ide dan wawasan teknologi Anda'
              : 'Kelola artikel dan jelajahi asisten AI Blog Generator'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="penulis@delcom.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <IconUser className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username Anda"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <IconLock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Akun'}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Buat akun sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
