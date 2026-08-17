const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const STORAGE_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export function storageUrl(path: string) {
  return `${STORAGE_ORIGIN}/storage/${path}`
}
