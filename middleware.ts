import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/login", "/register"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default convexAuthNextjsMiddleware((request, { convexAuth }) => {
  if (isApiRoute(request)) return; // skip auth check for API routes
  if (!isPublicPage(request) && !convexAuth.isAuthenticated()) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
