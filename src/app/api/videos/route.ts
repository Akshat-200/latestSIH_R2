import { NextResponse } from "next/server";
import { getActiveUser } from "@/server/auth/session";
import { getChapterVideos } from "@/server/video/youtube";
import { isChannelKey } from "@/shared/video-sources";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getActiveUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(req.url);
  const channel = url.searchParams.get("channel") ?? "ncert";
  const classNo = Number(url.searchParams.get("classNo"));
  const subject = url.searchParams.get("subject") ?? "";
  const chapter = url.searchParams.get("chapter") ?? "";

  if (!isChannelKey(channel)) {
    return NextResponse.json({ error: "Unknown channel." }, { status: 400 });
  }
  if (!Number.isFinite(classNo) || !subject || !chapter) {
    return NextResponse.json(
      { error: "classNo, subject and chapter are required." },
      { status: 400 },
    );
  }

  const result = await getChapterVideos({
    channel,
    classNo,
    subjectName: subject,
    chapterTitle: chapter,
  });

  return NextResponse.json(result);
}
