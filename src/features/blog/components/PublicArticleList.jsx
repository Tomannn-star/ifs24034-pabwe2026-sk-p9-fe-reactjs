import { useState, useEffect } from 'react'
import { IconClock, IconUser, IconCalendar, IconFolder } from '@tabler/icons-react'
import blogApi from '../api/blogApi'
import { formatDate, formatReadingTime } from '../../../helpers/toolsHelper'

const CATEGORIES = ['Semua', 'Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export const PublicArticleList = ({ searchQuery = '', onSelectArticle }) => {
  const [posts, setPosts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const res = await blogApi.getPublicPosts(searchQuery, selectedCategory)
        setPosts(res.data || [])
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [searchQuery, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
          Eksplorasi Wawasan &amp; Inovasi
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Artikel dan gagasan teknologi terkini yang ditulis oleh civitas Delcom dengan dukungan integrasi AI Generator.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              data-testid="article-skeleton"
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 animate-pulse space-y-4"
            >
              <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm w-1/3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-sm w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <IconFolder className="mx-auto text-gray-500 mb-3" size={48} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tidak ada artikel ditemukan</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => onSelectArticle && onSelectArticle(post.slug)}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col"
            >
              {/* Cover Image */}
              <div className="h-48 w-full bg-gradient-to-tr from-blue-600 to-indigo-700 relative overflow-hidden">
                {post.cover_image_path ? (
                  <img
                    src={post.cover_image_path}
                    alt={`Sampul artikel ${post.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6 text-white text-opacity-90 font-bold text-xl text-center">
                    {post.title}
                  </div>
                )}
                <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold rounded-full">
                  {post.category || 'Umum'}
                </span>
              </div>

              {/* Content body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <IconClock size={14} />
                      {formatReadingTime(post.reading_time)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar size={14} />
                      {formatDate(post.published_at || post.created_at)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 140) + '...'}
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                    {post.author_name ? post.author_name[0].toUpperCase() : <IconUser size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {post.author_name || 'Penulis Delcom'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Penulis Kontributor</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default PublicArticleList
