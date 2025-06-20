import toast from 'react-hot-toast'

export function showApiError(error: any, fallback = 'Something went wrong') {
  let message = fallback
  if (typeof error === 'string') message = error
  else if (error instanceof Error) message = error.message
  else if (error?.error) message = error.error
  else if (error?.message) message = error.message
  toast.error(message)
}

export function showSuccess(message: string) {
  toast.success(message)
} 