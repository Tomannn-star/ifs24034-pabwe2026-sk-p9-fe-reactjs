import { useState, useEffect } from 'react'
import {
  IconPlus,
  IconSparkles,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconClock,
  IconFileText,
  IconFolder,
} from '@tabler/icons-react'
import blogApi from '../api/blogApi'
import PostStats from './PostStats'
import PostModal from '../modals/PostModal'
import AiPostGeneratorModal from '../modals/AiPostGeneratorModal'
import { showSuccess, showError, showConfirm, formatDate, formatReadingTime } from '../../../helpers/toolsHelper'

export const AuthorDashboard = ({ isDark = false }) => {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [postsRes, statsRes] = await Promise.all([
        blogApi.getAuthorPosts(),
        blogApi.getPostStats(),
      ])
      setPosts(postsRes.data || [])
      setStats(statsRes.data)
    } catch (err) {
      showError('Gagal Memuat Data', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTogglePublish = async (post) => {
    try {
      const res = await blogApi.togglePublish(post.id)
      const updated = res.data
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_published: updated.is_published } : p))
      )
      // Refresh stats
      const statsRes = await blogApi.getPostStats()
      setStats(statsRes.data)
      showSuccess(
        'Status Berubah',
        `Artikel berhasil diubah menjadi ${updated.is_published ? 'Terbit' : 'Draf'}`
      )
    } catch (err) {
      showError('Gagal Mengubah Status', err.message)
    }
  }

  const handleDeletePost = async (post) => {
    setActiveMenuId(null)
    const confirmed = await showConfirm(
      'Hapus Artikel?',
      `Apakah Anda yakin ingin menghapus artikel "${post.title}"? Tindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return

    try {
      await blogApi.deletePost(post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      // Refresh stats
      const statsRes = await blogApi.getPostStats()
      setStats(statsRes.data)
      showSuccess('Artikel Dihapus', 'Artikel berhasil dihapus secara permanen')
    } catch (err) {
      showError('Gagal Menghapus', err.message)
    }
  }

  const handleOpenEdit = (post) => {
    setActiveMenuId(null)
    setSelectedPost(post)
    setIsPostModalOpen(true)
  }

  const handleOpenNew = () => {
    setSelectedPost(null)
    setIsPostModalOpen(true)
  }

  const handleAiApply = (aiData) => {
    setSelectedPost({
      title: aiData.title,
      category: aiData.category,
      excerpt: aiData.excerpt,
      content: aiData.content,
      is_published: false,
    })
    setIsAiModalOpen(false)
    setIsPostModalOpen(true)
  }

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Ruang Kerja Penulis
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Kelola publikasi naskah artikel blog Anda dan gunakan asisten AI terintegrasi search engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            aria-label="Buka AI Blog Generator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-sm hover:bg-indigo-100 transition shadow-xs cursor-pointer"
          >
            <IconSparkles size={18} />
            <span>AI Blog Generator</span>
          </button>

          <button
            onClick={handleOpenNew}
            aria-label="Tulis Artikel Baru"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <IconPlus size={18} />
            <span>Tulis Artikel Baru</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Stats Cards */}
      <PostStats stats={stats} loading={loading} />

      {/* Search and Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IconFileText size={20} className="text-blue-600" />
            <span>Daftar Artikel Anda</span>
          </h2>

          <input
            id="author-search-input"
            name="author-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari artikel di ruang kerja"
            placeholder="Cari artikel di ruang kerja..."
            className="w-full sm:w-72 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 animate-pulse">Memuat data artikel...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-2">
              <IconFolder size={40} className="mx-auto text-gray-400 dark:text-gray-600" />
              <p className="font-medium text-gray-700 dark:text-gray-300">Belum ada artikel di ruang kerja</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mulailah menulis artikel pertama atau generate dengan AI!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-3.5 px-6">Judul Artikel</th>
                  <th scope="col" className="py-3.5 px-4">Kategori</th>
                  <th scope="col" className="py-3.5 px-4">Estimasi Baca</th>
                  <th scope="col" className="py-3.5 px-4">Waktu Buat / Terbit</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Publikasi</th>
                  <th scope="col" className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-750 transition duration-150"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white max-w-xs sm:max-w-md truncate">
                      <div className="truncate">{post.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-normal truncate mt-0.5">
                        /{post.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {post.category || 'Umum'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-xs">
                      <div className="flex items-center gap-1">
                        <IconClock size={14} className="text-gray-500" />
                        {formatReadingTime(post.reading_time)}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                      {formatDate(post.published_at || post.created_at)}
                    </td>

                    {/* Toggle Switch */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        aria-label={`Toggle status artikel ${post.title}`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                          post.is_published
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            post.is_published ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        <span>{post.is_published ? 'Terbit' : 'Draf'}</span>
                      </button>
                    </td>

                    {/* Kebab Action Menu (⋮) */}
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                        aria-label="Menu artikel"
                        className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                      >
                        <IconDotsVertical size={18} />
                      </button>

                      {activeMenuId === post.id && (
                        <div className="absolute right-6 mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-20">
                          <button
                            onClick={() => handleOpenEdit(post)}
                            aria-label={`Edit artikel ${post.title}`}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                          >
                            <IconEdit size={16} className="text-blue-600" />
                            <span>Edit Artikel</span>
                          </button>
                          <button
                            onClick={() => handleDeletePost(post)}
                            aria-label={`Hapus artikel ${post.title}`}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                          >
                            <IconTrash size={16} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSaved={fetchData}
        initialData={selectedPost}
        isDark={isDark}
      />

      {/* AI Generator Modal */}
      <AiPostGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={handleAiApply}
        isDark={isDark}
      />
    </div>
  )
}

export default AuthorDashboard
