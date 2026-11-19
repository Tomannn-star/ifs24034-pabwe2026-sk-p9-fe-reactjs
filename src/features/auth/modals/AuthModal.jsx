import { useState } from 'react'
import { IconX, IconLock, IconUser, IconMail } from '@tabler/icons-react'
import authApi from '../api/authApi'
import { setToken, setUser } from '../../../helpers/apiHelper'
import { showSuccess, showError } from '../../../helpers/toolsHelper'

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const res = await authApi.register({ name, username, email, password })
        const { token, user: userData } = res.data
        setToken(token)
        setUser(userData)
        showSuccess('Pendaftaran Berhasil', 'Akun Anda berhasil didaftarkan!')
        if (onSuccess) onSuccess(userData)
        onClose()
      } else {
        const res = await authApi.login({ username, password })
        const { token, user: userData } = res.data
        setToken(token)
        setUser(userData)
        showSuccess('Login Berhasil', `Selamat datang kembali, ${userData.name || username}!`)
        if (onSuccess) onSuccess(userData)
        onClose()
      }
    } catch (err) {
      showError('Gagal', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold">
            {isRegister ? 'Daftar Penulis Baru' : 'Masuk ke Delcom Blog'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isRegister && (
            <>
              <div>
                <label
                  htmlFor="modal-name"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    id="modal-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Nama Lengkap"
                    placeholder="Contoh: Abdullah Ubaid"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-email"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 text-gray-500" size={18} />
                  <input
                    id="modal-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Alamat Email"
                    placeholder="penulis@delcom.org"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <IconUser className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                id="login-username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-label="Username"
                placeholder="Username Anda"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <IconLock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Kata Sandi"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            aria-label={isRegister ? 'Daftar Sekarang' : 'Masuk Akun'}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Akun'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              aria-label="Beralih mode masuk atau daftar akun"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Buat akun baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
