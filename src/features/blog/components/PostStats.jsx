import { IconFiles, IconCircleCheck, IconClockHour4 } from '@tabler/icons-react'

export const PostStats = ({ stats, loading = false }) => {
  const cards = [
    {
      title: 'Total Artikel',
      value: stats?.total ?? 0,
      icon: <IconFiles className="text-blue-600" size={28} />,
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Terbit',
      value: stats?.total_published ?? 0,
      icon: <IconCircleCheck className="text-emerald-600" size={28} />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Belum Selesai / Draf',
      value: stats?.total_draft ?? 0,
      icon: <IconClockHour4 className="text-amber-600" size={28} />,
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            data-testid="stats-skeleton"
            className="h-28 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse p-6"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-6 rounded-2xl border ${card.bg} shadow-xs flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5`}
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <h3 className={`text-3xl font-extrabold ${card.textColor}`}>
              {card.value}
            </h3>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PostStats
