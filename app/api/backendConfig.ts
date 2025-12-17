const normalizeUrl = (value?: string) => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/$/, '')
  }
  return `http://${trimmed.replace(/\/$/, '')}`
}

export const getBackendBaseUrl = () => {
  const fromEnv =
    normalizeUrl(process.env.DJANGO_BACKEND_URL) ||
    normalizeUrl(process.env.BACKEND_HOST)

  return fromEnv || 'http://127.0.0.1:8001'
}



