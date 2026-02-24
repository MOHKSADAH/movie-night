"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { WatchlistCard } from "@/components/movie-card";
import { TMDBSearch } from "@/components/tmdb-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Film } from "lucide-react";
import { toast } from "sonner";

type SortOption = "votes" | "recent";

export default function WatchlistPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("votes");

  const user = useQuery(api.users.getCurrentUser);
  const watchlist = useQuery(api.watchlist.getWatchlist);
  const toggleUpvote = useMutation(api.watchlist.toggleUpvote);
  const removeFromWatchlist = useMutation(api.watchlist.removeFromWatchlist);

  const handleUpvote = async (entryId: string) => {
    try {
      await toggleUpvote({ entryId: entryId as Parameters<typeof toggleUpvote>[0]["entryId"] });
    } catch {
      toast.error("Failed to upvote");
    }
  };

  const handleRemove = async (entryId: string) => {
    try {
      await removeFromWatchlist({ entryId: entryId as Parameters<typeof removeFromWatchlist>[0]["entryId"] });
      toast.success("Removed from watchlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const filteredList = watchlist
    ?.filter((entry) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        entry.movie?.title.toLowerCase().includes(q) ||
        entry.movie?.genres.some((g) => g.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sort === "votes") return b.upvotes.length - a.upvotes.length;
      return b.addedAt - a.addedAt;
    });

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {watchlist === undefined
                ? "Loading..."
                : `${watchlist.length} movies`}
            </p>
          </div>
          <Button onClick={() => setSearchOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Movie
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by title or genre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <Button
              variant={sort === "votes" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSort("votes")}
            >
              Top voted
            </Button>
            <Button
              variant={sort === "recent" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSort("recent")}
            >
              Recent
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {watchlist === undefined ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg border border-border"
              >
                <Skeleton className="w-16 h-24 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            ))
          ) : filteredList && filteredList.length > 0 ? (
            filteredList.map((entry) =>
              entry.movie ? (
                <WatchlistCard
                  key={entry._id}
                  movie={entry.movie}
                  upvotes={entry.upvotes.length}
                  hasUpvoted={user ? entry.upvotes.includes(user._id) : false}
                  addedBy={entry.addedBy?.name ?? undefined}
                  note={entry.note ?? undefined}
                  onUpvote={() => handleUpvote(entry._id)}
                  onRemove={() => handleRemove(entry._id)}
                  canRemove={user ? entry.addedBy?._id === user._id : false}
                />
              ) : null,
            )
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Film className="h-12 w-12 mx-auto mb-3 opacity-20" />
              {filter ? (
                <p className="text-sm">No movies match your filter</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Watchlist is empty</p>
                  <p className="text-xs mt-1">
                    Add movies to watch with your crew
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add your first movie
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <TMDBSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode="watchlist"
      />
    </AppShell>
  );
}
