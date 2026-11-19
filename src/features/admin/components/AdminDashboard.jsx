import { useState, useEffect } from 'react'
import {
  IconShieldCheck,
  IconUsers,
  IconFiles,
  IconClock,
  IconEye,
  IconX,
  IconFolder,
} from '@tabler/icons-react'
import adminApi from '../api/adminApi'
import { showError, formatDate, formatReadingTime } from '../../../helpers/toolsHelper'

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'posts'
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Inspected user modal
  const [inspectedUser, setInspectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loadingUserPosts, setLoadingUserPosts] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, postsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getPosts(),
      ])
      setUsers(usersRes.data || [])
      setPosts(postsRes.data || [])
    } catch (err) {
      showError('Gagal Memuat Data Admin', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInspectUserPosts = async (user) => {
    setInspectedUser(user)
    setLoadingUserPosts(true)
    try {
      const res = await adminApi.getUserPosts(user.id)
      setUserPosts(res.data || [])
    } catch (err) {
      showError('Gagal Memuat Artikel Pengguna', err.message)
    } finally {
      setLoadingUserPosts(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <IconShieldCheck className="text-purple-600" size={28} />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Panel Administrasi Delcom
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Monitoring menyeluruh aktivitas civitas penulis, naskah blog, dan data akun sistem.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <IconUsers size={18} />
            <span>Daftar Pengguna ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-300 shadow-xs'
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            <IconFiles size={18} />
            <span>Arsip Seluruh Artikel ({posts.length})</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Memuat data sistem...</div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-3.5 px-6">Pengguna</th>
                  <th scope="col" className="py-3.5 px-4">Email</th>
                  <th scope="col" className="py-3.5 px-4">Role</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Total Artikel</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Artikel Terbit</th>
                  <th scope="col" className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      <div>{u.name || u.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">@{u.username}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-xs">{u.email}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">
                      {u.total_posts}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-emerald-600">
                      {u.published_posts}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleInspectUserPosts(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition cursor-pointer"
                      >
                        <IconEye size={14} />
                        <span>Lihat Artikel</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* All Posts Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-3.5 px-6">Artikel</th>
                  <th scope="col" className="py-3.5 px-4">Penulis</th>
                  <th scope="col" className="py-3.5 px-4">Kategori</th>
                  <th scope="col" className="py-3.5 px-4">Waktu Baca</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                  <th scope="col" className="py-3.5 px-6">Tanggal Publikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                      <div>{p.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate">/{p.slug}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-xs font-medium">
                      {p.author_name || 'Admin'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300 text-xs">
                      <div className="flex items-center gap-1">
                        <IconClock size={14} className="text-gray-500" />
                        {formatReadingTime(p.reading_time)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.is_published
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {p.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(p.published_at || p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Posts Modal */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col">
            <div className="bg-purple-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-lg font-bold">
                  Artikel oleh {inspectedUser.name || inspectedUser.username}
                </h3>
                <p className="text-xs text-purple-100">@{inspectedUser.username}</p>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                aria-label="Tutup inspeksi pengguna"
                className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingUserPosts ? (
                <div className="text-center py-8 text-gray-500 animate-pulse">Memuat artikel...</div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <IconFolder size={36} className="mx-auto mb-2 text-gray-400" />
                  <p>Pengguna ini belum menulis artikel apapun.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {userPosts.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</h4>
                        <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <span>{p.category}</span>
                          <span>•</span>
                          <span>{formatReadingTime(p.reading_time)}</span>
                          <span>•</span>
                          <span>{formatDate(p.published_at || p.created_at)}</span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          p.is_published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-750 px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-right shrink-0">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
