import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function isAppOwner(email: string | undefined): boolean {
  const ownerEmail = process.env.APP_OWNER_EMAIL;
  return !!ownerEmail && !!email && email === ownerEmail;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { ...user, isOwner: isAppOwner(user.email) };
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const callerId = await getAuthUserId(ctx);
    if (!callerId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return { ...user, isOwner: isAppOwner(user.email) };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query("users").collect();
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const patch: Partial<{ name: string; avatar: string; bio: string }> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.avatar !== undefined) patch.avatar = args.avatar;
    if (args.bio !== undefined) patch.bio = args.bio;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(userId, patch);
    }
  },
});
