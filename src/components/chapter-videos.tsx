"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  MonitorPlay,
  Play,
  Tv,
} from "lucide-react";
import {
  CHANNELS,
  CHANNEL_ORDER,
  embedUrl,
  thumbUrl,
  watchUrl,
  type ChannelKey,
  type ChannelResult,
  type YoutubeVideo,
} from "@/shared/video-sources";

type Props = {
  classNo: number;
  subject: string;
  chapterTitle: string;
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";

export function ChapterVideos({ classNo, subject, chapterTitle }: Props) {
  const [channel, setChannel] = useState<ChannelKey>("ncert");
  const [data, setData] = useState<Partial<Record<ChannelKey, ChannelResult>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<YoutubeVideo | null>(null);
  const [saver, setSaver] = useState(false);

  useEffect(() => {
    const apply = () => setSaver(document.documentElement.dataset.saver === "1");
    apply();
    window.addEventListener("vs-saver", apply);
    return () => window.removeEventListener("vs-saver", apply);
  }, []);

  const load = useCallback(
    async (key: ChannelKey) => {
      setBusy(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          channel: key,
          classNo: String(classNo),
          subject,
          chapter: chapterTitle,
        });
        const res = await fetch(`/api/videos?${qs}`, { cache: "no-store" });
        const json = (await res.json()) as ChannelResult & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Could not load lectures.");
        setData((d) => ({ ...d, [key]: json }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load lectures.");
      } finally {
        setBusy(false);
      }
    },
    [classNo, subject, chapterTitle],
  );

  // Reset when the chapter changes.
  useEffect(() => {
    setData({});
    setActive(null);
  }, [classNo, subject, chapterTitle]);

  useEffect(() => {
    if (!data[channel]) void load(channel);
  }, [channel, data, load]);

  const current = data[channel];
  const meta = CHANNELS[channel];

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-navy-900">
        <MonitorPlay className="h-5 w-5 text-saffron-600" /> Video Lectures
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
          <Tv className="h-3 w-3" /> Streamed from YouTube
        </span>
      </h2>
      <p className="mb-3 text-[13px] text-slate-500">
        Pragyan hosts no video files — every lecture below is played directly from the
        source channel on YouTube.
      </p>

      {/* channel tabs */}
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Video channel">
        {CHANNEL_ORDER.map((key) => {
          const c = CHANNELS[key];
          const on = key === channel;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setChannel(key);
                setActive(null);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-bold transition ${
                on
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-line bg-white text-navy-700 hover:border-navy-300"
              }`}
            >
              {c.name}
            </button>
          );
        })}
        <a
          href={current?.channelUrl ?? meta.url}
          target="_blank"
          rel="noreferrer noopener"
          className="ml-auto inline-flex items-center gap-1 self-center text-[12px] font-bold text-navy-700 hover:underline"
        >
          Open channel <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <p className="mb-3 text-[12px] font-semibold text-slate-500">{meta.tagline}</p>

      {busy && !current && (
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-6 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding lectures for “{chapterTitle}”…
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {current && (
        <>
          {active && (
            <div className="mb-4 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
              <div className="aspect-video w-full bg-black">
                <iframe
                  key={active.videoId}
                  src={embedUrl(active.videoId)}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="h-full w-full"
                />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                <h3 className="text-[15px] font-bold text-navy-900">{active.title}</h3>
                <a
                  href={watchUrl(active.videoId)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-auto inline-flex items-center gap-1 text-[12px] font-bold text-navy-700 hover:underline"
                >
                  Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          )}

          {current.notice && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">
              {current.notice}{" "}
              <a
                href={current.searchUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 underline"
              >
                Search “{current.query}” on {current.name}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {current.videos.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {current.videos.map((v) => {
                const on = active?.videoId === v.videoId;
                return (
                  <li key={v.videoId}>
                    <button
                      type="button"
                      onClick={() => setActive(v)}
                      className={`group flex w-full gap-3 rounded-lg border bg-white p-2.5 text-left transition ${
                        on ? "border-saffron-500 ring-1 ring-saffron-300" : "border-line hover:border-navy-300"
                      }`}
                    >
                      <span className="relative block h-[62px] w-[110px] shrink-0 overflow-hidden rounded-md bg-navy-900">
                        {!saver && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbUrl(v.videoId)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-black/60 p-1.5 text-white transition group-hover:bg-saffron-500 group-hover:text-navy-950">
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </span>
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[13px] font-bold text-navy-900">
                          {v.title}
                        </span>
                        <span className="mt-1 block text-[11px] font-semibold text-slate-500">
                          {v.channelTitle}
                          {v.publishedAt ? ` · ${fmtDate(v.publishedAt)}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
