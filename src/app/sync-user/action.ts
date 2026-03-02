"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function syncUserToDb() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emailAddress = user.emailAddresses[0]?.emailAddress;

  if (!emailAddress) {
    throw new Error("No email address found");
  }

  await prisma.user.upsert({
    where: { emailAddress },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      clerkId: userId,
    },
    create: {
      clerkId: userId,
      emailAddress,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return { success: true };
}
