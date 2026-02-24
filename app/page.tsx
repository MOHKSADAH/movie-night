"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Film,
  List,
  Eye,
  CalendarDays,
  ChevronRight,
  Star,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {value === undefined ? (
                <Skeleton className="h-7 w-12 mt-1" />
              ) : (
                <p className="text-2xl font-bold mt-0.5">{value}</p>
              )}
            </div>
            <div className="p-2.5 rounded-full bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser);
  const watchlistCount = useQuery(api.watchlist.getWatchlistCount);
  const watchedCount = useQuery(api.watched.getWatchedCount);
  const upcomingNights = useQuery(api.nights.getUpcomingNights);
  const recentWatched = useQuery(api.watched.getRecentWatched, { limit: 3 });
  const watchlist = useQuery(api.watchlist.getWatchlist);

  const nextNight = upcomingNights?.[0];
  const topPicks = watchlist?.slice(0, 3);

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          {user === undefined ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback>
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">
                  Welcome back
                  {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your group movie tracker
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            label="Watchlist"
            value={watchlistCount}
            icon={List}
            href="/watchlist"
          />
          <StatCard
            label="Watched"
            value={watchedCount}
            icon={Eye}
            href="/watched"
          />
          <div className="col-span-2 md:col-span-1">
            <Link href="/calendar">
              <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Next Night
                      </p>
                      {upcomingNights === undefined ? (
                        <Skeleton className="h-5 w-28 mt-1" />
                      ) : nextNight ? (
                        <p className="text-sm font-semibold mt-0.5">
                          {new Date(nextNight.date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          None scheduled
                        </p>
                      )}
                    </div>
                    <div className="p-2.5 rounded-full bg-muted">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Next movie night */}
        {nextNight && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Next Movie Night</h2>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  All nights <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <Link href={`/night/${nextNight._id}`}>
              <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{nextNight.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date(nextNight.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {nextNight.attendees.length} attending
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {nextNight.candidates.length} candidates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Top watchlist picks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Top Watchlist Picks</h2>
              <Link href="/watchlist">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {watchlist === undefined ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3.5 rounded-lg border border-border"
                  >
                    <Skeleton className="w-14 h-21 rounded shrink-0" />
                    <div className="flex-1 space-y-1.5 py-0.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-3 w-1/3 mt-2" />
                    </div>
                  </div>
                ))
              ) : topPicks && topPicks.length > 0 ? (
                topPicks.map((entry) =>
                  entry.movie ? (
                    <div
                      key={entry._id}
                      className="flex gap-3 p-3.5 rounded-lg border border-border bg-card"
                    >
                      <div className="relative w-14 h-21 rounded overflow-hidden bg-muted shrink-0">
                        {entry.movie.poster &&
                          entry.movie.poster !== "/placeholder.jpg" && (
                            <Image
                              src={entry.movie.poster}
                              alt={entry.movie.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          )}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-semibold truncate">
                          {entry.movie.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.movie.releaseYear}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {entry.movie.imdbRating != null && (
                            <span className="text-xs text-muted-foreground">
                              IMDb{" "}
                              <span className="font-medium text-foreground">
                                {entry.movie.imdbRating.toFixed(1)}
                              </span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{entry.upvotes.length}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null,
                )
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Film className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Watchlist is empty</p>
                  <Link href="/watchlist">
                    <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                      Add some movies
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recently watched */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recently Watched</h2>
              <Link href="/watched">
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  View all <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {recentWatched === undefined ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3.5 rounded-lg border border-border"
                  >
                    <Skeleton className="w-14 h-21 rounded shrink-0" />
                    <div className="flex-1 space-y-1.5 py-0.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                      <Skeleton className="h-3 w-1/3 mt-2" />
                    </div>
                  </div>
                ))
              ) : recentWatched.length > 0 ? (
                recentWatched.map((entry) => {
                  if (!entry.movie) return null;
                  const avgRating =
                    entry.ratings.length > 0
                      ? entry.ratings.reduce((s, r) => s + r.score, 0) /
                        entry.ratings.length
                      : null;
                  return (
                    <div
                      key={entry._id}
                      className="flex gap-3 p-3.5 rounded-lg border border-border bg-card"
                    >
                      <div className="relative w-14 h-21 rounded overflow-hidden bg-muted shrink-0">
                        {entry.movie.poster &&
                          entry.movie.poster !== "/placeholder.jpg" && (
                            <Image
                              src={entry.movie.poster}
                              alt={entry.movie.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          )}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className="text-sm font-semibold truncate">
                          {entry.movie.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.watchedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {entry.movie.imdbRating != null && (
                            <span className="text-xs text-muted-foreground">
                              IMDb{" "}
                              <span className="font-medium text-foreground">
                                {entry.movie.imdbRating.toFixed(1)}
                              </span>
                            </span>
                          )}
                          {avgRating != null && (
                            <span className="flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">
                                {avgRating.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground">
                                group
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Nothing watched yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
