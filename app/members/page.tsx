"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MembersPage() {
  const users = useQuery(api.users.listUsers);

  return (
    <AppShell>
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/10">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Your Crew
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              {users === undefined
                ? "Loading your movie night team..."
                : users.length === 0
                  ? "Invite your friends to join the fun!"
                  : `${users.length} ${users.length === 1 ? "member" : "members"} watching together`}
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users === undefined ? (
              [...Array(8)].map((_, i) => (
                <Card
                  key={i}
                  className="border-0 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-28 mx-auto" />
                      <Skeleton className="h-3 w-32 mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <Link key={user._id} href={`/profile/${user._id}`}>
                  <Card
                    className={cn(
                      "border-0 bg-card/50 backdrop-blur-sm overflow-hidden",
                      "hover:bg-card/80 hover:shadow-lg dark:hover:shadow-primary/10",
                      "transition-all duration-300 hover:scale-105 cursor-pointer",
                      "group h-full"
                    )}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <Avatar className="h-20 w-20 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                          <AvatarImage src={user.avatar ?? user.image ?? undefined} />
                          <AvatarFallback className="text-lg font-semibold bg-linear-to-br from-primary/20 to-primary/10">
                            {user.name?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-background" />
                      </div>

                      {/* Info */}
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">
                          {user.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-40">
                          {user.email}
                        </p>
                      </div>

                      {/* Action Hint */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                        View Profile
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-muted/50">
                    <Users className="h-8 w-8 opacity-40" />
                  </div>
                </div>
                <p className="text-lg font-medium">No members yet</p>
                <p className="text-sm mt-1">
                  Invite your friends to start watching together
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
