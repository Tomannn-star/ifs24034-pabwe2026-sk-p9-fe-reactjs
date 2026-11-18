import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostStats from './PostStats'

describe('PostStats', () => {
  it('renders loading skeletons when loading=true', () => {
    render(<PostStats loading={true} />)
    expect(screen.getAllByTestId('stats-skeleton').length).toBe(3)
  })

  it('renders 3 stat cards with provided values', () => {
    const statsData = {
      total: 12,
      total_published: 8,
      total_draft: 4,
    }

    render(<PostStats stats={statsData} loading={false} />)

    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()

    expect(screen.getByText('Total Terbit')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()

    expect(screen.getByText('Belum Selesai / Draf')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('handles empty stats gracefully with 0 defaults', () => {
    render(<PostStats stats={null} loading={false} />)
    expect(screen.getAllByText('0').length).toBe(3)
  })
})
