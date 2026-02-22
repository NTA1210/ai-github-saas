import { env } from "@/configs/env";

/**
 * Lấy base URL tuyệt đối của app — dùng được trên cả server và client
 *
 * Priority:
 * 1. NEXT_PUBLIC_BASE_URL từ .env (explicit, luôn đúng)
 * 2. VERCEL_URL từ Vercel env (tự động, không có https://)
 * 3. Fallback localhost:3000 (development)
 */
export function getBaseUrl(): string {
  // Client-side: dùng window.location
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: ưu tiên env var
  if (env.NEXT_PUBLIC_BASE_URL) {
    return env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercel tự set VERCEL_URL (không có protocol)
  // if (env.VERCEL_URL) {
  //   return `https://${process.env.VERCEL_URL}`;
  // }

  // Fallback development
  return "http://localhost:3000";
}
