# Movie Finder

A React app for browsing and searching movies. Movie data comes from [TMDB](https://www.themoviedb.org/), and an optional [Appwrite](https://appwrite.io/) database tracks what people search for so the most popular searches show up in a "Trending Searches" row.

![Hero banner](public/hero.png)

## Features

- Browse the most popular movies on TMDB as soon as the page loads
- Search as you type, with a 500 ms debounce so the app isn't firing a request on every keystroke
- Stale results are cancelled, so a slow earlier request can't overwrite what you searched for last
- Trending Searches: the top 5 search terms, ranked by how often people searched them (needs Appwrite)
- Clear messages for a missing or wrong API key, failed requests, and searches with no results
- Responsive grid from phone to desktop, styled with Tailwind CSS

## Tech stack

| Tool | What it does here |
| --- | --- |
| [React 19](https://react.dev/) | UI |
| [Vite 7](https://vite.dev/) | Dev server and build |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [TMDB API](https://developer.themoviedb.org/docs) | Movie data and posters |
| [Appwrite](https://appwrite.io/) (TablesDB) | Stores search counts for the trending row |
| [react-use](https://github.com/streamich/react-use) | `useDebounce` hook |

## Getting started

You need Node.js 20 or newer.

```bash
git clone https://github.com/reagannwin/MovieProject.git
cd MovieProject
npm install
cp .env.example .env.local
```

Open `.env.local` and add your TMDB token (see below), then run:

```bash
npm run dev
```

The app runs at http://localhost:5173.

### 1. TMDB (required)

1. Make a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings > API** and request an API key.
3. Copy the **API Read Access Token**. It's the long one that starts with `eyJ`. The short "API Key" won't work, because the app sends the token as a Bearer header.
4. Paste it into `.env.local` as `VITE_TMDB_API_KEY`.

### 2. Appwrite (optional, for Trending Searches)

Skip this and the app still works; the trending row just won't appear.

1. Create a project on [Appwrite Cloud](https://cloud.appwrite.io/).
2. Under **Overview > Platforms**, add a Web platform with hostname `localhost` (and your deployed domain later).
3. Create a database, then a table inside it with these columns:

   | Column | Type | Notes |
   | --- | --- | --- |
   | `searchTerm` | String (size 255) | required |
   | `count` | Integer | required, default 1 |
   | `movie_id` | Integer | |
   | `poster_url` | URL | |

4. Add an **index** on `searchTerm` (key) and one on `count` (key). Appwrite needs these to filter and sort.
5. In the table's **Settings > Permissions**, give the `Any` role **Create**, **Read**, and **Update**.
6. Copy the project, database, and table IDs into `.env.local`. If your project isn't in the Frankfurt region, also change `VITE_APPWRITE_ENDPOINT` to match the endpoint shown in your project settings.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_TMDB_API_KEY` | Yes | TMDB API Read Access Token |
| `VITE_APPWRITE_ENDPOINT` | No | Appwrite endpoint, defaults to `https://fra.cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | No | Appwrite project ID |
| `VITE_APPWRITE_DATABASE_ID` | No | Appwrite database ID |
| `VITE_APPWRITE_TABLE_ID` | No | Appwrite table ID |

`.env.local` is gitignored. Don't commit your keys.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
  App.jsx                  page layout, search state, data loading
  tmdb.js                  TMDB API calls
  appwrite.js              search tracking and trending queries
  components/
    MovieCard.jsx          one movie in the grid
    Search.jsx             search input
    Spinner.jsx            loading indicator
    TrendingMovies.jsx     top 5 trending searches
  index.css                Tailwind theme and component styles
public/                    images and icons
```

## A note on keys

Anything starting with `VITE_` gets bundled into the JavaScript the browser downloads, so your TMDB token is visible to anyone who opens dev tools on the live site. That's normal for a portfolio project like this one. For a real product you'd put the TMDB calls behind a small server or an Appwrite Function so the token never reaches the browser.

## Credits

Movie data and images from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
