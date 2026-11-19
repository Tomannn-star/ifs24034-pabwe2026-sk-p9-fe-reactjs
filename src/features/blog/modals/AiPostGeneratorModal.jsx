import { useState } from 'react'
import { IconX, IconSparkles, IconWorldSearch, IconCheck, IconExternalLink } from '@tabler/icons-react'
import blogApi from '../api/blogApi'
import MarkdownViewer from '../../../components/MarkdownViewer'
import { showSuccess, showError } from '../../../helpers/toolsHelper'

const CATEGORIES = ['Teknologi', 'Pendidikan', 'Gaya Hidup', 'Bisnis', 'Opini', 'Umum']

export const AiPostGeneratorModal = ({
  isOpen,
  onClose,
  onApply,
  isDark = false,
}) => {
  const [topic, setTopic] = useState('')
  const [category, setCategory] = useState('Teknologi')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [generatedResult, setGeneratedResult] = useState(null)

  if (!isOpen) return null

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) {
      showError('Validasi Gagal', 'Topik artikel wajib diisi')
      return
    }

    setLoading(true)
    try {
      const res = await blogApi.generateAiArticle({
        topic: topic.trim(),
        category,
        include_web_search: includeWebSearch,
      })
      const resultData = res?.data
      setGeneratedResult(resultData)
      showSuccess('AI Sukses', 'Draf artikel berhasil digenerate!')
    } catch (err) {
      showError('Gagal Generate', err.message || 'Terjadi kesalahan saat memanggil AI service')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyToEditor = () => {
    if (onApply) {
      onApply(generatedResult)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Distinct Colored Header */}
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-700 rounded-xl">
            <IconSparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Blog Generator &amp; Search Engine</h2>
            <p className="text-xs text-indigo-100">
              Buat draf artikel komprehensif didukung fakta web terkini secara instan
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Tutup AI modal"
          className="p-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white transition cursor-pointer"
        >
          <IconX size={22} />
        </button>
      </div>

      {/* Body Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left column: Generator Controls */}
        <div className="w-full lg:w-1/3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-gray-800/40">
          <form onSubmit={handleGenerate} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="ai-topic-input"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
              >
                Topik / Gagasan Artikel <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ai-topic-input"
                name="topic"
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                aria-label="Topik atau Gagasan Artikel"
                placeholder="Contoh: Manfaat Framework Golang Gin dan Arsitektur Feature-First untuk Web Skala Besar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="ai-category-select"
                className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1"
              >
                Kategori Target
              </label>
              <select
                id="ai-category-select"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Kategori Target"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Web Search Integration Checkbox */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
              <label htmlFor="ai-search-checkbox" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="ai-search-checkbox"
                  name="include_web_search"
                  type="checkbox"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  aria-label="Integrasi Search Engine"
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                    <IconWorldSearch size={16} />
                    <span>Integrasi Search Engine</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Menelusuri informasi faktual terkini dari mesin pencari dan menyematkannya ke dalam artikel.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label="Generate Artikel AI"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Sedang Menghasilkan Konten...</span>
              ) : (
                <>
                  <IconSparkles size={18} />
                  <span>Generate Artikel AI</span>
                </>
              )}
            </button>
          </form>

          {/* Web search sources audit list */}
          {generatedResult?.sources && generatedResult.sources.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <IconWorldSearch size={14} /> Sumber Penelusuran ({generatedResult.sources.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {generatedResult.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1"
                  >
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate">{src.title}</span>
                      <IconExternalLink size={12} className="shrink-0" />
                    </a>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{src.snippet}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Preview Generated Draft */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pratinjau Hasil AI</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {generatedResult ? 'Periksa konten sebelum diterapkan ke editor utama' : 'Belum ada konten yang dihasilkan'}
              </p>
            </div>
            {generatedResult && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {generatedResult.category || category}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            {generatedResult ? (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    {generatedResult.title}
                  </h1>
                  {generatedResult.excerpt && (
                    <p className="mt-3 text-base text-gray-700 dark:text-gray-300 italic border-l-4 border-indigo-500 pl-3">
                      {generatedResult.excerpt}
                    </p>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
                  <MarkdownViewer initialValue={generatedResult.content || ''} isDark={isDark} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 space-y-3">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <IconSparkles size={36} />
                </div>
                <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">Siap Membuat Artikel</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm">
                  Ketikkan topik atau ide artikel di panel sebelah kiri lalu tekan tombol &quot;Generate Artikel AI&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Footer apply buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
            <button
              onClick={onClose}
              aria-label="Tutup jendela AI generator"
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleApplyToEditor}
              disabled={!generatedResult}
              aria-label="Terapkan ke editor naskah"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <IconCheck size={16} />
              <span>Terapkan ke Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiPostGeneratorModal
