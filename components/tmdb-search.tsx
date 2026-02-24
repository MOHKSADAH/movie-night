"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface TmdbDetail {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

interface TMDBSearchProps {
  open: boolean;
  onClose: () => void;
  onMovieAdded?: (movieId: Id<"movies">) => void;
  mode?: "watchlist" | "candidate";
  nightId?: Id<"movie_nights">;
}

export function TMDBSearch({
  open,
  onClose,
  onMovieAdded,
  mode = "watchlist",
  nightId,
}: TMDBSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  const upsertMovie = useMutation(api.movies.upsertMovie);
  const addToWatchlist = useMutation(api.watchlist.addToWatchlist);
  const addCandidate = useMutation(api.nights.addCandidate);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Live debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleAdd = async (tmdbMovie: TmdbMovie) => {
    setAdding(tmdbMovie.id);
    try {
      const res = await fetch(`/api/tmdb/movie/${tmdbMovie.id}`);
      const detail: TmdbDetail = await res.json();

      const movieId = await upsertMovie({
        tmdbId: detail.id,
        title: detail.title,
        poster: detail.poster_path ? `${TMDB_IMG}${detail.poster_path}` : "/placeholder.jpg",
        backdrop: detail.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
          : undefined,
        overview: detail.overview,
        genres: detail.genres.map((g) => g.name),
        runtime: detail.runtime ?? undefined,
        releaseYear: detail.release_date
          ? new Date(detail.release_date).getFullYear()
          : 0,
        imdbRating: detail.vote_average,
        imdbVotes: detail.vote_count,
      });

      if (mode === "watchlist") {
        await addToWatchlist({ movieId });
        toast.success(`"${detail.title}" added to watchlist`);
      } else if (mode === "candidate" && nightId) {
        await addCandidate({ nightId, movieId });
        toast.success(`"${detail.title}" added as candidate`);
      }

      setAdded((prev) => new Set(prev).add(tmdbMovie.id));
      onMovieAdded?.(movieId);
    } catch {
      toast.error("Failed to add movie");
    } finally {
      setAdding(null);
    }
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setAdded(new Set());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle>
            {mode === "watchlist" ? "Add to Watchlist" : "Add Candidate"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-3">
          <Input
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {loading && (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 p-2">
                  <Skeleton className="w-10 h-14 rounded shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && results.length === 0 && query && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No results found
            </p>
          )}

          {!loading && results.length === 0 && !query && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Start typing to search movies
            </p>
          )}

          {results.map((movie) => {
            const isAdded = added.has(movie.id);
            const isAdding = adding === movie.id;
            const year = movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : null;

            return (
              <div
                key={movie.id}
                className="flex items-center gap-3 rounded-lg hover:bg-accent/40 transition-colors p-2"
              >
                <div className="relative shrink-0 w-10 h-14 rounded overflow-hidden bg-muted">
                  {movie.poster_path ? (
                    <Image
                      src={`${TMDB_IMG}${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{movie.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {year && (
                      <span className="text-xs text-muted-foreground">{year}</span>
                    )}
                    {movie.vote_average > 0 && (
                      <div className="flex items-center gap-1 bg-yellow-500/10 rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-bold text-yellow-600">IMDb</span>
                        <span className="text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isAdded ? "secondary" : "default"}
                  className="shrink-0 h-7 w-7 p-0"
                  onClick={() => !isAdded && handleAdd(movie)}
                  disabled={isAdding || isAdded}
                >
                  {isAdded ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isAdding ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { Badge };
