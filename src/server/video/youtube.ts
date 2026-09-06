/**
 * YouTube sourcing for chapter lectures.
 *
 * Pragyan stores no video files. For a chapter we run a scoped search against
 * a channel (NCERT Official, or the faculty channel) using the YouTube Data
 * API v3 and stream the results through an embedded player.
 *
 * The API key is read from `process.env.YOUTUBE_API_KEY` on the server only
 * and is never sent to the browser. Without a key the portal degrades
 * gracefully: the student gets a deep link into the channel's own search.
 */
import {
  CHANNELS,
  chapterQuery,
  youtubeSearchUrl,
  type ChannelKey,
  type ChannelResult,
  type YoutubeVideo,
} from "@/shared/video-sources";

const API = "https://www.googleapis.com/youtube/v3";
const MAX_RESULTS = 6;
const TTL_MS = 6 * 60 * 60 * 1000; // 6 h — search quota is precious

const KEY = () => process.env.YOUTUBE_API_KEY?.trim() ?? "";

export const youtubeConfigured = () => KEY().length > 0;

/* --------------------------- tiny in-memory cache -------------------------- */

type Entry<T> = { at: number; value: T };
const cache = new Map<string, Entry<unknown>>();

function cacheGet<T>(k: string): T | null {
  const hit = cache.get(k) as Entry<T> | undefined;
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(k);
    return null;
  }
  return hit.value;
}

function cacheSet<T>(k: string, value: T) {
  cache.set(k, { at: Date.now(), value });
}

/* ------------------------------- api helpers ------------------------------ */

async function ytFetch(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ ...params, key: KEY() });
  const res = await fetch(`${API}/${path}?${qs}`, {
    // Route handler already caches; keep fetch itself uncached.
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `YouTube API ${res.status}: ${body.slice(0, 200) || res.statusText}`,
    );
  }
  return res.json();
}

/** Resolve an @handle to its UC… channel id (cached for the process lifetime). */
async function resolveChannelId(key: ChannelKey): Promise<string> {
  const meta = CHANNELS[key];
  if (meta.channelId) return meta.channelId;

  const ck = `cid:${meta.handle}`;
  const cached = cacheGet<string>(ck);
  if (cached) return cached;

  const data = await ytFetch("channels", {
    part: "id",
    forHandle: `@${meta.handle}`,
  });
  const id = data?.items?.[0]?.id as string | undefined;
  if (!id) throw new Error(`Could not resolve YouTube channel @${meta.handle}`);
  cacheSet(ck, id);
  return id;
}

async function searchChannel(
  key: ChannelKey,
  query: string,
): Promise<YoutubeVideo[]> {
  const channelId = await resolveChannelId(key);
  const data = await ytFetch("search", {
    part: "snippet",
    type: "video",
    order: "relevance",
    maxResults: String(MAX_RESULTS),
    channelId,
    q: query,
  });

  type Item = {
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      channelTitle?: string;
    };
  };

  return ((data?.items ?? []) as Item[])
    .filter((it) => it.id?.videoId)
    .map((it) => ({
      videoId: it.id!.videoId!,
      title: decodeEntities(it.snippet?.title ?? "Untitled lecture"),
      description: decodeEntities(it.snippet?.description ?? ""),
      publishedAt: it.snippet?.publishedAt ?? null,
      channelTitle: it.snippet?.channelTitle ?? CHANNELS[key].name,
    }));
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/* --------------------------------- public --------------------------------- */

export async function getChapterVideos(opts: {
  channel: ChannelKey;
  classNo: number;
  subjectName: string;
  chapterTitle: string;
}): Promise<ChannelResult> {
  const { channel, classNo, subjectName, chapterTitle } = opts;
  const meta = CHANNELS[channel];
  const query = chapterQuery(classNo, subjectName, chapterTitle);
  const base: ChannelResult = {
    channel,
    name: meta.name,
    tagline: meta.tagline,
    channelUrl: meta.url,
    searchUrl: youtubeSearchUrl(meta, query),
    query,
    videos: [],
    notice: null,
  };

  if (!youtubeConfigured()) {
    return {
      ...base,
      notice:
        "YouTube lookup is not configured on this server (set YOUTUBE_API_KEY). Open the channel to watch this chapter on YouTube.",
    };
  }

  const ck = `search:${channel}:${query}`;
  const cached = cacheGet<YoutubeVideo[]>(ck);
  if (cached) return { ...base, videos: cached };

  try {
    const videos = await searchChannel(channel, query);
    cacheSet(ck, videos);
    return {
      ...base,
      videos,
      notice: videos.length
        ? null
        : "No matching lecture found on this channel for this chapter yet.",
    };
  } catch (e) {
    return {
      ...base,
      notice: `Could not reach YouTube right now (${
        e instanceof Error ? e.message : "unknown error"
      }). Use the channel link to watch on YouTube.`,
    };
  }
}
