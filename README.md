# Movie Night

A real-time collaborative app for managing movie nights with friends. Build a shared watchlist, vote on what to watch, track your history, and rate films together.

## Overview

Movie Night is built around the concept of a group — everyone shares the same watchlist, votes on candidates for each movie night, and rates what they watch. All data syncs in real time across all members via Convex.

## Features

**Watchlist**
Add movies by searching TMDB. Each member can upvote or downvote any entry. Results sort by group vote score or recency.

**Movie Nights**
Schedule nights on the calendar. Add candidate movies from the watchlist, vote as a group, spin the roulette wheel to pick a winner, then log ratings when it's done.

**Watched History**
Every watched movie is logged with a date, group average rating, and personal score/note per member. Browse and search the full history in a poster grid.

**Calendar**
Monthly view with movie poster thumbnails on dates that had a night. Days with candidates show a dimmed preview; days with a picked and rated movie show the full poster with the group score overlay.

**Members & Profiles**
See all group members, their watch count, average rating, and contribution to the watchlist.

**Authentication**
Google OAuth and email/password sign-in. Protected routes redirect unauthenticated users to `/login`.

**Dark / Light Mode**
Theme toggle in the sidebar, persisted to `localStorage` with no flash on load.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Backend / Database | Convex |
| Auth | Convex Auth — Google OAuth + password |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Movie Data | TMDB API |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- [Convex](https://convex.dev) account
- [TMDB API key](https://www.themoviedb.org/settings/api)
- Google OAuth credentials (Client ID + Secret)

### Setup

**1. Install dependencies**

```bash
npm install
```

**2. Initialize Convex**

```bash
npx convex dev
```

This creates your Convex project and opens the dashboard. Set the following environment variables there:

```
TMDB_API_KEY=your_tmdb_api_key
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
SITE_URL=http://localhost:3000
```

**3. Start the dev server**

In a separate terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until authenticated.

## Project Structure

```
app/
  (auth)/login        # Sign-in page
  (auth)/register     # Registration page
  page.tsx            # Dashboard
  watchlist/          # Group watchlist with voting
  watched/            # Watched history
  calendar/           # Movie night calendar
  members/            # Group member directory
  night/[id]/         # Individual movie night detail
  profile/[id]/       # Member profile

components/
  app-shell.tsx       # Sidebar layout + auth guard
  movie-card.tsx      # Watchlist, watched, and poster card variants
  tmdb-search.tsx     # TMDB movie search dialog
  star-rating.tsx     # Rating input component

convex/
  schema.ts           # Database schema
  auth.ts             # Auth configuration
  users.ts            # User queries
  movies.ts           # Movie upsert
  watchlist.ts        # Watchlist queries and mutations
  watched.ts          # Watched entries and ratings
  nights.ts           # Movie night queries and mutations
```

## Scripts

```bash
npm run dev        # Start Next.js development server
npm run build      # Production build
npm run lint       # Run ESLint
```
