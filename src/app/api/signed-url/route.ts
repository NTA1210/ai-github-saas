import { supabaseStorage } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseStorage.createSignedUrl(filePath, 60);

    if (error) {
      console.log(error);
      return NextResponse.json({ error: error }, { status: 400 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
