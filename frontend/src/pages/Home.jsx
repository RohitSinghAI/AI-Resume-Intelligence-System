import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
  Zap,
  ShieldCheck,
  Gauge,
  Quote,
  ChevronDown,
  Building2,
} from "lucide-react";

/* ---------------------------------------------------
   Scroll-reveal hook: adds a "visible" state once an
   element enters the viewport, used to trigger the
   fade/slide-in animations defined in <style> below.
--------------------------------------------------- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ---------------------------------------------------
   Animated counter: counts up from 0 to `value` once
   it becomes visible on screen.
--------------------------------------------------- */
function Counter({ value, suffix = "", duration = 1400 }) {
  const [ref, visible] = useReveal(0.4);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = null;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };

    requestAnimationFrame(step);
  }, [visible, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Home() {
  const features = [
    {
      icon: BrainCircuit,
      title: "AI Resume Analysis",
      description:
        "Extract skills, experience, projects and profile insights from resumes with AI-powered analysis.",
    },
    {
      icon: Target,
      title: "Intelligent Job Matching",
      description:
        "Compare candidates with job requirements using exact skills, semantic matching and experience.",
    },
    {
      icon: MessageSquareText,
      title: "AI Resume Chat",
      description:
        "Ask natural-language questions about a resume and get focused answers from the candidate data.",
    },
    {
      icon: Users,
      title: "Candidate Intelligence",
      description:
        "Review candidates, compare match results and keep recruiter workflows organized in one place.",
    },
    {
      icon: ShieldCheck,
      title: "Bias-Aware Screening",
      description:
        "Score candidates on skills and experience data so first-pass screening stays consistent and auditable.",
    },
    {
      icon: Gauge,
      title: "Pipeline Analytics",
      description:
        "Track match rates, time-to-shortlist and skill-gap trends across every open role.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Resume",
      description: "Add a candidate resume and let the platform extract useful profile information.",
      icon: FileSearch,
    },
    {
      number: "02",
      title: "Create Job",
      description: "Define the role, description, required skills and experience expectations.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Match Candidates",
      description: "Run intelligent matching and review the score breakdown and AI analysis.",
      icon: Target,
    },
    {
      number: "04",
      title: "Chat & Decide",
      description: "Ask the AI focused questions about any resume, then shortlist with confidence.",
      icon: MessageSquareText,
    },
  ];

  const stats = [
    { value: 12000, suffix: "+", label: "Resumes analyzed" },
    { value: 860, suffix: "+", label: "Roles matched" },
    { value: 94, suffix: "%", label: "Match accuracy" },
    { value: 3, suffix: "x", label: "Faster shortlisting" },
  ];

  const testimonials = [
    {
      quote:
        "The semantic matching surfaced candidates our keyword filters kept missing. Our shortlist quality went up almost immediately.",
      name: "Ananya R.",
      role: "Talent Lead, FinServe Co.",
    },
    {
      quote:
        "Resume Chat cut our first-round screening calls in half — we ask the AI the clarifying question first.",
      name: "Marcus D.",
      role: "Recruiting Manager, Northbridge",
    },
    {
      quote:
        "Score breakdowns give hiring managers a reason they can actually trust, not just a black-box percentage.",
      name: "Priya K.",
      role: "Head of People Ops, Vertex Labs",
    },
  ];

  const faqs = [
    {
      q: "What file formats can I upload?",
      a: "PDF and DOCX resumes are supported today; the parser extracts skills, experience, education and project history automatically.",
    },
    {
      q: "How is the match score calculated?",
      a: "Each candidate is scored on exact skill overlap, semantic similarity to the job description, and relevant experience — shown as a breakdown, not just one number.",
    },
    {
      q: "Can I ask questions about a specific resume?",
      a: "Yes — Resume Chat lets you ask natural-language questions and get answers grounded in that candidate's actual data.",
    },
    {
      q: "Is my candidate data kept private?",
      a: "Resumes and job data stay scoped to your workspace and are only used to power your own matching and chat features.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Local animation styles — no color values, only motion */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-14px) translateX(6px); }
        }
        @keyframes floatSlower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(12px); }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .float-slower { animation: floatSlower 8s ease-in-out infinite; }
        .pulse-soft { animation: pulseSoft 2.4s ease-in-out infinite; }
        .marquee-track { animation: marquee 22s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200 transition-transform duration-300 hover:rotate-6 hover:scale-110">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-800">
                Resume AI
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Intelligence System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 sm:px-4"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition duration-300 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300 active:scale-95"
            >
              Get Started
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.10),transparent_30%)]" />

          {/* Floating decorative blobs — motion only, same palette */}
          <div className="pointer-events-none absolute -top-10 right-10 hidden h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl float-slow lg:block" />
          <div className="pointer-events-none absolute bottom-10 left-10 hidden h-56 w-56 rounded-full bg-indigo-100/40 blur-3xl float-slower lg:block" />

          <div className="relative mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-600">
                <Zap size={14} className="pulse-soft" />
                AI-Powered Recruitment Platform
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Smarter hiring with
                <span className="text-indigo-600"> intelligent resume insights.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">
                Analyze resumes, understand candidate profiles, match talent to
                jobs and ask AI questions from one centralized recruitment workspace.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition duration-300 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-300 active:scale-95"
                >
                  Create Your Workspace
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition duration-300 hover:bg-slate-50 hover:shadow-md active:scale-95"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                {["AI Resume Analysis", "Semantic Matching", "Resume Chat"].map(
                  (item, i) => (
                    <span
                      key={item}
                      className="reveal reveal-visible inline-flex items-center gap-2"
                      style={{ transitionDelay: `${i * 120}ms` }}
                    >
                      <CheckCircle2 size={16} className="text-green-500" />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60 transition-transform duration-500 hover:-translate-y-1 sm:p-5">
                <div className="rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Candidate Match
                      </p>
                      <p className="mt-1 text-lg font-bold">Data Scientist</p>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-400/40 bg-indigo-500/10">
                      <span className="text-lg font-black text-indigo-300">
                        <Counter value={86} suffix="%" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
                      <p className="text-[11px] text-slate-400">Exact Skills</p>
                      <p className="mt-2 text-xl font-bold">
                        <Counter value={90} suffix="%" />
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
                      <p className="text-[11px] text-slate-400">Semantic</p>
                      <p className="mt-2 text-xl font-bold">
                        <Counter value={88} suffix="%" />
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4 transition-colors duration-300 hover:bg-white/10">
                      <p className="text-[11px] text-slate-400">Experience</p>
                      <p className="mt-2 text-xl font-bold">
                        <Counter value={78} suffix="%" />
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">Skill Coverage</span>
                      <span className="text-xs text-indigo-300">8 / 10 matched</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-0 rounded-full bg-indigo-400 transition-all duration-[1400ms] ease-out [animation:grow-bar_1.4s_ease-out_forwards]" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-300 transition-transform duration-300 hover:scale-[1.03]">
                      ✓ Python
                    </div>
                    <div className="rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-300 transition-transform duration-300 hover:scale-[1.03]">
                      ✓ SQL
                    </div>
                    <div className="rounded-xl bg-emerald-400/10 p-3 text-xs text-emerald-300 transition-transform duration-300 hover:scale-[1.03]">
                      ✓ Machine Learning
                    </div>
                    <div className="rounded-xl bg-rose-400/10 p-3 text-xs text-rose-300 transition-transform duration-300 hover:scale-[1.03]">
                      • Docker
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl float-slow sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">AI Analysis</p>
                    <p className="text-xs text-slate-400">Ready to review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted-by marquee (new content, motion only) */}
        <section className="border-y border-slate-200 bg-white py-6">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
              Trusted by hiring teams at
            </p>
            <div className="overflow-hidden">
              <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
                {[...Array(2)].map((_, dup) => (
                  <div key={dup} className="flex items-center gap-12">
                    {[
                      "FinServe Co.",
                      "Northbridge",
                      "Vertex Labs",
                      "Cobalt Systems",
                      "Harborline",
                      "Quanta Retail",
                    ].map((name) => (
                      <span
                        key={name + dup}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400"
                      >
                        <Building2 size={16} />
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats (new section) */}
        <section className="bg-slate-50">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-3xl font-black text-indigo-600 sm:text-4xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <Sparkles size={13} />
                Built for modern recruitment
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Everything you need to understand candidates faster
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                A focused workflow for resume intelligence, matching and AI-assisted
                candidate analysis.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, i) => {
                const Icon = feature.icon;

                return (
                  <Reveal key={feature.title} delay={i * 80}>
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                        <Icon size={21} />
                      </div>

                      <h3 className="mt-5 text-base font-bold text-slate-800">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                  <Target size={13} />
                  Simple workflow
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  From resume upload to intelligent hiring insight
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">
                  Keep the recruitment workflow structured while AI handles the
                  heavy analysis and matching work.
                </p>

                <Link
                  to="/register"
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-slate-800 active:scale-95"
                >
                  Start Now
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Reveal>

              <div className="space-y-4">
                {steps.map((step, i) => {
                  const Icon = step.icon;

                  return (
                    <Reveal key={step.number} delay={i * 100}>
                      <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-x-1 hover:shadow-md">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black tracking-widest text-indigo-500">
                              {step.number}
                            </span>
                            <h3 className="font-bold text-slate-800">{step.title}</h3>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials (new section) */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <Quote size={13} />
                What recruiters say
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Trusted by teams who hire every week
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 100}>
                  <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <Quote size={22} className="text-indigo-200" />
                    <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">
                      {t.quote}
                    </p>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-sm font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ (new section) */}
        <section className="bg-slate-50">
          <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <Reveal className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Everything you need to know before you get started.
              </p>
            </Reveal>

            <div className="mt-10 space-y-3">
              {faqs.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <Reveal key={item.q} delay={i * 60}>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <button
                        onClick={() => setOpenFaq(isOpen ? -1 : i)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-bold text-slate-800 sm:text-base">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-indigo-500 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{
                          gridTemplateRows: isOpen ? "1fr" : "0fr",
                        }}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-4 text-sm leading-6 text-slate-500">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 px-6 py-12 text-white shadow-2xl shadow-indigo-200/60 sm:px-10 sm:py-14">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100">
                  <Sparkles size={13} className="pulse-soft" />
                  AI Resume Intelligence
                </div>

                <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                  Ready to build a smarter recruitment workflow?
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
                  Create your workspace and start analyzing resumes, matching candidates
                  and exploring AI-powered insights.
                </p>

                <Link
                  to="/register"
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition duration-300 hover:bg-indigo-50 active:scale-95"
                >
                  Create Free Workspace
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
          <p>© 2026 AI Resume Intelligence System</p>
          <p>Intelligent Recruitment Platform</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;