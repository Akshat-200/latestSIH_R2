import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  ListChecks,
  MapPinned,
  NotebookPen,
  PenLine,
  ShieldCheck,
  StickyNote,
  Trophy,
} from "lucide-react";
import { getActiveUser } from "@/server/auth/session";
import { getChapters, subjectName, validClass, validSubject } from "@/shared/curriculum";
import {
  getChapter,
  getContentForChapter,
  getRankedNotes,
  getBestAttempt,
  getChapterLeaderboard,
} from "@/server/data/queries";
import { EmptyState } from "@/components/ui";
import { ChapterVideos } from "@/components/chapter-videos";
import { NotesSection } from "@/components/notes-section";
import { ObjectiveQuiz } from "@/components/objective-quiz";
import { SubjectivePractice } from "@/components/subjective-practice";
import { ChapterTabs } from "@/components/chapter-tabs";
import { AiTutorPanel } from "@/components/ai-tutor-panel";
import { AiQuizGenerator } from "@/components/ai-quiz-generator";
import { AiNotesSummary } from "@/components/ai-notes-summary";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ classNo: string; subject: string; chapter: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { classNo, subject, chapter } = await params;
  const { tab = "learn" } = await searchParams;
  if (!validClass(classNo) || !validSubject(subject)) notFound();
  if (!["learn", "objective", "subjective"].includes(tab)) notFound();
  const user = await getActiveUser();
  if (!user) redirect("/home");

  const cn = Number(classNo);
  const ch = await getChapter(cn, subject, chapter);
  if (!ch) notFound();

  const staticRow = getChapters(cn, subject).find((_, i) => i + 1 === ch.num);
  const { mcqs, subj } = await getContentForChapter(ch.id);
  const notesList = await getRankedNotes(ch.id, user.id);
  const best = await getBestAttempt(user.id, ch.id);
  const top = (await getChapterLeaderboard(ch.id)).slice(0, 5);
  const pyqCount = mcqs.filter((m) => m.isPyq).length;
  const pyqPct = mcqs.length ? Math.round((pyqCount / mcqs.length) * 100) : 0;

  const base = `/class/${cn}/${subject}/${ch.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-slate-500" aria-label="Breadcrumb">
        <Link href="/home" className="inline-flex items-center gap-1 hover:text-navy-700 hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/class/${cn}/${subject}`} className="hover:text-navy-700 hover:underline">
          Class {cn} · {subjectName(subject)}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-navy-800">Chapter {ch.num}</span>
      </nav>

      <header className="vsv-enter rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-navy-800 text-2xl font-extrabold text-white">
            {ch.num}
          </span>
          <div className="min-w-0 flex-1">
            {staticRow?.book && (
              <p className="text-[12px] font-bold uppercase tracking-wider text-saffron-600">
                {staticRow.book}
              </p>
            )}
            <h1 className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{ch.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Curriculum mapping">
              {ch.outcomeIds.map((o) => (
                <span key={o} className="rounded-sm border border-navy-200 bg-navy-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-navy-700">
                  {o}
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-sm border border-leaf-500/40 bg-leaf-50 px-1.5 py-0.5 font-mono text-[11px] font-bold text-leaf-700">
                <MapPinned className="h-3 w-3" /> {ch.dikshaCode} · DIKSHA
              </span>
            </div>
          </div>
          <div className="hidden shrink-0 gap-2 text-right sm:flex">
            <div className="rounded-md border border-line bg-paper px-3 py-2">
              <p className="text-[11px] font-bold uppercase text-slate-400">Notes</p>
              <p className="text-lg font-extrabold text-navy-800">{notesList.length}</p>
            </div>
            <div className="rounded-md border border-saffron-200 bg-saffron-50 px-3 py-2">
              <p className="text-[11px] font-bold uppercase text-saffron-600">PYQ MCQs</p>
              <p className="text-lg font-extrabold text-saffron-700">{mcqs.length}</p>
            </div>
          </div>
        </div>

        <ChapterTabs base={base} activeTab={tab} />
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {tab === "learn" && (
            <div className="space-y-8">
              <AiTutorPanel
                classNo={cn}
                subject={subjectName(subject)}
                num={ch.num}
                title={ch.title}
                summary={typeof staticRow?.summary === "string" ? staticRow.summary : undefined}
              />
              <ChapterVideos
                classNo={cn}
                subject={subjectName(subject)}
                chapterTitle={ch.title}
              />

              <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-navy-900">
                  <StickyNote className="h-5 w-5 text-saffron-600" /> Community Notes &amp; Handouts
                  <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[12px] font-bold text-navy-600">
                    {user.role === "faculty" ? "you can verify" : "upvote the useful ones"}
                  </span>
                </h2>
                <NotesSection
                  chapterId={ch.id}
                  initial={notesList}
                  isFaculty={user.role === "faculty"}
                />
                <div className="mt-4">
                  <AiNotesSummary
                    chapterId={ch.id}
                    chapterTitle={ch.title}
                    classNo={cn}
                    subject={subjectName(subject)}
                  />
                </div>
              </section>
            </div>
          )}

          {tab === "objective" && (
            <div className="space-y-6">
              <AiQuizGenerator
                classNo={cn}
                subject={subjectName(subject)}
                num={ch.num}
                title={ch.title}
                summary={typeof staticRow?.summary === "string" ? staticRow.summary : undefined}
              />
              {mcqs.length > 0 ? (
                <ObjectiveQuiz
                  chapterId={ch.id}
                  chapterTitle={`${subjectName(subject)} · ${ch.title}`}
                  pyqPct={pyqPct}
                  questions={mcqs.map((m) => ({
                    id: m.id,
                    qtext: m.qtext,
                    options: m.options ?? [],
                    correctIndex: m.correctIndex,
                    explanation: m.explanation,
                    isPyq: m.isPyq,
                    pyqTag: m.pyqTag,
                  }))}
                  best={best ? { score: best.score, total: best.total } : null}
                />
              ) : (
                <EmptyState
                  icon={ListChecks}
                  title="Objective test not yet uploaded"
                  text="The 20-MCQ assessment bank for this chapter is being prepared by faculty with PYQ annotations."
                />
              )}
            </div>
          )}

          {tab === "subjective" &&
            (subj.length > 0 ? (
              <SubjectivePractice
                chapterId={ch.id}
                chapterTitle={`${subjectName(subject)} · ${ch.title}`}
                questions={subj.map((q) => ({
                  id: q.id,
                  qtext: q.qtext,
                  marks: q.marks as 2 | 3 | 5,
                  rubric: q.rubric ?? [],
                  modelAnswer: q.modelAnswer,
                }))}
              />
            ) : (
              <EmptyState
                icon={FlaskConical}
                title="Subjective practice not yet uploaded"
                text="The 2M / 3M / 5M question pool with model marking schemes for this chapter is coming soon."
              />
            ))}
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-navy-900">
              <Trophy className="h-4 w-4 text-saffron-600" /> Top performers · this chapter
            </h3>
            {top.length === 0 ? (
              <p className="mt-2 text-[13px] text-slate-500">
                No attempts yet — be the first on the board.
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {top.map((r, i) => (
                  <li
                    key={r.id}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                      r.id === user.id ? "bg-saffron-50 ring-1 ring-saffron-300" : ""
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold ${
                        i === 0
                          ? "bg-saffron-500 text-navy-950"
                          : i === 1
                            ? "bg-navy-200 text-navy-800"
                            : i === 2
                              ? "bg-amber-700/80 text-white"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate font-bold text-navy-800">
                      @{r.handle}
                      {r.id === user.id && <span className="text-saffron-600"> (you)</span>}
                    </span>
                    <span className="ml-auto shrink-0 font-extrabold text-navy-700">
                      {r.chapterXp} XP
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <Link
              href={`/leaderboard?chapter=${ch.id}`}
              className="mt-3 block rounded-md bg-navy-800 py-2 text-center text-[13px] font-bold text-white hover:bg-navy-700"
            >
              Full chapter leaderboard
            </Link>
          </section>

          <section className="rounded-lg border border-navy-200 bg-navy-800 p-4 text-white shadow-sm">
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <ShieldCheck className="h-4 w-4 text-saffron-400" /> XP available here
            </h3>
            <ul className="mt-2 space-y-1.5 text-[13px] text-navy-100">
              <li>• {mcqs.length > 0 ? `+${mcqs.length * 10} XP max` : "—"} · objective test (10 per correct)</li>
              <li>• +30 XP · complete subjective set</li>
              <li>• +50 XP · note reaching 10 upvotes</li>
            </ul>
            {best && (
              <p className="mt-3 rounded-md bg-navy-900/70 p-2.5 text-[13px] font-bold text-saffron-300">
                Your best: {best.score}/{best.total} · {best.xpEarned} XP earned
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
