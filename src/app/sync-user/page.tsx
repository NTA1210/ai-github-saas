import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const SyncUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emailAddress = user.emailAddresses[0].emailAddress;

  if (!emailAddress) {
    throw new Error("Email not found");
  }

  await prisma.user.upsert({
    where: {
      emailAddress,
    },
    update: {
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    create: {
      emailAddress,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  return redirect("/dashboard");
};

export default SyncUser;
