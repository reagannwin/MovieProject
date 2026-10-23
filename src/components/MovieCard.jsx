import { TMDB_IMAGE_BASE } from '../tmdb.js'

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language } }) => {
  return (
    <li className="movie-card">
      <img
        src={poster_path ? `${TMDB_IMAGE_BASE}${poster_path}` : '/no-movie.png'}
        alt={`${title} poster`}
        loading="lazy"
      />

      <div className="mt-4">
        <h3 title={title}>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="/star.svg" alt="" aria-hidden="true" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>

          <span>•</span>
          <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
        </div>
      </div>
    </li>
  )
}

export default MovieCard
