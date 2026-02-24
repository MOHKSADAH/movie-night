"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Plus, Film, ChevronRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function CreateNightDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const createNight = useMutation(api.nights.createNight);

  const handleCreate = async () => {
    if (!title.trim() || !date) {
      toast.error("Please enter a title and select a date");
      return;
    }
    setSaving(true);
    try {
      await createNight({ title: title.trim(), date: date.getTime() });
      toast.success("Movie night created");
      setTitle("");
      setDate(undefined);
      onClose();
    } catch {
      toast.error("Failed to create movie night");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Movie Night</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Friday Night Films"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Date</label>
            <div className="flex justify-center border border-border rounded-md py-2">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={{ before: new Date() }}
                classNames={{
                  months: "flex flex-col sm:flex-row",
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
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={saving || !title || !date}
            >
              {saving ? "Creating..." : "Create night"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", variant: "secondary" as const },
  active: { label: "Tonight", variant: "default" as const },
  done: { label: "Done", variant: "outline" as const },
};

export default function CalendarPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const nights = useQuery(api.nights.getNights);

  // Build a set of dates that have movie nights
  const nightDates = nights?.reduce(
    (acc, night) => {
      const d = new Date(night.date);
      const key = d.toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(night);
      return acc;
    },
    {} as Record<string, typeof nights>,
  );

  const modifiers = {
    hasNight: (date: Date) => !!nightDates?.[date.toDateString()],
  };

  const upcomingNights = nights?.filter((n) => n.status !== "done");
  const pastNights = nights?.filter((n) => n.status === "done");

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Schedule and manage movie nights
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Night
          </Button>
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          {/* Calendar */}
          <Card className="self-start">
            <CardContent className="p-4">
              <DayPicker
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                modifiers={modifiers}
                modifiersClassNames={{
                  hasNight: "border-2 border-primary font-bold",
                }}
                classNames={{
                  months: "flex flex-col",
                  month: "space-y-3",
                  caption:
                    "flex justify-center pt-1 relative items-center pb-2",
                  caption_label: "text-sm font-semibold",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-md flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-1",
                  cell: "text-center text-sm p-0 relative",
                  day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                  day_today:
                    "bg-accent text-accent-foreground font-semibold",
                  day_outside: "text-muted-foreground opacity-40",
                }}
              />
            </CardContent>
          </Card>

          {/* Nights list */}
          <div className="space-y-6">
            {/* Upcoming */}
            <div>
              <h2 className="font-semibold mb-3">Upcoming Nights</h2>
              <div className="space-y-2">
                {nights === undefined ? (
                  [...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))
                ) : upcomingNights && upcomingNights.length > 0 ? (
                  upcomingNights
                    .sort((a, b) => a.date - b.date)
                    .map((night) => {
                      const config = STATUS_CONFIG[night.status];
                      return (
                        <Link key={night._id} href={`/night/${night._id}`}>
                          <Card className="hover:bg-accent/30 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-md bg-muted">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {night.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {new Date(night.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                        },
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={config.variant}>
                                    {config.label}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="flex gap-3 mt-2 text-xs text-muted-foreground pl-11">
                                <span>
                                  {night.attendees.length} attending
                                </span>
                                <span>·</span>
                                <span>
                                  {night.candidates.length} candidates
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Film className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No upcoming nights</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => setCreateOpen(true)}
                    >
                      Schedule one now
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Past */}
            {pastNights && pastNights.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-muted-foreground">
                  Past Nights
                </h2>
                <div className="space-y-2">
                  {pastNights
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 5)
                    .map((night) => (
                      <Link key={night._id} href={`/night/${night._id}`}>
                        <Card className="hover:bg-accent/30 transition-colors cursor-pointer opacity-70">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {night.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(night.date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric", year: "numeric" },
                                )}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Done
                            </Badge>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateNightDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </AppShell>
  );
}
