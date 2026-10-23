import { Client, ID, Query, TablesDB } from 'appwrite'

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Trending is optional. If Appwrite isn't configured, the app still works
// for browsing and search; the trending row just stays hidden.
export const isAppwriteConfigured = Boolean(PROJECT_ID && DATABASE_ID && TABLE_ID)

const tables = isAppwriteConfigured
  ? new TablesDB(new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID))
  : null

// Normalize so "Batman", "batman " and "BATMAN" count as the same search.
const normalize = (term) => term.trim().toLowerCase()

export const updateSearchCount = async (searchTerm, movie) => {
  if (!tables || !movie) return

  const term = normalize(searchTerm)
  if (!term) return

  try {
    const { rows } = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal('searchTerm', term), Query.limit(1)],
    })

    if (rows.length > 0) {
      // Atomic server-side increment; avoids lost updates when two
      // people search the same term at the same moment.
      await tables.incrementRowColumn({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: rows[0].$id,
        column: 'count',
        value: 1,
      })
    } else {
      await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          searchTerm: term,
          count: 1,
          movie_id: movie.id,
          poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
        },
      })
    }
  } catch (error) {
    console.error('Failed to update search count:', error)
  }
}

export const getTrendingMovies = async (limit = 5) => {
  if (!tables) return []

  try {
    const { rows } = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.orderDesc('count'), Query.limit(limit)],
    })
    return rows
  } catch (error) {
    console.error('Failed to load trending movies:', error)
    return []
  }
}
