import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Wifi,
  Video,
  Users,
  Brain,
  MessageCircle,
  Bot,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Wordmark } from "@/components/ui";
import { getActiveUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  {
    icon: BookOpen,
    title: "NCERT-aligned curriculum",
    desc: "Class 7 & 8 mapped to NCERT Learning Outcomes and DIKSHA QR codes.",
  },
  {
    icon: Video,
    title: "NCERT video lectures",
    desc: "Chapter-wise lectures streamed straight from the NCERT Official and faculty YouTube channels — nothing hosted, nothing to download.",
  },
  {
    icon: Users,
    title: "Peer-reviewed notes",
    desc: "Students upload, classmates upvote, faculty verify with a green tick.",
  },
  {
    icon: Trophy,
    title: "Gamified leaderboards",
    desc: "Earn XP for tests, notes, and contributions. Climb class & chapter boards.",
  },
  {
    icon: Wifi,
    title: "Data-saver mode",
    desc: "Built for 2G/3G networks — lightweight by default, rich when you want it.",
  },
  {
    icon: Brain,
    title: "AI tutor (NEW)",
    desc: "Floating AI chatbot + per-chapter AI tutor, quiz generator and notes summarizer.",
  },
];

const STATS = [
  { value: "6", label: "Subjects" },
  { value: "26+", label: "NCERT Chapters" },
  { value: "20", label: "PYQ MCQs / chapter" },
  { value: "15", label: "Subjective Qs / chapter" },
];

const AI_FEATURES = [
  {
    icon: MessageCircle,
    title: "Floating AI Chatbot",
    desc: "Ask any NCERT question from anywhere in the portal. The orange button in the bottom-right opens the assistant.",
  },
  {
    icon: Bot,
    title: "Per-chapter AI Tutor",
    desc: "Each chapter page has a dedicated tutor that explains concepts in 12–14 year-old friendly language.",
  },
  {
    icon: Sparkles,
    title: "AI Quiz Generator",
    desc: "On the Objective Test tab, generate fresh MCQs on any sub-topic of the chapter.",
  },
  {
    icon: Brain,
    title: "AI Study Notes",
    desc: "Get summary, key-points, or simple-explain notes for any sub-topic of a chapter in seconds.",
  },
];

const DEMO_FACULTY = [
  {
    name: "Ms. Anita Sharma",
    desc: "Science · SCH-GJ-204 · Gujarat",
    email: "anita.sharma@pragyan.gov.in",
    password: "demo123",
  },
  {
    name: "Ravi Verma",
    desc: "Mathematics · SCH-MH-112 · Maharashtra",
    email: "ravi.verma@pragyan.gov.in",
    password: "demo123",
  },
];

const DEMO_STUDENTS = [
  {
    name: "Diya Mehta",
    desc: "Class 8 · KV Ahmedabad · Rank #1",
    email: "diya@student.in",
    password: "demo123",
  },
  {
    name: "Aarav Patel",
    desc: "Class 8 · Shiksha Kendra, Rajkot",
    email: "aarav@student.in",
    password: "demo123",
  },
  {
    name: "Arjun Thakur",
    desc: "Class 7 · Shiksha Kendra, Patna",
    email: "arjun@student.in",
    password: "demo123",
  },
];

export default async function LandingPage() {
  // If the user is already signed in, take them straight to the dashboard.
  const user = await getActiveUser();

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-saffron-500/30 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -left-12 top-10 h-64 w-64 rounded-full bg-saffron-500 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-navy-400 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-2">
              <Wordmark light />
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-saffron-300/40 bg-saffron-500/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-saffron-200">
              <Sparkles className="h-3.5 w-3.5" />
              Smart India Hackathon 2026 · Team PRAGYAN
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Open digital learning for{" "}
              <span className="bg-gradient-to-r from-saffron-300 to-saffron-500 bg-clip-text text-transparent">
                every Indian classroom.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-navy-100/90">
              Pragyan (प्रज्ञान) brings NCERT-aligned video lectures,
              peer-reviewed community notes, PYQ assessments, gamified
              leaderboards, and a built-in AI tutor to Class 7 & 8 students in
              rural and government schools — even on a 2G connection.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {user ? (
                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 rounded-lg bg-saffron-500 px-5 py-3 text-[15px] font-extrabold text-navy-950 shadow-lg transition hover:bg-saffron-400"
                >
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-saffron-500 px-5 py-3 text-[15px] font-extrabold text-navy-950 shadow-lg transition hover:bg-saffron-400"
                  >
                    Sign in to start
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-[15px] font-extrabold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    Create a new account
                  </Link>
                </>
              )}
              <a
                href="/api/auth/guest?role=student"
                className="inline-flex items-center gap-1.5 rounded-lg border border-saffron-300/40 bg-transparent px-3.5 py-3 text-[13px] font-bold text-saffron-200 transition hover:bg-saffron-500/15"
              >
                <Sparkles className="h-3.5 w-3.5" />
                1-click Guest Student
              </a>
              <a
                href="/api/auth/guest?role=faculty"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-transparent px-3.5 py-3 text-[13px] font-bold text-white transition hover:bg-white/15"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                1-click Guest Faculty
              </a>
            </div>

            <ul className="mt-7 grid gap-2 text-[13px] text-navy-100/85 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-saffron-300" /> Zero
                install — runs in any modern browser
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-saffron-300" />{" "}
                Works on low-bandwidth 2G/3G networks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-saffron-300" /> WCAG 2.1
                AA accessible
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-saffron-300" /> NCERT +
                DIKSHA + NDEAR aligned
              </li>
            </ul>
          </div>

          {/* Hero illustration card */}
          <div className="relative">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-saffron-300">
                  Live demo
                </p>
                <p className="text-[11px] text-navy-100/80">
                  Click a demo card to sign in instantly
                </p>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <DemoTile
                  title="Ms. Anita Sharma"
                  sub="Faculty · Science"
                  tone="navy"
                  href="/login?role=faculty&email=anita.sharma@pragyan.gov.in"
                />
                <DemoTile
                  title="Ravi Verma"
                  sub="Faculty · Mathematics"
                  tone="navy"
                  href="/login?role=faculty&email=ravi.verma@pragyan.gov.in"
                />
                <DemoTile
                  title="Diya Mehta"
                  sub="Student · Class 8 · Rank #1"
                  tone="saffron"
                  href="/login?role=student&email=diya@student.in"
                />
                <DemoTile
                  title="Aarav Patel"
                  sub="Student · Class 8"
                  tone="saffron"
                  href="/login?role=student&email=aarav@student.in"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-center"
                  >
                    <p className="text-xl font-black text-saffron-300">
                      {s.value}
                    </p>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-navy-100/80">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-saffron-300/30 bg-saffron-500/10 px-3 py-2 text-[12px] text-saffron-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  <span className="font-extrabold">Try the AI tutor:</span>{" "}
                  click the orange{" "}
                  <span className="font-extrabold">Ask Pragyan AI</span> button
                  in the bottom-right corner of any page.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeader
          eyebrow="What's inside"
          title="Everything a Class 7–8 student actually needs"
          subtitle="Built around the NCERT syllabus, with tools for both learners and teachers."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-xl border border-line bg-white p-5 shadow-sm transition hover:border-navy-300 hover:shadow-md"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-navy-50 text-navy-800">
                <h.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-[15px] font-extrabold text-navy-900">
                {h.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features section */}
      <section className="border-y-2 border-saffron-500/30 bg-gradient-to-br from-saffron-50 via-white to-navy-50/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <SectionHeader
            eyebrow="New · AI-powered learning"
            title="A built-in AI tutor, quiz generator, and notes assistant"
            subtitle="Powered by Google Gemini (server-side, with the key kept safely on the server). Works in the bottom-right chat bubble on every page, and as a dedicated tutor inside each chapter."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {AI_FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-line bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-saffron-500/20 text-saffron-700">
                    <f.icon className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="text-[15px] font-extrabold text-navy-900">
                    {f.title}
                  </h3>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo accounts */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <SectionHeader
          eyebrow="Try it in 1 click"
          title="Pre-seeded demo accounts"
          subtitle="No signup needed for evaluators and visitors. Click any persona on the login page to pre-fill credentials, or use a 1-click button below."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <PersonaGroup
            title="Faculty / Teachers"
            icon={GraduationCap}
            tone="navy"
            accounts={DEMO_FACULTY}
          />
          <PersonaGroup
            title="Students"
            icon={Users}
            tone="saffron"
            accounts={DEMO_STUDENTS}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-3 text-[15px] font-extrabold text-white shadow-sm transition hover:bg-navy-700"
          >
            Go to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-navy-300 bg-white px-5 py-3 text-[15px] font-extrabold text-navy-800 transition hover:border-navy-500"
          >
            Register a new account
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-[12.5px] text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <Star className="h-4 w-4 text-saffron-500" />
            <span>Built for Smart India Hackathon 2026 — Team PRAGYAN</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-bold text-navy-800">
            <span>NCERT</span>
            <span aria-hidden>·</span>
            <span>DIKSHA</span>
            <span aria-hidden>·</span>
            <span>NDEAR</span>
            <span aria-hidden>·</span>
            <span>WCAG 2.1 AA</span>
            <span aria-hidden>·</span>
            <span>NIC Design</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[11.5px] font-extrabold uppercase tracking-[0.18em] text-saffron-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-navy-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
        {subtitle}
      </p>
    </div>
  );
}

function DemoTile({
  title,
  sub,
  tone,
  href,
}: {
  title: string;
  sub: string;
  tone: "navy" | "saffron";
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
        tone === "navy"
          ? "border-navy-300/30 bg-navy-700/40 hover:border-saffron-300 hover:bg-navy-700/60"
          : "border-saffron-300/40 bg-saffron-500/15 hover:border-saffron-200 hover:bg-saffron-500/25"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-extrabold uppercase ${
          tone === "navy"
            ? "bg-saffron-500 text-navy-950"
            : "bg-navy-800 text-saffron-300"
        }`}
      >
        {title
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-extrabold text-white">
          {title}
        </span>
        <span
          className={`block truncate text-[11.5px] ${
            tone === "navy" ? "text-navy-100/85" : "text-saffron-100/90"
          }`}
        >
          {sub}
        </span>
      </span>
      <ArrowRight
        className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${
          tone === "navy" ? "text-saffron-300" : "text-saffron-200"
        }`}
      />
    </Link>
  );
}

function PersonaGroup({
  title,
  icon: Icon,
  tone,
  accounts,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "navy" | "saffron";
  accounts: { name: string; desc: string; email: string; password: string }[];
}) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        tone === "navy"
          ? "border-navy-200 bg-navy-50/70"
          : "border-saffron-200 bg-saffron-50/70"
      }`}
    >
      <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-navy-900">
        <Icon className={`h-4 w-4 ${tone === "navy" ? "text-navy-700" : "text-saffron-600"}`} />
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {accounts.map((a) => (
          <Link
            key={a.email}
            href={`/login?role=${tone === "navy" ? "faculty" : "student"}&email=${encodeURIComponent(a.email)}`}
            className="block rounded-lg border border-line bg-white p-3 transition hover:border-navy-400 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-extrabold text-navy-900">
                {a.name}
              </span>
              <span className="rounded-sm bg-navy-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-navy-700">
                {tone === "navy" ? "faculty" : "student"}
              </span>
            </div>
            <p className="text-[12px] text-slate-500">{a.desc}</p>
            <p className="mt-1 font-mono text-[11.5px] text-slate-500">
              {a.email} · <span className="font-bold">{a.password}</span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
