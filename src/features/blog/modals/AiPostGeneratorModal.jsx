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
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Topik / Gagasan Artikel <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Manfaat Framework Golang Gin dan Arsitektur Feature-First untuk Web Skala Besar"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Kategori Target
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                    <IconWorldSearch size={16} />
                    <span>Integrasi Search Engine</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Menelusuri informasi faktual terkini dari mesin pencari dan menyematkannya ke dalam artikel.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <IconWorldSearch size={14} /> Sumber Penelusuran ({generatedResult.sources.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {generatedResult.sources.map((src, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs space-y-1"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{src.title}</p>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{src.url}</span>
                      <IconExternalLink size={12} className="shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Preview Generated Article */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 bg-white dark:bg-gray-900">
          {generatedResult ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase">
                  {generatedResult.category || category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                  {generatedResult.title}
                </h1>
                {generatedResult.excerpt && (
                  <p className="text-sm italic text-gray-600 dark:text-gray-300 border-l-4 border-indigo-500 pl-3">
                    {generatedResult.excerpt}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <MarkdownViewer initialValue={generatedResult.content || ''} isDark={isDark} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 dark:text-gray-500 space-y-3">
              <IconSparkles size={48} className="text-indigo-300 dark:text-indigo-800" />
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Pratinjau Hasil AI</h3>
              <p className="text-sm max-w-sm">
                Isi topik artikel di sebelah kiri dan klik tombol generate untuk melihat draf artikel dan sitasi sumber pencarian.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Distinct Colored Footer */}
      <div className="bg-gray-100 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
        >
          Tutup
        </button>
        {generatedResult && (
          <button
            type="button"
            onClick={handleApplyToEditor}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-md transition cursor-pointer"
          >
            <IconCheck size={18} />
            <span>Terapkan ke Editor</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AiPostGeneratorModal
