import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const inviteLink = await prisma.inviteLink.findFirst({
      where: {
        projectId: id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (inviteLink) {
      return NextResponse.json(inviteLink, { status: 200 });
    }

    const newInviteLink = await prisma.inviteLink.create({
      data: {
        projectId: id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return NextResponse.json(newInviteLink, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create invite link" },
      { status: 500 },
    );
  }
}
