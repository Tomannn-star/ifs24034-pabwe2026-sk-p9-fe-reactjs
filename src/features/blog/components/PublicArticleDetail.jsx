import { useState, useEffect } from 'react'
import { IconArrowLeft, IconClock, IconCalendar, IconUser, IconAlertCircle } from '@tabler/icons-react'
import blogApi from '../api/blogApi'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { formatDate, formatReadingTime } from '../../../helpers/toolsHelper'

export const PublicArticleDetail = ({ slug, onBack, isDark = false }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await blogApi.getPublicPostBySlug(slug)
        setPost(res.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDetail()
    } else {
      setLoading(false)
    }
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-sm w-24" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-sm w-3/4" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-sm w-1/2" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm w-5/6" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <IconAlertCircle className="mx-auto text-red-500" size={56} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Artikel Tidak Ditemukan</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {error || 'Artikel yang Anda cari tidak tersedia atau belum diterbitkan.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition cursor-pointer"
        >
          <IconArrowLeft size={18} /> Kembali ke Daftar Artikel
        </button>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition cursor-pointer"
        >
          <IconArrowLeft size={18} /> Kembali ke Jelajah Artikel
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold tracking-wide uppercase">
            {post.category || 'Umum'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <IconClock size={14} />
            {formatReadingTime(post.reading_time)}
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <IconCalendar size={14} />
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-normal leading-relaxed italic border-l-4 border-blue-500 pl-4 py-1">
            {post.excerpt}
          </p>
        )}

        {/* Author pill */}
        <div className="pt-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {post.author_name ? post.author_name[0].toUpperCase() : <IconUser size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {post.author_name || 'Penulis Kontributor'}
            </p>
            <p className="text-xs text-gray-400">Civitas Delcom Blog</p>
          </div>
        </div>
      </header>

      {/* Cover image if available */}
      {post.cover_image_path && (
        <div className="rounded-2xl overflow-hidden shadow-lg max-h-96 w-full">
          <img
            src={post.cover_image_path}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Markdown Content Viewer */}
      <section className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xs">
        <MarkdownViewer initialValue={post.content || ''} isDark={isDark} />
      </section>

      {/* Footer / Author bio */}
      <footer className="bg-gray-50 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
          {post.author_name ? post.author_name[0].toUpperCase() : 'D'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white">Ditulis oleh {post.author_name || 'Penulis Delcom'}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Terima kasih telah membaca artikel ini. Dibuat dan diterbitkan secara mandiri melalui platform Delcom Blog.
          </p>
        </div>
      </footer>
    </article>
  )
}

export default PublicArticleDetail
