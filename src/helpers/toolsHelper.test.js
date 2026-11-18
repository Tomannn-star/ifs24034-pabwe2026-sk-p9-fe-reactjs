import { describe, it, expect, vi } from 'vitest'
import Swal from 'sweetalert2'
import {
  showSuccess,
  showError,
  showConfirm,
  formatDate,
  formatReadingTime,
} from './toolsHelper'

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}))

describe('toolsHelper', () => {
  it('triggers showSuccess with SweetAlert2', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    await showSuccess('Berhasil!', 'Operasi sukses')
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Operasi sukses',
      })
    )
  })

  it('triggers showError with SweetAlert2', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    await showError('Gagal!', 'Terjadi kendala')
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kendala',
      })
    )
  })

  it('triggers showConfirm and returns confirmation status', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    const confirmed = await showConfirm('Hapus artikel?', 'Tindakan ini permanen')
    expect(confirmed).toBe(true)

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false })
    const cancelled = await showConfirm('Hapus artikel?', 'Tindakan ini permanen')
    expect(cancelled).toBe(false)
  })

  it('formats dates accurately for valid and invalid inputs', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate('invalid-date')).toBe('-')

    const dateStr = '2026-11-18T10:00:00Z'
    const formatted = formatDate(dateStr)
    expect(formatted).toContain('2026')
  })

  it('formats reading time string correctly', () => {
    expect(formatReadingTime(3)).toBe('3 menit baca')
    expect(formatReadingTime(0)).toBe('1 menit baca')
    expect(formatReadingTime('invalid')).toBe('1 menit baca')
  })
})
