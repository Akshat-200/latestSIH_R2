import { db } from "@/server/db";
import {
  chapters,
  notes,
  noteVotes,
  mcqQuestions,
  mcqAttempts,
  subjectiveQuestions,
  subjectiveAttempts,
  users,
  xpEvents,
} from "@/server/db/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getChapters } from "@/shared/curriculum";

/* ------------------------------- catalog ---------------------------- */

export type ChapterSummary = {
  id: number;
  num: number;
  title: string;
  slug: string;
  summary: string | null;
  outcomeIds: string[];
  dikshaCode: string | null;
  noteCount: number;
  mcqCount: number;
  pyqPct: number;
  subjCount: number;
  bestScore: number | null;
  bestTotal: number | null;
};

export async function getChapterList(
  classNo: number,
  subjectSlug: string,
  userId: number | null,
): Promise<ChapterSummary[]> {
  const base = await db
    .select({
      id: chapters.id,
      num: chapters.num,
      title: chapters.title,
      slug: chapters.slug,
      summary: chapters.summary,
      outcomeIds: chapters.outcomeIds,
      dikshaCode: chapters.dikshaCode,
    })
    .from(chapters)
    .where(and(eq(chapters.classNo, classNo), eq(chapters.subjectSlug, subjectSlug)))
    .orderBy(asc(chapters.num));

  if (!base.length) return [];

  const ids = base.map((c) => c.id);

  const counts = await Promise.all([
    db
      .select({ chapterId: notes.chapterId, n: sql<number>`count(*)` })
      .from(notes)
      .where(inArray(notes.chapterId, ids))
      .groupBy(notes.chapterId),
    db
      .select({
        chapterId: mcqQuestions.chapterId,
        n: sql<number>`count(*)`,
        pyq: sql<number>`sum(case when ${mcqQuestions.isPyq} then 1 else 0 end)`,
      })
      .from(mcqQuestions)
      .where(inArray(mcqQuestions.chapterId, ids))
      .groupBy(mcqQuestions.chapterId),
    db
      .select({ chapterId: subjectiveQuestions.chapterId, n: sql<number>`count(*)` })
      .from(subjectiveQuestions)
      .where(inArray(subjectiveQuestions.chapterId, ids))
      .groupBy(subjectiveQuestions.chapterId),
    userId
      ? db
          .select({
            chapterId: mcqAttempts.chapterId,
            best: sql<number>`max(${mcqAttempts.score})`,
            total: sql<number>`max(${mcqAttempts.total})`,
          })
          .from(mcqAttempts)
          .where(and(inArray(mcqAttempts.chapterId, ids), eq(mcqAttempts.userId, userId)))
          .groupBy(mcqAttempts.chapterId)
      : Promise.resolve([]),
  ]);

  const [noteMap, mcqMap, subjMap, bestMap] = [
    Object.fromEntries(counts[0].map((r: { chapterId: number; n: number }) => [r.chapterId, r.n])),
    Object.fromEntries(counts[1].map((r: { chapterId: number; n: number; pyq: number }) => [r.chapterId, r])),
    Object.fromEntries(counts[2].map((r: { chapterId: number; n: number }) => [r.chapterId, r.n])),
    Object.fromEntries(
      (counts[3] as { chapterId: number; best: number | null; total: number | null }[]).map(
        (r) => [r.chapterId, r],
      ),
    ),
  ];

  return base.map((c) => {
    const mcq = mcqMap[c.id];
    return {
      id: c.id,
      num: c.num,
      title: c.title,
      slug: c.slug,
      summary: c.summary,
      outcomeIds: c.outcomeIds ?? [],
      dikshaCode: c.dikshaCode,
      noteCount: noteMap[c.id] ?? 0,
      mcqCount: mcq?.n ?? 0,
      pyqPct: mcq && mcq.n > 0 ? Math.round(((Number(mcq.pyq) || 0) / mcq.n) * 100) : 0,
      subjCount: subjMap[c.id] ?? 0,
      bestScore: bestMap[c.id]?.best ?? null,
      bestTotal: bestMap[c.id]?.total ?? null,
    };
  });
}

export const getSubjectCatalog = getChapterList;

/* ------------------------------- notes ------------------------------ */

export type RankedNote = {
  id: number;
  title: string;
  content: string | null;
  fileName: string | null;
  fileUrl: string | null;
  fileType: "text" | "pdf" | "image";
  authorName: string;
  authorIsFaculty: boolean;
  facultyVerified: boolean;
  verifiedByName: string | null;
  upvotes: number;
  iVoted: boolean;
  rankScore: number;
  createdAt: string;
};

export async function getRankedNotes(
  chapterId: number,
  userId: number | null,
): Promise<RankedNote[]> {
  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      fileName: notes.fileName,
      fileUrl: notes.fileUrl,
      fileType: notes.fileType,
      authorName: notes.authorName,
      authorId: notes.authorId,
      facultyVerified: notes.facultyVerified,
      verifiedByName: notes.verifiedByName,
      createdAt: notes.createdAt,
      upvotes: sql<number>`coalesce(count(${noteVotes.id}), 0)`,
      iVoted: sql<number>`coalesce(max(case when ${noteVotes.userId} = ${userId ?? -1} then 1 else 0 end), 0)`,
      rankScore: sql<number>`(coalesce(count(${noteVotes.id}), 0) * 0.7 + case when ${notes.facultyVerified} then 30 else 0 end)`,
    })
    .from(notes)
    .leftJoin(noteVotes, eq(noteVotes.noteId, notes.id))
    .where(eq(notes.chapterId, chapterId))
    .groupBy(notes.id)
    .orderBy(
      desc(
        sql`(coalesce(count(${noteVotes.id}), 0) * 0.7 + case when ${notes.facultyVerified} then 30 else 0 end)`,
      ),
      asc(notes.id),
    );

  const facultyIds = await db.select({ id: users.id }).from(users).where(eq(users.role, "faculty"));
  const fset = new Set(facultyIds.map((f) => f.id));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    fileName: r.fileName,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    authorName: r.authorName,
    authorIsFaculty: r.authorId !== null && fset.has(r.authorId),
    facultyVerified: r.facultyVerified,
    verifiedByName: r.verifiedByName,
    upvotes: Number(r.upvotes),
    iVoted: Number(r.iVoted) === 1,
    rankScore: Number(r.rankScore),
    createdAt: r.createdAt.toISOString(),
  }));
}

/* ---------------------------- leaderboards --------------------------- */

export type ChapterLeaderRow = {
  id: number;
  handle: string;
  name: string;
  state: string | null;
  school: string | null;
  className: number | null;
  chapterXp: number;
  bestScore: number | null;
  bestTotal: number | null;
  attempts: number;
};

export async function getChapterLeaderboard(chapterId: number): Promise<ChapterLeaderRow[]> {
  const rows = await db
    .select({
      id: users.id,
      handle: users.handle,
      name: users.name,
      state: users.state,
      school: users.school,
      className: users.className,
      chapterXp: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`,
      bestScore: sql<number>`max(${mcqAttempts.score})`,
      bestTotal: sql<number>`max(${mcqAttempts.total})`,
      attempts: sql<number>`count(distinct ${mcqAttempts.id})`,
    })
    .from(users)
    .innerJoin(
      xpEvents,
      and(
        eq(xpEvents.userId, users.id),
        eq(xpEvents.refType, "chapter"),
        eq(xpEvents.refId, chapterId),
      ),
    )
    .leftJoin(
      mcqAttempts,
      and(
        eq(mcqAttempts.userId, users.id),
        eq(mcqAttempts.chapterId, chapterId),
      ),
    )
    .where(eq(users.role, "student"))
    .groupBy(users.id)
    .orderBy(desc(sql`sum(${xpEvents.amount})`), asc(users.id))
    .limit(10);

  return rows.map((r) => ({
    id: r.id,
    handle: r.handle,
    name: r.name,
    state: r.state,
    school: r.school,
    className: r.className,
    chapterXp: Number(r.chapterXp),
    bestScore: r.bestScore !== null ? Number(r.bestScore) : null,
    bestTotal: r.bestTotal !== null ? Number(r.bestTotal) : null,
    attempts: Number(r.attempts),
  }));
}

export type ClassLeaderRow = {
  id: number;
  handle: string;
  name: string;
  state: string | null;
  school: string | null;
  className: number | null;
  xp: number;
  accuracy: number;
  objectiveAttempts: number;
  attempts: number;
  rank: number;
  badges: string[];
};

export async function getClassLeaderboard(className: number): Promise<ClassLeaderRow[]> {
  const rows = await db
    .select({
      id: users.id,
      handle: users.handle,
      name: users.name,
      state: users.state,
      school: users.school,
      className: users.className,
      xp: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`,
      correct: sql<number>`coalesce(sum(${mcqAttempts.score}), 0)`,
      total: sql<number>`coalesce(sum(${mcqAttempts.total}), 0)`,
      attempts: sql<number>`count(distinct ${mcqAttempts.id})`,
    })
    .from(users)
    .leftJoin(xpEvents, eq(xpEvents.userId, users.id))
    .leftJoin(mcqAttempts, eq(mcqAttempts.userId, users.id))
    .where(and(eq(users.role, "student"), eq(users.className, className)))
    .groupBy(users.id)
    .orderBy(desc(sql`sum(${xpEvents.amount})`), asc(users.id))
    .limit(50);

  return rows.map((r, i) => {
    const tot = Number(r.total);
    const xp = Number(r.xp);
    const attempts = Number(r.attempts);
    const badges: string[] = [];
    if (attempts >= 1) badges.push("first_steps");
    if (xp >= 500) badges.push("science_scholar");
    if (xp >= 200) badges.push("quiz_whiz");

    return {
      id: r.id,
      handle: r.handle,
      name: r.name,
      state: r.state,
      school: r.school,
      className: r.className,
      xp,
      accuracy: tot > 0 ? Math.round((Number(r.correct) / tot) * 100) : 0,
      objectiveAttempts: attempts,
      attempts,
      rank: i + 1,
      badges,
    };
  });
}

export async function getGlobalLeaderboard(className?: number | null) {
  return getClassLeaderboard(className ?? 8);
}

export async function getStateLeaderboard(): Promise<
  { state: string; studentCount: number; totalXp: number; avgAccuracy: number }[]
> {
  const rows = await db
    .select({
      state: users.state,
      studentCount: sql<number>`count(distinct ${users.id})`,
      totalXp: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`,
      correct: sql<number>`coalesce(sum(${mcqAttempts.score}), 0)`,
      total: sql<number>`coalesce(sum(${mcqAttempts.total}), 0)`,
    })
    .from(users)
    .leftJoin(xpEvents, eq(xpEvents.userId, users.id))
    .leftJoin(mcqAttempts, eq(mcqAttempts.userId, users.id))
    .where(and(eq(users.role, "student"), sql`${users.state} is not null`))
    .groupBy(users.state)
    .orderBy(desc(sql`sum(${xpEvents.amount})`));

  return rows
    .filter((r) => r.state)
    .map((r) => {
      const tot = Number(r.total);
      return {
        state: r.state as string,
        studentCount: Number(r.studentCount),
        totalXp: Number(r.totalXp),
        avgAccuracy: tot > 0 ? Math.round((Number(r.correct) / tot) * 100) : 0,
      };
    });
}

/* ------------------------------- chapter ---------------------------- */

export async function getChapter(
  classNo: number,
  subjectSlug: string,
  chapterSlug: string,
) {
  const [row] = await db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.classNo, classNo),
        eq(chapters.subjectSlug, subjectSlug),
        eq(chapters.slug, chapterSlug),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getContentForChapter(chapterId: number) {
  const [mList, sList] = await Promise.all([
    db.select().from(mcqQuestions).where(eq(mcqQuestions.chapterId, chapterId)),
    db.select().from(subjectiveQuestions).where(eq(subjectiveQuestions.chapterId, chapterId)),
  ]);
  return { mcqs: mList, subj: sList };
}

export async function getBestAttempt(a: number | null, b: number | null) {
  if (!a || !b) return null;
  const [row] = await db
    .select()
    .from(mcqAttempts)
    .where(
      sql`(${mcqAttempts.userId} = ${a} and ${mcqAttempts.chapterId} = ${b}) or (${mcqAttempts.userId} = ${b} and ${mcqAttempts.chapterId} = ${a})`,
    )
    .orderBy(desc(mcqAttempts.score))
    .limit(1);
  return row ?? null;
}

export type RecentActivity = {
  id: number;
  amount: number;
  note: string;
  type: string;
  createdAt: Date;
};

export async function getUserStats(userId: number, classNo?: number | null) {
  const [xpRow, mcqRows, noteRows, recentRows, classBoard] = await Promise.all([
    db
      .select({
        totalXp: sql<number>`coalesce(sum(${xpEvents.amount}), 0)`,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId)),
    db
      .select({
        score: mcqAttempts.score,
        total: mcqAttempts.total,
      })
      .from(mcqAttempts)
      .where(eq(mcqAttempts.userId, userId)),
    db
      .select({
        n: sql<number>`count(*)`,
      })
      .from(notes)
      .where(eq(notes.authorId, userId)),
    db
      .select({
        id: xpEvents.id,
        amount: xpEvents.amount,
        note: xpEvents.note,
        type: xpEvents.type,
        createdAt: xpEvents.createdAt,
      })
      .from(xpEvents)
      .where(eq(xpEvents.userId, userId))
      .orderBy(desc(xpEvents.createdAt))
      .limit(10),
    classNo ? getClassLeaderboard(classNo) : Promise.resolve([]),
  ]);

  const attempts = mcqRows.length;
  const totalCorrect = mcqRows.reduce((acc, r) => acc + r.score, 0);
  const totalQuestions = mcqRows.reduce((acc, r) => acc + r.total, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;
  const rankIndex = classBoard.findIndex((r) => r.id === userId);

  return {
    xp: Number(xpRow[0]?.totalXp ?? 0),
    totalXp: Number(xpRow[0]?.totalXp ?? 0),
    accuracy,
    accuracyPct: accuracy ?? 0,
    objectiveAttempts: attempts,
    attemptsCount: attempts,
    notes: Number(noteRows[0]?.n ?? 0),
    notesContributed: Number(noteRows[0]?.n ?? 0),
    rank: rankIndex !== -1 ? rankIndex + 1 : null,
    recent: recentRows.map((r) => ({
      id: r.id,
      amount: r.amount,
      note: r.note,
      type: r.type,
      createdAt: r.createdAt,
    })),
  };
}

export async function getBadgesForUser(userId: number): Promise<string[]> {
  const [stats, attempts, userNotes] = await Promise.all([
    getUserStats(userId),
    db.select({ score: mcqAttempts.score }).from(mcqAttempts).where(eq(mcqAttempts.userId, userId)),
    db.select({ rewarded: notes.rewarded }).from(notes).where(eq(notes.authorId, userId)),
  ]);

  const earned: string[] = [];
  if (stats.objectiveAttempts >= 1) earned.push("first_steps");
  if (attempts.some((a) => a.score >= 18)) earned.push("quiz_whiz");
  if (stats.objectiveAttempts >= 3) earned.push("multi_chapter");
  if (userNotes.some((n) => n.rewarded)) earned.push("top_contributor");
  return earned;
}

export async function getUserAttempts(userId: number) {
  return db
    .select({
      id: mcqAttempts.id,
      score: mcqAttempts.score,
      total: mcqAttempts.total,
      durationSec: mcqAttempts.durationSec,
      xpEarned: mcqAttempts.xpEarned,
      createdAt: mcqAttempts.createdAt,
      chapterTitle: chapters.title,
      chapterSlug: chapters.slug,
      subjectSlug: chapters.subjectSlug,
      classNo: chapters.classNo,
    })
    .from(mcqAttempts)
    .innerJoin(chapters, eq(mcqAttempts.chapterId, chapters.id))
    .where(eq(mcqAttempts.userId, userId))
    .orderBy(desc(mcqAttempts.createdAt))
    .limit(20);
}
