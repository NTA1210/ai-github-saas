import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const meetings = await prisma.meeting.findMany({
      where: {
        projectId: id,
      },
      include: {
        issues: true,
      },
    });

    return NextResponse.json(meetings, { status: 200 });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 },
    );
  }
}
