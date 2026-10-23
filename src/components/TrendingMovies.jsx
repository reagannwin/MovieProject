const TrendingMovies = ({ movies }) => {
  if (!movies?.length) return null

  return (
    <section className="trending">
      <h2>Trending Searches</h2>

      <ul>
        {movies.map((movie, index) => (
          <li key={movie.$id}>
            <p>{index + 1}</p>
            <img
              src={movie.poster_url || '/no-movie.png'}
              alt={movie.searchTerm}
              title={movie.searchTerm}
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default TrendingMovies
