import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// ✅ Public Pages — ai cũng truy cập được (không cần đăng nhập)
const isPublicPage = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sync-user", // ← QUAN TRỌNG: Clerk redirect đến đây sau sign-up
  "/", // landing page
  // Thêm page public khác ở đây...
]);

// ✅ Public API Routes — ai cũng gọi được (không cần đăng nhập)
const isPublicApi = createRouteMatcher([
  "/api/inngest(.*)", // Inngest Dev Server & Cloud cần gọi route này để sync functions
]);

export default clerkMiddleware(async (auth, req) => {
  // Nếu là public page hoặc public API → bỏ qua, không cần đăng nhập
  if (isPublicPage(req) || isPublicApi(req)) return;

  // Tất cả các route còn lại → bắt buộc đăng nhập
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
