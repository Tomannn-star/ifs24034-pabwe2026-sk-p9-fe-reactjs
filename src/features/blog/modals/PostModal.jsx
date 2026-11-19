import { useState, useEffect } from 'react'
import { IconX, IconDeviceFloppy, IconCheck } from '@tabler/icons-react'
import MarkdownEditor from '../../../components/MarkdownEditor'
import blogApi from '../api/blogApi'
import { showSuccess, showError } from '../../../helpers/toolsHelper'

const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export const PostModal = ({
  isOpen,
  onClose,
  onSaved,
  initialData = null,
  isDark = false,
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [excerpt, setExcerpt] = useState('')
  const [coverImagePath, setCoverImagePath] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setCategory(initialData.category || 'Teknologi')
      setExcerpt(initialData.excerpt || '')
      setCoverImagePath(initialData.cover_image_path || '')
      setContent(initialData.content || '')
      setIsPublished(Boolean(initialData.is_published))
    } else {
      setTitle('')
      setCategory('Teknologi')
      setExcerpt('')
      setCoverImagePath('')
      setContent('')
      setIsPublished(false)
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      showError('Validasi Gagal', 'Judul artikel wajib diisi')
      return
    }

    setLoading(true)
    const payload = {
      title,
      category,
      excerpt,
      cover_image_path: coverImagePath,
      content,
      is_published: isPublished,
    }

    try {
      if (initialData?.id) {
        await blogApi.updatePost(initialData.id, payload)
        showSuccess('Berhasil Diperbarui', 'Artikel berhasil disimpan')
      } else {
        await blogApi.createPost(payload)
        showSuccess('Berhasil Dibuat', 'Artikel baru berhasil dibuat')
      }
      if (onSaved) onSaved()
      onClose()
    } catch (err) {
      showError('Gagal Menyimpan', err.message || 'Terjadi kesalahan pada server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Distinct Colored Header */}
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {initialData?.id ? 'Edit Artikel' : 'Tulis Artikel Baru'}
          </h2>
          <p className="text-xs text-blue-100">
            {initialData?.id ? 'Perbarui konten dan status publikasi artikel Anda' : 'Buat dan bagikan gagasan berkualitas ke publik'}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup editor modal"
          className="p-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition cursor-pointer"
        >
          <IconX size={22} />
        </button>
      </div>

      {/* Main Full-Width Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label
              htmlFor="post-title"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              id="post-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Judul Artikel"
              placeholder="Masukkan judul artikel yang memikat..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none text-base"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="post-category"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Kategori
            </label>
            <select
              id="post-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Kategori Artikel"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none text-base cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="post-excerpt"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              Ringkasan / Excerpt (Opsional)
            </label>
            <textarea
              id="post-excerpt"
              name="excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              aria-label="Ringkasan atau Excerpt Artikel"
              placeholder="Ringkasan singkat 1-2 kalimat tentang artikel ini..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="post-cover"
              className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              URL Gambar Sampul (Cover Image URL)
            </label>
            <input
              id="post-cover"
              name="cover_image_path"
              type="text"
              value={coverImagePath}
              onChange={(e) => setCoverImagePath(e.target.value)}
              aria-label="URL Gambar Sampul"
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Markdown Editor Wrapper */}
        <div className="space-y-2 flex-1 flex flex-col">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Konten Artikel (Markdown)
          </span>
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden min-h-[400px]">
            <MarkdownEditor
              initialValue={content}
              onChange={setContent}
              isDark={isDark}
              height="450px"
            />
          </div>
        </div>

        {/* Publish Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <label htmlFor="post-publish-checkbox" className="relative flex items-center gap-2 cursor-pointer">
            <input
              id="post-publish-checkbox"
              name="is_published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              aria-label="Terbitkan langsung ke publik"
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Terbitkan Langsung ke Publik
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 -mx-6 -mb-6 lg:-mx-8 lg:-mb-8 px-6 py-4 lg:px-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} />
            <span>{loading ? 'Menyimpan...' : initialData?.id ? 'Perbarui Artikel' : 'Simpan Artikel'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostModal
