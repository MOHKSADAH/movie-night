"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, Star, Search, Plus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type WatchedEntry = {
  _id: Id<"watched_entries">;
  movieId: Id<"movies">;
  watchedAt: number;
  nightId?: Id<"movie_nights">;
  ratings: { userId: Id<"users">; score: number; note?: string }[];
  movie: {
    _id: Id<"movies">;
    title: string;
    poster: string;
    releaseYear: number;
    imdbRating?: number;
    genres: string[];
    overview: string;
    runtime?: number;
  } | null;
};

type TmdbResult = {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string;
  vote_average?: number;
};

type TmdbDetail = TmdbResult & {
  overview?: string;
  backdrop_path?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
};

function LogMovieDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TmdbDetail | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [nightId, setNightId] = useState<string>("none");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const upsertMovie = useMutation(api.movies.upsertMovie);
  const addWatchedEntry = useMutation(api.watched.addWatchedEntry);
  const addRating = useMutation(api.watched.addRating);
  const nights = useQuery(api.nights.getNights);

  const pastNights = nights?.filter((n) => n.status === "done") ?? [];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/tmdb/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setResults(data.results?.slice(0, 5) ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectMovie = async (result: TmdbResult) => {
    const res = await fetch(`/api/tmdb/movie/${result.id}`);
    const data = await res.json();
    setSelectedMovie(data);
    setResults([]);
    setQuery("");
  };

  const handleNightSelect = (value: string) => {
    setNightId(value);
    if (value !== "none") {
      const night = nights?.find((n) => n._id === value);
      if (night) setDate(new Date(night.date));
    }
  };

  const handleSubmit = async () => {
    if (!selectedMovie || !date || score === 0) {
      toast.error("Please select a movie, date, and rating");
      return;
    }
    setSaving(true);
    try {
      const movieId = await upsertMovie({
        tmdbId: selectedMovie.id,
        title: selectedMovie.title,
        poster: selectedMovie.poster_path
          ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
          : "/placeholder.jpg",
        backdrop: selectedMovie.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${selectedMovie.backdrop_path}`
          : undefined,
        overview: selectedMovie.overview ?? "",
        genres: selectedMovie.genres?.map((g) => g.name) ?? [],
        runtime: selectedMovie.runtime ?? undefined,
        releaseYear: selectedMovie.release_date
          ? new Date(selectedMovie.release_date).getFullYear()
          : 0,
        imdbRating: selectedMovie.vote_average ?? undefined,
      });
      const entryId = await addWatchedEntry({
        movieId,
        watchedAt: date.getTime(),
        nightId:
          nightId !== "none"
            ? (nightId as Id<"movie_nights">)
            : undefined,
      });
      await addRating({ entryId, score, note: note || undefined });
      toast.success("Movie logged");
      setSelectedMovie(null);
      setDate(undefined);
      setScore(0);
      setNote("");
      setNightId("none");
      onClose();
    } catch {
      toast.error("Failed to log movie");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log a Past Movie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Movie search / selected */}
          {!selectedMovie ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Movie</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a movie..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {searching && (
                <p className="text-xs text-muted-foreground text-center py-1">
                  Searching...
                </p>
              )}
              {results.length > 0 && (
                <div className="border border-border rounded-md divide-y divide-border overflow-hidden">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="w-full flex items-center gap-2.5 p-2.5 hover:bg-accent transition-colors text-left"
                      onClick={() => handleSelectMovie(r)}
                    >
                      {r.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                          alt={r.title}
                          width={32}
                          height={48}
                          className="rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-12 bg-muted rounded shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.release_date?.split("-")[0]}
                          {r.vote_average
                            ? ` · IMDb ${r.vote_average.toFixed(1)}`
                            : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {selectedMovie.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  width={40}
                  height={60}
                  className="rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedMovie.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedMovie.release_date?.split("-")[0]}
                  {selectedMovie.vote_average
                    ? ` · IMDb ${selectedMovie.vote_average.toFixed(1)}`
                    : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 shrink-0"
                onClick={() => setSelectedMovie(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Movie night link (optional) */}
          {pastNights.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Movie Night{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <select
                value={nightId}
                onChange={(e) => handleNightSelect(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="none">No movie night</option>
                {pastNights.map((night) => (
                  <option key={night._id} value={night._id}>
                    {night.title} ·{" "}
                    {new Date(night.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date Watched</label>
            <div className="flex justify-center border border-border rounded-md py-2">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ after: new Date() }}
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-2",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-md flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm p-0 relative",
                  day: "h-8 w-8 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  day_today: "border border-border",
                  day_disabled:
                    "text-muted-foreground opacity-30 cursor-not-allowed",
                  day_outside: "text-muted-foreground opacity-30",
                }}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex justify-center">
              <StarRating value={score} onChange={setScore} size="lg" max={10} />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Note{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              placeholder="What did you think?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || !selectedMovie || !date || score === 0}
            >
              {saving ? "Saving..." : "Log movie"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RatingDialog({
  entry,
  currentUserId,
  open,
  onClose,
}: {
  entry: WatchedEntry;
  currentUserId: Id<"users"> | undefined;
  open: boolean;
  onClose: () => void;
}) {
  const myRating = entry.ratings.find((r) => r.userId === currentUserId);
  const [score, setScore] = useState(myRating?.score ?? 0);
  const [note, setNote] = useState(myRating?.note ?? "");
  const [saving, setSaving] = useState(false);

  const addRating = useMutation(api.watched.addRating);

  const handleSave = async () => {
    if (score === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSaving(true);
    try {
      await addRating({ entryId: entry._id, score, note: note || undefined });
      toast.success("Rating saved");
      onClose();
    } catch {
      toast.error("Failed to save rating");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate {entry.movie?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex justify-center">
            <StarRating value={score} onChange={setScore} size="lg" max={10} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Note (optional)</label>
            <Input
              placeholder="What did you think?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WatchedPage() {
  const [filter, setFilter] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [ratingEntry, setRatingEntry] = useState<WatchedEntry | null>(null);

  const user = useQuery(api.users.getCurrentUser);
  const entries = useQuery(api.watched.getWatchedEntries);

  const filtered = entries?.filter((entry) => {
    if (!filter) return true;
    return entry.movie?.title.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Watched History
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {entries === undefined
                ? "Loading..."
                : `${entries.length} movies watched`}
            </p>
          </div>
          <Button onClick={() => setLogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Log movie
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search watched movies..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {entries === undefined ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-3 p-4 rounded-lg border border-border"
              >
                <Skeleton className="w-16 h-24 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ))
          ) : filtered && filtered.length > 0 ? (
            filtered.map((entry) => {
              if (!entry.movie) return null;
              const avgRating =
                entry.ratings.length > 0
                  ? entry.ratings.reduce((s, r) => s + r.score, 0) /
                    entry.ratings.length
                  : undefined;
              const myRating = user
                ? entry.ratings.find((r) => r.userId === user._id)
                : undefined;

              return (
                <div
                  key={entry._id}
                  className="flex gap-3 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="relative w-16 h-24 rounded overflow-hidden bg-muted shrink-0">
                    {entry.movie.poster &&
                      entry.movie.poster !== "/placeholder.jpg" && (
                        <Image
                          src={entry.movie.poster}
                          alt={entry.movie.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {entry.movie.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.movie.releaseYear}
                          {entry.movie.runtime
                            ? ` · ${entry.movie.runtime}m`
                            : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {new Date(entry.watchedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {entry.movie.imdbRating && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 rounded px-1.5 py-0.5">
                          <span className="text-[10px] font-bold text-yellow-600">
                            IMDb
                          </span>
                          <span className="text-xs font-semibold">
                            {entry.movie.imdbRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {avgRating !== undefined && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            group ({entry.ratings.length})
                          </span>
                        </div>
                      )}
                      {myRating && (
                        <Badge variant="secondary" className="text-xs">
                          You: {myRating.score}/10
                        </Badge>
                      )}
                    </div>

                    {myRating?.note && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">
                        &ldquo;{myRating.note}&rdquo;
                      </p>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs px-2 -ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setRatingEntry(entry as WatchedEntry)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {myRating ? "Update rating" : "Rate this"}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-20" />
              {filter ? (
                <p className="text-sm">No movies match your search</p>
              ) : (
                <>
                  <p className="text-sm font-medium">No movies watched yet</p>
                  <p className="text-xs mt-1">
                    Log past movies or watch during a Movie Night
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-1 h-auto p-0 text-xs"
                    onClick={() => setLogOpen(true)}
                  >
                    Log your first movie
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <LogMovieDialog open={logOpen} onClose={() => setLogOpen(false)} />

      {ratingEntry && (
        <RatingDialog
          entry={ratingEntry}
          currentUserId={user?._id}
          open={!!ratingEntry}
          onClose={() => setRatingEntry(null)}
        />
      )}
    </AppShell>
  );
}
