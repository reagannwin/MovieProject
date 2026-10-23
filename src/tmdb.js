const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export const isTmdbConfigured = Boolean(API_KEY)

/**
 * Fetch movies from TMDB. With a query it searches; without one it returns
 * the current most popular movies. Pass an AbortSignal so a newer request
 * can cancel an older one that's still in flight.
 */
export const fetchMovies = async (query = '', { signal } = {}) => {
  if (!API_KEY) {
    throw new Error('Missing VITE_TMDB_API_KEY. Copy .env.example to .env.local and add your key.')
  }

  const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false`

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    signal,
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('TMDB rejected the API key. Use the "API Read Access Token" (v4), not the short v3 key.')
    }
    throw new Error(`TMDB request failed (${response.status})`)
  }

  const data = await response.json()
  return data.results ?? []
}
