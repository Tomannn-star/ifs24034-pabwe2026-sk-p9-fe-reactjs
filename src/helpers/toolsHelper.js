import Swal from 'sweetalert2'

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    showConfirmButton: false,
  })
}

export const showError = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#ef4444',
  })
}

export const showConfirm = async (
  title,
  text = '',
  confirmButtonText = 'Ya, lanjutkan',
  cancelButtonText = 'Batal'
) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText,
  })
  return result.isConfirmed
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatReadingTime = (minutes) => {
  const mins = Math.max(1, parseInt(minutes, 10) || 1)
  return `${mins} menit baca`
}
