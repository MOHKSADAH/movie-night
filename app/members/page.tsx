"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import Link from "next/link";

export default function MembersPage() {
  const users = useQuery(api.users.listUsers);

  return (
    <AppShell>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users === undefined ? "Loading..." : `${users.length} members`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {users === undefined ? (
            [...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-1.5 w-full">
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-3 w-32 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <Link key={user._id} href={`/profile/${user._id}`}>
                <Card className="hover:bg-accent/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="text-xl">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">
                        {user.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-35">
                        {user.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No members yet</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
