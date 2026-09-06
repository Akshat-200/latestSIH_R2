/**
 * Video sources for the Pragyan portal.
 *
 * Pragyan does NOT store or host any video files. Every lecture the student
 * watches is streamed straight from YouTube, from one of the channels below.
 *
 *   1. NCERT Official  — the government NCERT channel, all classes/subjects.
 *   2. Faculty channel — the institute's own (private/secondary) channel,
 *      e.g. an NPTEL-style lecture channel. Configure it with env vars.
 */

export type ChannelKey = "ncert" | "faculty";

export type ChannelMeta = {
  key: ChannelKey;
  /** Short label shown on the channel tab. */
  name: string;
  /** One-line description under the tab. */
  tagline: string;
  /** @handle without the leading @ */
  handle: string;
  /** Canonical UC… id when known (optional — resolved from the handle). */
  channelId?: string;
  url: string;
};

const FACULTY_HANDLE =
  process.env.NEXT_PUBLIC_FACULTY_YT_HANDLE?.replace(/^@/, "") || "nptelhrd";
const FACULTY_NAME =
  process.env.NEXT_PUBLIC_FACULTY_YT_NAME || "Faculty Channel";

export const CHANNELS: Record<ChannelKey, ChannelMeta> = {
  ncert: {
    key: "ncert",
    name: "NCERT Official",
    tagline: "Official NCERT / CBSE classroom lectures",
    handle: "NCERTOFFICIAL",
    channelId: process.env.NCERT_YT_CHANNEL_ID || undefined,
    url: "https://www.youtube.com/@NCERTOFFICIAL/courses",
  },
  faculty: {
    key: "faculty",
    name: FACULTY_NAME,
    tagline: "Lectures from our own faculty channel",
    handle: FACULTY_HANDLE,
    channelId: process.env.FACULTY_YT_CHANNEL_ID || undefined,
    url: `https://www.youtube.com/@${FACULTY_HANDLE}/videos`,
  },
};

export const CHANNEL_ORDER: ChannelKey[] = ["ncert", "faculty"];

export function isChannelKey(v: string): v is ChannelKey {
  return v === "ncert" || v === "faculty";
}

/** The YouTube search query used for a chapter. */
export function chapterQuery(
  classNo: number,
  subjectName: string,
  chapterTitle: string,
): string {
  return `Class ${classNo} ${subjectName} ${chapterTitle}`;
}

/** Human-facing YouTube search link, scoped to the channel. */
export function youtubeSearchUrl(channel: ChannelMeta, query: string): string {
  return `https://www.youtube.com/@${channel.handle}/search?query=${encodeURIComponent(query)}`;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function embedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function thumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

export type YoutubeVideo = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string | null;
  channelTitle: string;
};

export type ChannelResult = {
  channel: ChannelKey;
  name: string;
  tagline: string;
  channelUrl: string;
  searchUrl: string;
  query: string;
  videos: YoutubeVideo[];
  /** Set when results could not be fetched (no API key, quota, network…). */
  notice: string | null;
};
