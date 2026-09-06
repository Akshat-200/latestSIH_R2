"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  StickyNote,
  ListChecks,
  PenLine,
  MapPinned,
  BookMarked,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { getSubjectLocalizedName } from "@/shared/i18n";
import { IconBox, ProgressBar, SUBJECT_ICONS } from "@/components/ui";

type ChapterItem = {
  id: number;
  num: number;
  title: string;
  slug: string;
  summary: string | null;
  noteCount: number;
  mcqCount: number;
  pyqPct: number;
  subjCount: number;
  bestScore: number | null;
  bestTotal: number | null;
  dikshaCode: string | null;
};

type Group = {
  book: string | null;
  items: {
    row: { title: string; book?: string; summary?: string };
    data: ChapterItem | undefined;
  }[];
};

export function SubjectIndexView({
  classNo,
  subjectSlug,
  meta,
  groups,
  dbList,
  practiced,
}: {
  classNo: number;
  subjectSlug: string;
  meta: {
    slug: string;
    name: string;
    short: string;
    icon: keyof typeof SUBJECT_ICONS;
    tint: string;
  };
  groups: Group[];
  dbList: ChapterItem[];
  practiced: number;
}) {
  const { t, language } = useLanguage();
  const Icon = SUBJECT_ICONS[meta.icon];
  const localizedSubject = getSubjectLocalizedName(subjectSlug, language);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav
        className="mb-4 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500 dark:text-slate-400"
        aria-label="Breadcrumb"
      >
        <Link
          href="/home"
          className="inline-flex items-center gap-1 hover:text-navy-700 hover:underline dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("nav_dashboard")}
        </Link>
        <span aria-hidden="true">/</span>
        <span>Class {classNo}</span>
        <span aria-hidden="true">/</span>
        <span className="text-navy-800 dark:text-slate-200">{localizedSubject}</span>
      </nav>

      <header className="vsv-enter flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <IconBox icon={Icon} tint={meta.tint} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
            Class {classNo} · {t("ncert_subjects")}
          </p>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
            {localizedSubject}
          </h1>
        </div>
        <div className="w-full sm:w-64">
          <div className="mb-1 flex justify-between text-[13px] font-bold text-navy-600 dark:text-slate-300">
            <span>
              {language === "hi" ? "आपकी प्रगति" : language === "te" ? "మీ పురోగతి" : language === "ta" ? "உங்கள் முன்னேற்றம்" : "Your progress"}
            </span>
            <span>
              {practiced}/{dbList.length}
            </span>
          </div>
          <ProgressBar value={practiced} max={dbList.length} />
        </div>
      </header>

      {groups.map((g) => (
        <section key={g.book ?? "main"} className="mt-8">
          {g.book && (
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-800 dark:text-white">
              <BookMarked className="h-5 w-5 text-saffron-600 dark:text-saffron-400" /> {g.book}
            </h2>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map(({ row, data }) => {
              const href = data ? `/class/${classNo}/${subjectSlug}/${data.slug}` : `#`;
              const hasContent = data
                ? data.noteCount > 0 || data.mcqCount > 0 || data.subjCount > 0
                : false;
              return (
                <Link
                  key={row.title}
                  href={href}
                  className={`group vsv-enter rounded-lg border bg-white p-4 shadow-sm transition dark:bg-slate-900 ${
                    data
                      ? "border-line hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
                      : "cursor-default border-dashed border-line opacity-70 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-800 text-[15px] font-extrabold text-white dark:bg-slate-800 dark:text-saffron-400">
                      {data?.num ?? "—"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold leading-snug text-navy-900 group-hover:underline dark:text-white">
                        {row.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {data && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-red-50 px-1.5 py-0.5 text-[11px] font-bold text-red-600 dark:bg-slate-800 dark:text-red-300">
                            <Clapperboard className="h-3 w-3" />{" "}
                            {language === "hi" ? "यूट्यूब वीडियो" : language === "te" ? "యూట్యూబ్ వీడియోలు" : language === "ta" ? "யூடியூப் வீடியோக்கள்" : "YouTube lectures"}
                          </span>
                        )}
                        {data && data.noteCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-navy-50 px-1.5 py-0.5 text-[11px] font-bold text-navy-600 dark:bg-slate-800 dark:text-slate-300">
                            <StickyNote className="h-3 w-3" /> {data.noteCount}{" "}
                            {language === "hi" ? "नोट्स" : language === "te" ? "నోట్స్" : language === "ta" ? "குறிப்புகள்" : "notes"}
                          </span>
                        )}
                        {data && data.mcqCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-saffron-50 px-1.5 py-0.5 text-[11px] font-bold text-saffron-700 dark:bg-saffron-950/60 dark:text-saffron-300">
                            <ListChecks className="h-3 w-3" /> {data.mcqCount} MCQs · {data.pyqPct}% PYQ
                          </span>
                        )}
                        {data && data.subjCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-sm bg-saffron-50 px-1.5 py-0.5 text-[11px] font-bold text-saffron-700 dark:bg-saffron-950/60 dark:text-saffron-300">
                            <PenLine className="h-3 w-3" /> {data.subjCount}{" "}
                            {language === "hi" ? "वर्णनात्मक" : language === "te" ? "సబ్జెక్టివ్" : language === "ta" ? "விளக்கமுறை" : "descriptive"}
                          </span>
                        )}
                        {!hasContent && (
                          <span className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {language === "hi" ? "शीघ्र उपलब्ध" : language === "te" ? "త్వరలో అందుబాటులోకి వస్తుంది" : language === "ta" ? "விரைவில் வரும்" : "Content coming soon"}
                          </span>
                        )}
                      </div>
                      {data && data.bestScore !== null && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 text-[12px] font-bold text-leaf-700 dark:bg-leaf-950/50 dark:text-leaf-300">
                          {t("best_score")} {data.bestScore}/{data.bestTotal}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5 border-t border-dashed border-line pt-2 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                        <MapPinned className="h-3 w-3" />
                        {data?.dikshaCode ?? "DIKSHA mapping pending"}
                      </div>
                    </div>
                    {data && (
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy-300 transition group-hover:translate-x-0.5 group-hover:text-navy-700 dark:text-slate-600 dark:group-hover:text-slate-300" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
