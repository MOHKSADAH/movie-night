import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function isAppOwner(email: string | undefined): boolean {
  const ownerEmail = process.env.APP_OWNER_EMAIL;
  return !!ownerEmail && !!email && email === ownerEmail;
}

export const getRestaurants = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const caller = await ctx.db.get(userId);
    const callerIsOwner = isAppOwner(caller?.email);

    const restaurants = await ctx.db.query("restaurants").collect();
    const enriched = await Promise.all(
      restaurants.map(async (r) => {
        const addedByUser = await ctx.db.get(r.addedBy);
        return {
          ...r,
          addedByName: addedByUser?.name ?? "Unknown",
          hasUpvoted: r.upvotes.includes(userId),
          isOwner: callerIsOwner || r.addedBy === userId,
        };
      }),
    );
    return enriched.sort((a, b) => b.upvotes.length - a.upvotes.length);
  },
});

export const addRestaurant = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
    priceRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("restaurants", {
      ...args,
      addedBy: userId,
      addedAt: Date.now(),
      upvotes: [],
    });
  },
});

export const deleteRestaurant = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(restaurantId);
  },
});

export const toggleUpvote = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const restaurant = await ctx.db.get(restaurantId);
    if (!restaurant) throw new Error("Not found");

    const hasUpvoted = restaurant.upvotes.includes(userId);
    await ctx.db.patch(restaurantId, {
      upvotes: hasUpvoted
        ? restaurant.upvotes.filter((id) => id !== userId)
        : [...restaurant.upvotes, userId],
    });
  },
});
