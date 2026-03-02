import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const JoinHandlerPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token: string }>;
}) => {
  const { id } = await params;
  const { token } = await searchParams;

  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (!user) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    redirect("/dashboard");
  }

  const inviteLink = await prisma.inviteLink.findUnique({
    where: {
      id: token,
      projectId: id,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!inviteLink) {
    redirect("/dashboard");
  }

  const existingMembership = await prisma.userToProject.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: id,
      },
    },
  });

  if (existingMembership) {
    return redirect(`/dashboard?error-code=already-joined&project-id=${id}`);
  }

  await prisma.userToProject.create({
    data: {
      userId: user.id,
      projectId: id,
    },
  });

  return redirect(`/dashboard`);
};

export default JoinHandlerPage;
