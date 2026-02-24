"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, List, Eye } from "lucide-react";
import Image from "next/image";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = id as Id<"users">;

  const currentUser = useQuery(api.users.getCurrentUser);
  const profileUser = useQuery(api.users.getUserById, { userId });
  const stats = useQuery(api.watched.getUserStats, { userId });
  const watchedEntries = useQuery(api.watched.getWatchedEntries);
  const watchlist = useQuery(api.watchlist.getWatchlist);

  const isOwnProfile = currentUser?._id === userId;

  // Filter entries relevant to this user
  const userRatings = watchedEntries
    ?.map((entry) => ({
      ...entry,
      myRating: entry.ratings.find((r) => r.userId === userId),
    }))
    .filter((entry) => entry.myRating);

  const userWatchlistEntries = watchlist?.filter(
    (entry) => entry.addedBy?._id === userId,
  );

  if (profileUser === undefined) {
    return (
      <AppShell>
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (profileUser === null) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          <p>User not found</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profileUser.avatar ?? undefined} />
            <AvatarFallback className="text-xl">
              {profileUser.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{profileUser.name}</h1>
              {isOwnProfile && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profileUser.email}</p>
            {profileUser.createdAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since{" "}
                {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              {stats == null ? (
                <Skeleton className="h-8 w-10 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.moviesWatched}</p>
              )}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Watched</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {stats == null ? (
                <Skeleton className="h-8 w-10 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.ratingsGiven}</p>
              )}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Ratings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {stats == null ? (
                <Skeleton className="h-8 w-10 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                </p>
              )}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <p className="text-xs text-muted-foreground">Avg rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Ratings | Added to watchlist */}
        <Tabs defaultValue="ratings" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="ratings" className="flex-1">
              Ratings ({userRatings?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex-1">
              Added ({userWatchlistEntries?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ratings" className="space-y-2 pt-4">
            {userRatings === undefined ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))
            ) : userRatings.length > 0 ? (
              userRatings
                .sort((a, b) => (b.myRating?.score ?? 0) - (a.myRating?.score ?? 0))
                .map((entry) =>
                  entry.movie ? (
                    <div
                      key={entry._id}
                      className="flex gap-3 p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                        {entry.movie.poster &&
                          entry.movie.poster !== "/placeholder.jpg" && (
                            <Image
                              src={entry.movie.poster}
                              alt={entry.movie.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.movie.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.movie.releaseYear}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-semibold">
                              {entry.myRating?.score}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              /10
                            </span>
                          </div>
                          {entry.myRating?.note && (
                            <span className="text-xs text-muted-foreground italic truncate">
                              &ldquo;{entry.myRating.note}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null,
                )
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No ratings yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-2 pt-4">
            {userWatchlistEntries === undefined ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))
            ) : userWatchlistEntries.length > 0 ? (
              userWatchlistEntries.map((entry) =>
                entry.movie ? (
                  <div
                    key={entry._id}
                    className="flex gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-muted shrink-0">
                      {entry.movie.poster &&
                        entry.movie.poster !== "/placeholder.jpg" && (
                          <Image
                            src={entry.movie.poster}
                            alt={entry.movie.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.movie.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.movie.releaseYear}
                      </p>
                      {entry.movie.genres.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {entry.movie.genres.slice(0, 2).map((g) => (
                            <Badge
                              key={g}
                              variant="secondary"
                              className="text-[10px] h-4 px-1.5"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null,
              )
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <List className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">
                  {isOwnProfile
                    ? "You haven't added anything yet"
                    : "Nothing added yet"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
