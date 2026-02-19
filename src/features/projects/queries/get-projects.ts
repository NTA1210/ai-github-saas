import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Project } from "../../../../generated/prisma/client";

/**
 * Server-side function — gọi trực tiếp Prisma (không qua HTTP).
 * Dùng trong Server Components để prefetch data cho TanStack Query hydration.
 */
export async function getProjects(): Promise<Project[]> {
  const { userId } = await auth();

  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return [];

  return prisma.project.findMany({
    where: {
      users: {
        some: { userId: user.id },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
