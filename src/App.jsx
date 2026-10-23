import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import TrendingMovies from './components/TrendingMovies.jsx'
import { fetchMovies } from './tmdb.js'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const SEARCH_DEBOUNCE_MS = 500

const App = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [movieList, setMovieList] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [trendingMovies, setTrendingMovies] = useState([])

  // Wait until the user stops typing before hitting the API.
  useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), SEARCH_DEBOUNCE_MS, [searchTerm])

  const loadTrendingMovies = useCallback(async () => {
    setTrendingMovies(await getTrendingMovies())
  }, [])

  useEffect(() => {
    // Cancel the previous request when the search term changes, so a slow
    // old response can't overwrite the results for what you typed last.
    const controller = new AbortController()

    const load = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const results = await fetchMovies(debouncedSearchTerm, { signal: controller.signal })
        setMovieList(results)
        setIsLoading(false)

        // Record the search in the background; the UI doesn't wait on it.
        if (debouncedSearchTerm && results.length > 0) {
          updateSearchCount(debouncedSearchTerm, results[0]).then(loadTrendingMovies)
        }
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Error fetching movies:', error)
        setErrorMessage(error.message || 'Error fetching movies. Please try again later.')
        setMovieList([])
        setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [debouncedSearchTerm, loadTrendingMovies])

  useEffect(() => {
    loadTrendingMovies()
  }, [loadTrendingMovies])

  const heading = debouncedSearchTerm ? `Results for "${debouncedSearchTerm}"` : 'Popular Movies'

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Movie posters" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <TrendingMovies movies={trendingMovies} />

        <section className="all-movies">
          <h2>{heading}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movieList.length === 0 ? (
            <p className="text-gray-100">No movies found. Try a different search.</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
