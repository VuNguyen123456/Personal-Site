import { AnimatePresence, motion, LayoutGroup, type Transition } from "motion/react";
import {
  ArrowUpRight,
  Award,
  BadgeCheck,
  BookOpen,
  ChevronsDownUp,
  ChevronsUpDown,
  ExternalLink,
  FileText,
  Globe,
  Link as LinkIcon,
  Mail,
  Medal,
  Moon,
  Sun,
  Swords,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, createContext, useContext, useRef, Fragment, type ReactNode } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/utils";
import {
  fetchSpacerPokemonDetails,
  type SpacerPokemonDetails,
  type SpacerPokemonStatLine,
} from "./pokeApi";
import { pickRandomPokemonDbSlug, pokemonDbGen5AnimatedSpriteUrl, pokemonDbPokedexUrl } from "./pokemonDbSlugs";
import { techStackSections, type TechStackItem } from "./techStackData";
import { useDarkMode, useTheme } from "./useDarkMode";

const techInterests: { label: string; whyInterest: string }[] = [
  {
    label: "Machine learning",
    whyInterest:
      "I like building systems that learn from data—Quizly's hybrid grading, Pokémon strategy agents, and AI coursework let me mix experimentation with real user impact.",
  },
  {
    label: "Cloud computing",
    whyInterest:
      "Shipping on AWS taught me how architecture choices affect uptime and cost—from PCI-aware ECS checkout to serverless PatriotRead endpoints that had to stay fast and reliable.",
  },
  {
    label: "Scalable distributed systems",
    whyInterest:
      "MapReduce workers, pthread web servers, and Go concurrency projects pulled me toward designing for load, failure, and clean coordination between many moving parts.",
  },
];

const patriotReadLogo = "https://dummyimage.com/300x140/1f2937/ffffff&text=PatriotRead";
const courseCupidLogo = "https://dummyimage.com/300x140/1f2937/ffffff&text=CourseCupid";
const pokemonImage =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80";
function HeroIconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.013 10.013 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function HeroIconLinkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const borderLine = "border-gray-300 dark:border-gray-700";

function relaxSiteHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

type ConnectElsewhereEntry = {
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  logo?: ReactNode;
  logoSrc?: string;
};

const connectAsset = (fileName: string) => `/assets/tech/${fileName}?v=4`;

/** Fixed icon column — overflow hidden so wide PNGs cannot widen the row. */
const connectLogoSlotClass =
  "flex h-9 w-full items-center justify-start overflow-hidden sm:h-10 lg:h-11";
const connectLogoImgClass = "h-full w-full object-contain object-left";

function ConnectBrandLogo({ src, className = connectLogoImgClass }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) {
    return <Mail className="h-7 w-7 text-gray-600 dark:text-gray-400" strokeWidth={1.75} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function ConnectLinkMark({ entry }: { entry: ConnectElsewhereEntry }) {
  return (
    <span className={connectLogoSlotClass} aria-hidden>
      {entry.logo != null ? (
        entry.logo
      ) : entry.logoSrc ? (
        <ConnectBrandLogo src={entry.logoSrc} />
      ) : (
        <Mail className="h-7 w-7 text-gray-600 dark:text-gray-400" strokeWidth={1.75} />
      )}
    </span>
  );
}

const connectElsewhereEntries: ConnectElsewhereEntry[] = [
  {
    title: "GitHub",
    subtitle: "VuNguyen123456",
    href: "https://github.com/VuNguyen123456",
    external: true,
    logoSrc: connectAsset("github.png"),
  },
  {
    title: "LinkedIn",
    subtitle: "vu-nguyen-in",
    href: "https://www.linkedin.com/in/vu-nguyen-in/",
    external: true,
    logoSrc: connectAsset("LinkedIn.png"),
  },
  {
    title: "Devpost",
    subtitle: "VuNguyen123456",
    href: "https://devpost.com/VuNguyen123456",
    external: true,
    logo: (
      <span
        className="select-none font-mono text-[1.65rem] font-bold leading-none tracking-tight text-blue-600 dark:text-blue-400 sm:text-[1.85rem]"
        aria-hidden
      >
        &lt;&gt;
      </span>
    ),
  },
  {
    title: "Mail",
    subtitle: "vnguy7@gmu.edu",
    href: "mailto:vnguy7@gmu.edu",
    logoSrc: connectAsset("outlook.png"),
  },
  {
    title: "Mail",
    subtitle: "vunguyen250605@gmail.com",
    href: "mailto:vunguyen250605@gmail.com",
    logoSrc: connectAsset("email.png"),
  },
  {
    title: "YouTube",
    subtitle: "dQw4w9WgXcQ",
    href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    external: true,
    logoSrc: connectAsset("youtube.png"),
  },
];

function ConnectElsewhereCell({ entry }: { entry: ConnectElsewhereEntry }) {
  const external = entry.external ?? false;

  return (
    <a
      href={entry.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative box-border grid h-full min-h-[4.5rem] items-center gap-x-3 px-3.5 py-3 transition-colors hover:bg-white/80 dark:hover:bg-white/10 sm:min-h-[5rem] sm:gap-x-3.5 sm:px-4 sm:py-3.5",
        "grid-cols-[var(--connect-icon-w)_minmax(0,1fr)] [--connect-icon-w:2.75rem] sm:[--connect-icon-w:3rem]",
      )}
    >
      <ArrowUpRight
        className="absolute right-3 top-3 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300 sm:right-3.5 sm:top-3.5"
        aria-hidden
      />
      <ConnectLinkMark entry={entry} />
      <div className="min-w-0 pr-6">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-base">
          {entry.title}
        </h3>
        <p className="mt-0.5 truncate font-mono text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">{entry.subtitle}</p>
      </div>
    </a>
  );
}

function RelaxSiteCell({ site, className = "" }: { site: { name: string; url: string }; className?: string }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block px-3.5 py-1.5 transition-colors hover:bg-white/80 dark:hover:bg-white/10 sm:px-4 sm:py-2 ${className}`}
    >
      <ArrowUpRight
        className="absolute right-3 top-3 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300 sm:right-3.5 sm:top-3.5"
        aria-hidden
      />
      <div className="min-w-0 pr-6">
        <h3 className="text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-base">
          {site.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">({relaxSiteHost(site.url)})</p>
      </div>
    </a>
  );
}

type MiddleRuleLayout = { marginLeft: number; width: number };

const MiddleRuleLayoutContext = createContext<MiddleRuleLayout | null>(null);

/** Page shell: left 1.5/5 · content 2/5 · right 1.5/5 (between equal thirds and 1-2-1). */
const pageGridClass =
  "eevee-panel-grid grid w-full grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_minmax(0,1.5fr)] items-stretch";

/** Inner width cap for bordered middle column content. */
const middleColumnInnerClass = "mx-auto w-full min-w-0 max-w-2xl";

/** Equal top & bottom padding on the middle column for every section. */
const sectionColumnPad = "px-2 pt-1 pb-1 sm:px-3 sm:pt-1.5 sm:pb-1.5 lg:px-4";

/** Bottom inset after the final rule before SectionBottomBorder2 (matches Featured Work footer cell). */
const sectionEndPadBelowRule = "pb-1 sm:pb-1.5";

/** Subsection body band (Featured Work rows, Scholarships rows). */
const portfolioMiddlePad = "px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-3";
const portfolioTitleBlockPad = "px-2 pt-1 pb-0.5 sm:px-3 sm:pt-1.5 sm:pb-1 lg:px-4";

/** Padding around rules between subsections (slightly more than content rows). */
const subsectionRulePadY = "py-1 sm:py-1.5";

/** Featured Work title rule — balanced gap before PatriotRead (not as tight as pb-0, not full subsectionRulePadY). */
const featuredWorkTitleRulePadY = "pt-1 pb-0.5 sm:pt-1.5 sm:pb-1";

/** First Featured Work row — slightly less top inset than following rows. */
const featuredFirstRowMiddlePad = "px-1.5 pt-px pb-0.5 sm:px-2 sm:pt-1 sm:pb-1 lg:px-3";
const featuredFirstRowBodyPad = "pt-1 pb-1.5 sm:pt-1.5 sm:pb-2";
const featuredFirstRowReadoutPad = "pt-1 pb-1.5 sm:pt-1.5 sm:pb-2";

/** Minimal side padding so the Eeveelution row can use more horizontal space. */
/** Less top / more bottom than symmetric py so sprites sit visually centered in the band. */
const eeveelutionColumnPad = "px-1 pt-0 pb-2.5 sm:px-1.5 sm:pt-px sm:pb-3 lg:px-2";

/** Equal top & bottom padding around each main section title cluster (Portfolio, Toolkit, Break Time, hero name). */
const sectionTitlePad = "py-0";

/** Middle column padding for tech stack grid rows (tighter than generic section pad). */
const techStackMiddlePadX = "px-2 sm:px-3 lg:px-4";
const techStackMiddlePad = `${techStackMiddlePadX} py-0.5 sm:py-1`;

/** Subsection body row: no top pad so the title sits close to the rule above. */
const techStackSubsectionPad = `${techStackMiddlePadX} pb-0.5 pt-0 sm:pb-1 sm:pt-0`;

/** Rule-only row between tech subsections. */
const techStackRuleRowPad = `${techStackMiddlePadX} py-0`;

/** Rule under the main Tech Stack heading — minimal gap before the first subsection title. */
const techStackTitleRulePadY = "pt-0.5 pb-0 sm:pt-1 sm:pb-0";

/** Rule band between tech subsections — match gap below line to Programming (title cell bottom pad). */
const techSubsectionRulePadY = "pt-1 pb-0.5 sm:pt-1.5 sm:pb-1";

/** Padding around the badge / content row under each tech subtitle. */
const techBadgesPad = "pt-0.5 pb-1 sm:pt-1 sm:pb-1";

/** Tight padding on tech subsection title row (flanked rules + label). */
const techSubsectionTitlePad = "pt-0 pb-0.5 sm:pb-0.5";

/** Equal top & bottom padding around full-bleed horizontal rules (under section titles, hero). */
const rulePadY = "py-0.5 sm:py-1";

/** Space above main content right after the first horizontal rule under a section title. */
const afterTitleRulePad = "pt-0";

/** Tighter padding around full-bleed rules in the Relax grid / actions stack. */
const relaxRulePadY = "py-0.5 sm:py-1";

/** No padding — grid meets the horizontal rules above/below (column lines align). */
const connectRulePadY = "py-0";

/** Same as connectRulePadY — Relax website grid flush with its top/bottom rules. */
const relaxGridRulePadY = connectRulePadY;

/** Same inset above/below Shuffle and View all. */
const relaxActionRowPad = "py-1.5 sm:py-2";

const relaxActionButtonClass =
  "box-border h-4 min-h-4 max-h-4 w-full justify-center gap-1 rounded-none border-0 px-3 py-0 text-xs font-medium leading-none text-gray-600 transition-colors hover:bg-transparent hover:text-blue-600 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-blue-400 [&_svg]:h-2.5 [&_svg]:w-2.5 [&_svg]:shrink-0";

/** Tighter padding around award rows and their dividers. */
/** Hint that a title reveals left-panel copy on hover (dotted underline). */
const hoverableTitleClass =
  "underline decoration-dotted decoration-gray-400 underline-offset-[0.25em] transition-[color,text-decoration-color] hover:text-blue-600 hover:decoration-blue-600 dark:decoration-gray-500 dark:hover:text-blue-400 dark:hover:decoration-blue-400";

type WorkExperienceEntry = {
  id: string;
  role: string;
  company: string;
  location: string;
  dates: string;
  summary: string;
  highlights: string[];
};

const workExperienceEntries: WorkExperienceEntry[] = [
  {
    id: "cci-research-assistant",
    role: "Research Assistant",
    company: "Commonwealth Cyber Initiative",
    location: "Fairfax, Virginia",
    dates: "Feb 2024 – Present",
    summary:
      "Virginia-based cybersecurity research initiative focused on critical infrastructure resilience and applied security research.",
    highlights: [
      "Led cybersecurity threat simulation exercises for Fairfax County’s water and wastewater treatment infrastructure.",
      "Developed incident-response scenarios covering 2 water treatment plants and 6 wastewater facilities.",
      "Conducted GIS-based geospatial analysis on Serengeti-Mara migration datasets to model threat visualization patterns.",
      "Authored a 10-page research paper analyzing power-water interdependencies tied to Virginia’s 477 data centers and 3.4 GW regional energy demand.",
      "Contributed research on regulatory failures, infrastructure resilience, and critical infrastructure security planning.",
    ],
  },
  {
    id: "22nd-century-intern",
    role: "Technology Intern",
    company: "22nd Century Technologies",
    location: "McLean, Virginia",
    dates: "Jun 2025 – Aug 2025",
    summary:
      "US-based technology consulting company delivering enterprise cloud and software solutions.",
    highlights: [
      "Led development of “The Fitting Room” prototype using Agile workflows and Jira sprint management.",
      "Built a full-stack retail matching platform that streamlined clothing discovery across multiple retailers.",
      "Architected scalable AWS infrastructure using ECS, Docker, CloudFront, Application Load Balancer, and Blue-Green deployments.",
      "Achieved 100% uptime and sub-200ms response times while maintaining zero-downtime deployment processes.",
      "Collaborated with cross-functional teams to integrate real-time data systems, reducing latency by 25%.",
    ],
  },
  {
    id: "gigmarket-intern",
    role: "Software Development Intern",
    company: "Gigmarket",
    location: "Vienna, Virginia",
    dates: "May 2024 – Aug 2024",
    summary: "Marketplace platform connecting workers and employers through gig-based workflows.",
    highlights: [
      "Built a responsive worker rating platform that improved task completion efficiency by 20%.",
      "Integrated Angular, Node.js, Express.js, and PostgreSQL into scalable frontend and backend workflows.",
      "Increased application stability by 9% through improved architecture and source-control practices.",
      "Automated worker-rating reminder emails for 1,000+ users, reducing manual administrative overhead.",
      "Developed user-focused features that increased engagement and platform activity metrics.",
    ],
  },
  {
    id: "monstarlab-intern",
    role: "Mobile App Development Intern",
    company: "Monstarlab",
    location: "Hanoi, Vietnam",
    dates: "Jun 2023 – Aug 2023",
    summary:
      "Global digital product consultancy specializing in mobile and enterprise application development.",
    highlights: [
      "Developed mobile application features using Flutter and Dart within Agile sprint cycles.",
      "Collaborated with engineers and designers to deliver responsive UI components across multiple devices.",
      "Debugged performance and interface issues using Android Studio and mobile emulators.",
      "Maintained sprint documentation and engineering coordination workflows using Jira and Notion.",
    ],
  },
];

/** Work Experience typography (reference: sans title, mono meta/summary, badge-check bullets). */
const workExpTitleClass =
  "text-base font-bold leading-snug tracking-tight text-gray-900 dark:text-white sm:text-[1.0625rem]";
const workExpMetaClass = "mt-1 font-mono text-xs font-normal leading-snug text-gray-500 dark:text-gray-400 sm:text-[0.8125rem]";
const workExpCompanyClass = "font-medium text-blue-600 dark:text-blue-400";
const workExpSummaryClass =
  "font-mono text-xs font-bold leading-relaxed text-gray-900 dark:text-white sm:text-sm";
const workExpBulletTextClass = "text-xs font-normal leading-relaxed text-gray-500 dark:text-gray-400 sm:text-[0.8125rem]";

type CredentialIconKind = "scholarship" | "cs" | "hackathon";

type CredentialEntry = {
  icon: CredentialIconKind;
  title: string;
  eyebrow?: string;
  /** Factual summary — typed in the right column on row hover. */
  paragraphs: string[];
  /** Motivation — typed in the left column on row hover. */
  hoverCaption: string;
  meta: string;
  links?: { href: string; label: string }[];
  /** Ignore click-to-dismiss briefly after the hover caption finishes (short captions). */
  clickDismissMercyMs?: number;
};

function CredentialDecorIcon({ kind }: { kind: CredentialIconKind }) {
  const cls = "h-6 w-6 shrink-0 sm:h-7 sm:w-7";
  if (kind === "scholarship") return <Award className={cls} strokeWidth={1.5} aria-hidden />;
  if (kind === "cs") return <Medal className={cls} strokeWidth={1.5} aria-hidden />;
  return (
    <span className="flex items-center gap-2">
      <Swords className={cls} strokeWidth={1.5} aria-hidden />
      <ExternalLink className="h-5 w-5 shrink-0 opacity-80 sm:h-6 sm:w-6" strokeWidth={1.5} aria-hidden />
    </span>
  );
}

const credentialEntries: CredentialEntry[] = [
  {
    icon: "scholarship",
    title: "Mason Distinction Scholarship — $72,000",
    paragraphs: ["Four-year merit scholarship for strong academics; full-time enrollment required."],
    hoverCaption: "I earned this with a 4.3 GPA in high school while taking AP courses.",
    meta: "Mason merit · Early Action · George Mason",
    links: [{ href: "https://www.gmu.edu/admissions-aid/scholarships", label: "Mason scholarships" }],
  },
  {
    icon: "hackathon",
    title: "PatriotHacks Fall 2025 — 1st place",
    paragraphs: [
      "1st place at a 60-hour online hackathon. Built PatriotRead—a browser extension to simplify, summarize, translate, and read pages aloud (AWS, Azure OpenAI).",
      "Prizes: Microsoft Reston tour and a winner interview with YC founders.",
    ],
    hoverCaption: "The power of friendship.",
    clickDismissMercyMs: 500,
    meta: "PatriotHacks · Fall 2025",
    links: [
      { href: "https://patriothacks2025.devpost.com/", label: "PatriotHacks 2025" },
      { href: "https://github.com/VuNguyen123456/pocket-translator", label: "PatriotRead (GitHub)" },
    ],
  },
  {
    icon: "cs",
    title: "Distinguished Academic Achievement Award — Computer Science",
    paragraphs: ["CS department honor for academic performance; invited to the annual awards dinner."],
    hoverCaption: "My official GPA after graduating from GMU was 3.96.",
    meta: "GMU · Computer Science",
  },
];

type HoverTypewriterOptions = {
  charInMs?: number;
  charOutMs?: number;
  /** @deprecated use charInMs */
  wordInMs?: number;
  /** @deprecated use charOutMs */
  wordOutMs?: number;
  /** Delay before typing out when pointer leaves (reduces flicker between rows). */
  releaseDelayMs?: number;
  /** After caption is fully shown, ignore click-to-dismiss for this many ms. */
  dismissMercyMs?: number;
};

/** Character-by-character type in / out. */
function useHoverWordTypewriter(options: HoverTypewriterOptions = {}) {
  const charInMs = options.charInMs ?? options.wordInMs ?? 20;
  const charOutMs = options.charOutMs ?? options.wordOutMs ?? 12;
  const { releaseDelayMs = 0, dismissMercyMs = 0 } = options;
  const [text, setText] = useState("");
  const [visibleLength, setVisibleLength] = useState(0);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engagedCaptionRef = useRef<string | null>(null);
  const completedAtRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);
  const visibleLengthRef = useRef(visibleLength);
  phaseRef.current = phase;
  visibleLengthRef.current = visibleLength;

  const engage = useCallback((caption: string) => {
    if (releaseTimerRef.current != null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    const trimmed = caption.trim();
    if (!trimmed) return;

    if (engagedCaptionRef.current === trimmed) {
      if (phaseRef.current === "out") {
        setVisibleLength(trimmed.length);
      }
      setPhase((p) => (p === "out" ? "in" : p));
      return;
    }

    engagedCaptionRef.current = trimmed;
    completedAtRef.current = null;
    setText(trimmed);
    setVisibleLength(0);
    setPhase("in");
  }, []);

  const release = useCallback(() => {
    if (releaseTimerRef.current != null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    const startOut = () => setPhase((p) => (p === "idle" ? "idle" : "out"));
    if (releaseDelayMs <= 0) {
      startOut();
      return;
    }
    releaseTimerRef.current = window.setTimeout(() => {
      releaseTimerRef.current = null;
      startOut();
    }, releaseDelayMs);
  }, [releaseDelayMs]);

  /** Right-click: finish typing instantly, or clear instantly if already full / erasing. */
  const accelerate = useCallback(() => {
    if (releaseTimerRef.current != null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    const caption = engagedCaptionRef.current ?? text;
    if (!caption) return;

    const p = phaseRef.current;
    const len = visibleLengthRef.current;
    const atFull = len >= caption.length;

    if (p === "out" || (p === "in" && atFull)) {
      if (
        dismissMercyMs > 0 &&
        p === "in" &&
        atFull &&
        completedAtRef.current != null &&
        Date.now() - completedAtRef.current < dismissMercyMs
      ) {
        return;
      }
      completedAtRef.current = null;
      setText("");
      setVisibleLength(0);
      setPhase("idle");
      engagedCaptionRef.current = null;
      return;
    }

    setText(caption);
    setVisibleLength(caption.length);
    setPhase("in");
    completedAtRef.current = Date.now();
  }, [text, dismissMercyMs]);

  useEffect(() => {
    return () => {
      if (releaseTimerRef.current != null) window.clearTimeout(releaseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "in" || !text) return;
    if (visibleLength >= text.length) {
      if (completedAtRef.current == null) completedAtRef.current = Date.now();
      return;
    }
    completedAtRef.current = null;
    const t = window.setTimeout(() => setVisibleLength((n) => Math.min(text.length, n + 1)), charInMs);
    return () => window.clearTimeout(t);
  }, [phase, visibleLength, text, charInMs]);

  useEffect(() => {
    if (phase !== "out") return;
    if (visibleLength <= 0) {
      setText("");
      setPhase("idle");
      engagedCaptionRef.current = null;
      completedAtRef.current = null;
      return;
    }
    const t = window.setTimeout(() => setVisibleLength((n) => Math.max(0, n - 1)), charOutMs);
    return () => window.clearTimeout(t);
  }, [phase, visibleLength, charOutMs]);

  const displayLine = text.slice(0, visibleLength);
  const caretVisible =
    text.length > 0 &&
    ((phase === "in" && visibleLength < text.length) || (phase === "out" && visibleLength > 0));
  const typingComplete = text.length > 0 && visibleLength >= text.length && phase === "in";
  const fullLine = text;

  return { engage, release, accelerate, displayLine, caretVisible, typingComplete, fullLine, phase };
}

const monoReadoutGridClass =
  "m-0 grid max-w-full font-mono text-[11px] font-medium leading-relaxed tracking-wide text-gray-600 dark:text-gray-400 [&>*]:col-start-1 [&>*]:row-start-1";

/** Grid-only layout for spacer Pokédex (typography from `.spacer-pokemon-readout-retro`). */
const spacerMonoReadoutGridClass =
  "m-0 grid max-w-full [&>*]:col-start-1 [&>*]:row-start-1";

const monoReadoutLayerClass = "col-start-1 row-start-1 block min-w-0 whitespace-pre-wrap break-words";

/** Soft spring for Featured Work row / readout height changes. */
const featuredRowHeightTransition: Transition = {
  type: "spring",
  stiffness: 28,
  damping: 12,
  mass: 1.35,
};

const featuredRowLayoutTransition = {
  layout: featuredRowHeightTransition,
};

/** Smoothly animates content height (reserve text, wraps, sprites). */
function AnimatedHeightShell({
  children,
  className = "",
  transition = featuredRowHeightTransition,
}: {
  children?: ReactNode;
  className?: string;
  transition?: Transition;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <motion.div
      className={`overflow-hidden ${className}`.trim()}
      initial={false}
      animate={{ height }}
      transition={transition}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  );
}

/** Invisible full text reserves height so line wraps do not shift surrounding layout while typing. */
function StableMonoReadout({
  reserveText,
  children,
  afterTyping,
  showAfter,
  className = "",
  layoutClass = monoReadoutGridClass,
  idleHint,
  reserveAfterTypingSpace = false,
  alwaysReserveHeight = false,
}: {
  reserveText: string;
  children: ReactNode;
  afterTyping?: ReactNode;
  showAfter?: boolean;
  className?: string;
  layoutClass?: string;
  idleHint?: string;
  /** Keep sprite/after block space in the ghost layer so height does not jump when typing finishes. */
  reserveAfterTypingSpace?: boolean;
  /** Keep ghost-line height when idle so the row does not grow on hover. */
  alwaysReserveHeight?: boolean;
}) {
  const reserve = reserveText.trim() || "\u00a0";
  const showAnything =
    alwaysReserveHeight || (children != null && children !== false) || showAfter;

  if (!showAnything) {
    return idleHint ? <span className="sr-only">{idleHint}</span> : null;
  }

  const textLineClass = reserveAfterTypingSpace ? "inline-block translate-y-1 align-middle" : "";
  const afterSlotClass = reserveAfterTypingSpace
    ? "ml-2 inline-block shrink-0 align-middle leading-none [&_img]:block [&_img]:h-12 [&_img]:w-12 [&_img]:object-contain sm:[&_img]:h-14 sm:[&_img]:w-14"
    : "ml-2 inline-block shrink-0 align-top leading-none [&_img]:block [&_img]:h-12 [&_img]:w-12 [&_img]:object-contain sm:[&_img]:h-14 sm:[&_img]:w-14";
  const afterPlaceholder =
    reserveAfterTypingSpace && afterTyping != null ? (
      <span className={`${afterSlotClass} h-12 w-12 sm:h-14 sm:w-14`} aria-hidden />
    ) : null;
  const visibleAfterEl =
    reserveAfterTypingSpace && afterTyping != null ? (
      <span className={`${afterSlotClass} ${showAfter ? "" : "invisible"}`} aria-hidden={!showAfter}>
        {afterTyping}
      </span>
    ) : showAfter && afterTyping != null ? (
      <span className={afterSlotClass}>{afterTyping}</span>
    ) : null;
  const reserveAfterEl = reserveAfterTypingSpace ? afterPlaceholder : visibleAfterEl;

  return (
    <p className={`${layoutClass} ${className}`.trim()}>
      <span className={`invisible ${monoReadoutLayerClass}`} aria-hidden>
        {textLineClass ? <span className={textLineClass}>{reserve}</span> : reserve}
        {reserveAfterEl}
      </span>
      <span className={monoReadoutLayerClass}>
        {textLineClass ? <span className={textLineClass}>{children}</span> : children}
        {visibleAfterEl}
      </span>
    </p>
  );
}

function ProjectRowTypewriterReadout({
  displayLine,
  fullLine,
  caretVisible,
  typingComplete,
  afterTyping,
  className = "",
  idleHint = "Hover the project title to the right for a short hint.",
  reserveAfterTypingSpace = false,
  reserveLine,
}: {
  displayLine: string;
  fullLine: string;
  caretVisible: boolean;
  typingComplete: boolean;
  afterTyping?: ReactNode;
  className?: string;
  idleHint?: string;
  reserveAfterTypingSpace?: boolean;
  /** Full caption reserved in layout while idle (e.g. award rows). */
  reserveLine?: string;
}) {
  const hasLine = displayLine.length > 0 || caretVisible;
  const showAfter = typingComplete && afterTyping != null;
  const reserveText = (reserveLine ?? fullLine).trim();
  const alwaysReserveHeight = reserveLine != null && reserveText.length > 0;

  if (!hasLine && !showAfter && !alwaysReserveHeight) {
    return idleHint ? <span className="sr-only">{idleHint}</span> : null;
  }

  return (
    <div className={`min-w-0 text-left ${className}`} aria-live="polite">
      <StableMonoReadout
        reserveText={reserveText}
        showAfter={showAfter}
        afterTyping={afterTyping}
        idleHint={idleHint}
        reserveAfterTypingSpace={reserveAfterTypingSpace}
        alwaysReserveHeight={alwaysReserveHeight}
      >
        {hasLine ? (
          <>
            {displayLine}
            <TechReadoutCaret visible={caretVisible} />
          </>
        ) : null}
      </StableMonoReadout>
    </div>
  );
}

const techReadoutClass =
  "m-0 max-w-full font-mono text-[11px] font-medium leading-relaxed tracking-wide text-gray-600 dark:text-gray-400";

function TechReadoutCaret({ visible, className }: { visible: boolean; className?: string }) {
  if (!visible) return null;
  return (
    <span
      className={cn(
        "ml-0.5 inline align-baseline animate-pulse",
        className ?? "text-blue-500",
      )}
      aria-hidden
    >
      ▍
    </span>
  );
}

/** Renders `Field: value` lines — label uses palette accent, value uses normal body text. */
function renderSpacerReadoutColoredText(text: string): ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  return lines.map((line, lineIndex) => {
    const colonMatch = line.match(/^([^:\n]+:)(.*)$/);
    const lineBreak = lineIndex < lines.length - 1 ? "\n" : null;

    if (!colonMatch) {
      return (
        <Fragment key={lineIndex}>
          <span className="spacer-readout-value">{line}</span>
          {lineBreak}
        </Fragment>
      );
    }

    const [, field, value] = colonMatch;
    return (
      <Fragment key={lineIndex}>
        <span className="spacer-readout-field">{field}</span>
        <span className="spacer-readout-value">{value}</span>
        {lineBreak}
      </Fragment>
    );
  });
}

function SpacerPokemonTypewriterReadout({
  displayLine,
  fullLine,
  caretVisible,
  typingComplete,
  afterTyping,
  idleHint = "Hover for details. Click to show instantly. Click again to close.",
}: {
  displayLine: string;
  fullLine: string;
  caretVisible: boolean;
  typingComplete: boolean;
  afterTyping?: ReactNode;
  idleHint?: string;
}) {
  const hasLine = displayLine.length > 0 || caretVisible;
  const showAfter = typingComplete && afterTyping != null;
  const reserveText = fullLine.trim();

  if (!hasLine && !showAfter) {
    return idleHint ? <span className="sr-only">{idleHint}</span> : null;
  }

  return (
    <motion.div className="min-w-0 text-left" aria-live="polite">
      <StableMonoReadout
        reserveText={reserveText}
        showAfter={showAfter}
        afterTyping={afterTyping}
        idleHint={idleHint}
        layoutClass={spacerMonoReadoutGridClass}
        className="spacer-pokemon-readout"
      >
        {hasLine ? (
          <>
            {renderSpacerReadoutColoredText(displayLine)}
            <TechReadoutCaret visible={caretVisible} className="spacer-readout-caret" />
          </>
        ) : null}
      </StableMonoReadout>
    </motion.div>
  );
}

/** Left panel: what the technology is. */
function TechStackTypewriterReadout({
  label,
  displayLine,
  caretVisible,
  idleHint = "Hover a tool logo in the center for what it is and your experience with it.",
}: {
  label: string;
  displayLine: string;
  caretVisible: boolean;
  idleHint?: string;
}) {
  const hasBody = displayLine.length > 0 || caretVisible;
  const showAnything = label.length > 0 || hasBody;

  return (
    <div className="min-w-0 text-left" aria-live="polite">
      {showAnything ? (
        <p className={techReadoutClass}>
          {label ? (
            <>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{label}</span>
              <span aria-hidden>: </span>
            </>
          ) : null}
          {hasBody ? (
            <>
              {displayLine}
              <TechReadoutCaret visible={caretVisible} />
            </>
          ) : null}
        </p>
      ) : (
        <span className="sr-only">{idleHint}</span>
      )}
    </div>
  );
}

function TechStackNameSlot({ label }: { label: string }) {
  return (
    <div className="min-w-0 text-left" aria-live="polite">
      {label ? (
        <p className={`${techReadoutClass} mb-0`}>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{label}</span>
        </p>
      ) : (
        <span className="sr-only">Technology name appears here on hover.</span>
      )}
    </div>
  );
}

function TechStackExperienceSlot({
  experienceLine,
  experienceCaret,
}: {
  experienceLine: string;
  experienceCaret: boolean;
}) {
  const hasExperience = experienceLine.length > 0 || experienceCaret;
  return (
    <div className="min-w-0 text-left" aria-live="polite">
      {hasExperience ? (
        <>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            What I&apos;ve done
          </p>
          <p className={`${techReadoutClass} mb-0`}>
            {experienceLine}
            <TechReadoutCaret visible={experienceCaret} />
          </p>
        </>
      ) : (
        <span className="sr-only">Your experience with this tool appears here on hover.</span>
      )}
    </div>
  );
}

function TechStackWhySlot({ whyLine, whyCaret }: { whyLine: string; whyCaret: boolean }) {
  const hasWhy = whyLine.length > 0 || whyCaret;
  return (
    <div className="min-w-0 text-left" aria-live="polite">
      {hasWhy ? (
        <>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Why I love it
          </p>
          <p className={`${techReadoutClass} mb-0`}>
            {whyLine}
            <TechReadoutCaret visible={whyCaret} />
          </p>
        </>
      ) : (
        <span className="sr-only">Why you love this tool appears here on hover.</span>
      )}
    </div>
  );
}

function TechStackInterestWhySlot({ whyLine, whyCaret }: { whyLine: string; whyCaret: boolean }) {
  const hasWhy = whyLine.length > 0 || whyCaret;
  return (
    <div className="min-w-0 text-left" aria-live="polite">
      {hasWhy ? (
        <>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Why?
          </p>
          <p className={`${techReadoutClass} mb-0`}>
            {whyLine}
            <TechReadoutCaret visible={whyCaret} />
          </p>
        </>
      ) : (
        <span className="sr-only">Hover an interest to the left to see why it matters to you.</span>
      )}
    </div>
  );
}

function InterestCell({
  label,
  whyInterest,
  onHover,
  onLeave,
}: {
  label: string;
  whyInterest: string;
  onHover: (text: string) => void;
  onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(whyInterest)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(whyInterest)}
      onBlur={onLeave}
      className="block w-full cursor-pointer py-0 text-left font-mono text-sm leading-snug text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-200 first:pt-0"
    >
      <span className="text-gray-400 dark:text-gray-500">// </span>
      {label}
    </button>
  );
}

function TechStackSideCell({
  children,
  side,
  className = "",
}: {
  children?: ReactNode;
  side: "left" | "right";
  className?: string;
}) {
  if (children == null) return <div className="min-w-0" aria-hidden />;
  const pad = side === "left" ? "px-1 py-1 sm:pl-2 sm:pr-0.5" : "px-1 py-1 sm:pl-0.5 sm:pr-2";
  return (
    <div
      className={`relative flex min-h-0 min-w-0 items-start justify-start self-stretch overflow-x-hidden ${pad} ${className}`}
    >
      {children}
    </div>
  );
}

function TechStackMiddleCell({
  children,
  className = "",
  pad = "default",
  trailing,
}: {
  children?: ReactNode;
  className?: string;
  pad?: "default" | "subsection" | "rule";
  trailing?: ReactNode;
}) {
  const padClass =
    pad === "subsection" ? techStackSubsectionPad : pad === "rule" ? techStackRuleRowPad : techStackMiddlePad;
  return (
    <div className={cn(`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine}`, padClass, className)}>
      {children != null ? <div className={middleColumnInnerClass}>{children}</div> : null}
      {trailing}
    </div>
  );
}

function WorkExperienceRow({ entry }: { entry: WorkExperienceEntry }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `work-exp-panel-${entry.id}`;

  return (
    <article className="min-w-0">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
        aria-label={
          expanded
            ? `Collapse ${entry.role} at ${entry.company} details`
            : `Expand ${entry.role} at ${entry.company} details`
        }
        className="flex w-full items-start justify-between gap-3 rounded-sm py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black sm:py-2.5"
      >
        <div className="min-w-0 flex-1">
          <h3 className={workExpTitleClass}>{entry.role}</h3>
          <p className={workExpMetaClass}>
            <span className={workExpCompanyClass}>{entry.company}</span>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden>
              {" "}
              •{" "}
            </span>
            <span>{entry.location}</span>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden>
              {" "}
              •{" "}
            </span>
            <span>{entry.dates}</span>
          </p>
        </div>
        <span className="mt-0.5 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden>
          {expanded ? <ChevronsDownUp className="h-3.5 w-3.5" strokeWidth={2} /> : <ChevronsUpDown className="h-3.5 w-3.5" strokeWidth={2} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${entry.role} at ${entry.company} details`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-1 pt-2 sm:space-y-4 sm:pb-1.5 sm:pt-2.5">
              <p className={workExpSummaryClass}>{entry.summary}</p>
              <ul className="m-0 list-none space-y-3 p-0 sm:space-y-3.5">
                {entry.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2.5 sm:gap-3">
                    <BadgeCheck
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className={workExpBulletTextClass}>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

/** One award row: motivation typewriter left, title in middle, description typewriter right. */
function CredentialGridRow({ entry, index }: { entry: CredentialEntry; index: number }) {
  const motivation = useHoverWordTypewriter({
    charInMs: 16,
    charOutMs: 3,
    releaseDelayMs: 60,
    dismissMercyMs: entry.clickDismissMercyMs ?? 0,
  });
  const description = useHoverWordTypewriter({
    charInMs: 16,
    charOutMs: 3,
    releaseDelayMs: 60,
    dismissMercyMs: entry.clickDismissMercyMs ?? 0,
  });
  const caption = entry.hoverCaption.trim();
  const descriptionBody = entry.paragraphs.join(" ").trim();
  const motivationText = caption ? `How: ${caption}` : "";
  const descriptionText = descriptionBody ? `Description: ${descriptionBody}` : "";
  const hasHover = motivationText.length > 0 || descriptionText.length > 0;
  const primaryLink = entry.links?.[0];
  const titleHoverClass = `rounded-sm text-inherit cursor-pointer ${hoverableTitleClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black`;
  const engageRow = useCallback(() => {
    if (motivationText) motivation.engage(motivationText);
    if (descriptionText) description.engage(descriptionText);
  }, [motivationText, descriptionText, motivation, description]);
  const releaseRow = useCallback(() => {
    motivation.release();
    description.release();
  }, [motivation, description]);
  const accelerateFromRow = useCallback(
    (e: React.MouseEvent, skipLinks: boolean) => {
      if (skipLinks && (e.target as HTMLElement).closest("a, button")) return;
      e.preventDefault();
      motivation.accelerate();
      description.accelerate();
    },
    [motivation, description],
  );
  const readoutRowHandlers = hasHover
    ? {
        onMouseEnter: engageRow,
        onMouseLeave: releaseRow,
        onClick: (e: React.MouseEvent) => accelerateFromRow(e, false),
        onContextMenu: (e: React.MouseEvent) => accelerateFromRow(e, false),
      }
    : {};
  const middleRowHandlers = hasHover
    ? {
        onMouseEnter: engageRow,
        onMouseLeave: releaseRow,
        onClick: (e: React.MouseEvent) => accelerateFromRow(e, true),
        onContextMenu: (e: React.MouseEvent) => accelerateFromRow(e, true),
      }
    : {};
  const rowPointerClass = hasHover ? "cursor-pointer" : "cursor-default";

  const titleEl = hasHover ? (
    primaryLink ? (
      <a href={primaryLink.href} target="_blank" rel="noopener noreferrer" className={titleHoverClass}>
        {entry.title}
      </a>
    ) : (
      <span tabIndex={0} className={titleHoverClass}>
        {entry.title}
      </span>
    )
  ) : (
    <span>{entry.title}</span>
  );

  const extraLinks =
    entry.links?.filter((link) => !primaryLink || link.href !== primaryLink.href) ?? [];

  return (
    <>
      <div
        className={`relative flex min-h-0 min-w-0 flex-col self-stretch overflow-x-hidden ${portfolioMiddlePad} ${rowPointerClass}`}
        {...readoutRowHandlers}
      >
        {index > 0 ? <CredentialRowTopSpacer /> : null}
        <div className="flex min-w-0 items-start justify-start py-1 sm:py-1.5">
          <ProjectRowTypewriterReadout
            displayLine={motivation.displayLine}
            fullLine={motivation.fullLine}
            caretVisible={motivation.caretVisible}
            typingComplete={motivation.typingComplete}
            reserveLine={motivationText}
            idleHint="Hover the award title for how it relates to you."
          />
        </div>
      </div>
      <div className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${portfolioMiddlePad}`}>
        {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
        <div className={middleColumnInnerClass}>
          <div
            className={`flex flex-col gap-1 py-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2 sm:py-1.5 ${rowPointerClass}`}
            {...middleRowHandlers}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div>
                <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg">{titleEl}</h3>
                {entry.eyebrow ? <p className="mt-px text-xs text-gray-500 dark:text-gray-400">{entry.eyebrow}</p> : null}
              </div>
              <p className="text-xs leading-snug text-gray-500 dark:text-gray-400">{entry.meta}</p>
              {extraLinks.length > 0 ? (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {extraLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2} />
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 justify-end text-gray-400 dark:text-gray-500" aria-hidden>
              <CredentialDecorIcon kind={entry.icon} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={`relative flex min-h-0 min-w-0 flex-col self-stretch overflow-x-hidden ${portfolioMiddlePad} ${rowPointerClass}`}
        {...readoutRowHandlers}
      >
        {index > 0 ? <CredentialRowTopSpacer /> : null}
        <div className="flex min-w-0 items-start justify-start py-1 sm:py-1.5">
          <ProjectRowTypewriterReadout
            displayLine={description.displayLine}
            fullLine={description.fullLine}
            caretVisible={description.caretVisible}
            typingComplete={description.typingComplete}
            reserveLine={descriptionText}
            idleHint="Hover the award title for a description."
          />
        </div>
      </div>
    </>
  );
}

function formatPokemonSlugForAlt(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Random national-dex species (1–1025); link + sprite use PokémonDB slug (lowercase). */
function PokemonRandomHoverSprite() {
  const [slug, setSlug] = useState(() => pickRandomPokemonDbSlug());
  const errorRolls = useRef(0);

  const onSpriteError = () => {
    errorRolls.current += 1;
    /** Older animated BW sprites are missing for many Gen 9+ species; re-roll instead of always Pikachu. */
    if (errorRolls.current >= 12) {
      setSlug("pikachu");
      return;
    }
    setSlug(pickRandomPokemonDbSlug());
  };

  return (
    <a
      href={pokemonDbPokedexUrl(slug)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm dark:focus-visible:ring-offset-black"
    >
      <img
        src={pokemonDbGen5AnimatedSpriteUrl(slug)}
        alt={formatPokemonSlugForAlt(slug)}
        className="h-12 w-12 object-contain sm:h-14 sm:w-14"
        loading="lazy"
        decoding="async"
        onError={onSpriteError}
      />
    </a>
  );
}

type PortfolioProject = {
  title: string;
  /** Shorter label for the title row when tools share the same line. */
  titleShort?: string;
  description: string;
  hoverCaption: string;
  /** Extra top inset on the left typewriter so multi-line captions sit nearer vertical center in the row. */
  hoverReadoutPadTop?: string;
  /** Optional block in the left gutter, shown only after hoverCaption has fully typed in (before un-type). */
  hoverAfterTyping?: ReactNode;
  /** When true, show a random Pokémon (national dex 1–1025) sprite + dex link after typing completes. */
  hoverRandomPokemonFromDex?: boolean;
  /** Short caption: center in the readout column (no height animation), same layout as dex hover rows. */
  hoverReadoutCentered?: boolean;
  /** Ignore click-to-dismiss briefly after the hover caption finishes (short captions). */
  clickDismissMercyMs?: number;
  tools: string[];
  link: string;
  image: string | null;
  emoji: string[] | null;
};

/** One project row across the page grid: typewriter in the outer-left column, body inside bordered middle. */
function FeaturedProjectGridRow({ project, index }: { project: PortfolioProject; index: number }) {
  const { engage, release, accelerate, displayLine, caretVisible, typingComplete, fullLine } = useHoverWordTypewriter({
    charInMs: 16,
    charOutMs: 3,
    releaseDelayMs: 60,
    dismissMercyMs: project.clickDismissMercyMs ?? 0,
  });
  const isGitHub = /github\.com/i.test(project.link);
  const caption = project.hoverCaption.trim();
  const accelerateFromRow = useCallback(
    (e: React.MouseEvent, skipLinks: boolean) => {
      if (skipLinks && (e.target as HTMLElement).closest("a, button")) return;
      e.preventDefault();
      accelerate();
    },
    [accelerate],
  );
  const readoutRowHandlers = caption
    ? {
        onMouseEnter: () => engage(caption),
        onMouseLeave: () => release(),
        onClick: (e: React.MouseEvent) => accelerateFromRow(e, false),
        onContextMenu: (e: React.MouseEvent) => accelerateFromRow(e, false),
      }
    : {};
  const middleRowHandlers = caption
    ? {
        onMouseEnter: () => engage(caption),
        onMouseLeave: () => release(),
        onClick: (e: React.MouseEvent) => accelerateFromRow(e, true),
        onContextMenu: (e: React.MouseEvent) => accelerateFromRow(e, true),
      }
    : {};
  const rowPointerClass = caption ? "cursor-pointer" : "cursor-default";
  const linkClass = caption
    ? `rounded-sm text-inherit cursor-pointer ${hoverableTitleClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black`
    : "rounded-sm text-inherit transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-blue-400 dark:focus-visible:ring-offset-black";

  const isFirstFeaturedRow = index === 0;
  const readoutColClass = `relative flex min-h-0 min-w-0 self-stretch overflow-x-hidden px-1 sm:pl-2 sm:pr-0.5 ${
    isFirstFeaturedRow ? featuredFirstRowReadoutPad : "py-1.5 sm:py-2"
  } ${rowPointerClass}`;
  const featuredMiddleColPad = isFirstFeaturedRow ? featuredFirstRowMiddlePad : portfolioMiddlePad;
  const featuredRowBodyPad = isFirstFeaturedRow ? featuredFirstRowBodyPad : "py-1.5 sm:py-2";
  const readoutUsesDirectCenterLayout =
    project.hoverRandomPokemonFromDex === true || project.hoverReadoutCentered === true;
  const readoutInner = (
    <motion.div
      className={`flex min-h-full w-full flex-col ${
        project.hoverRandomPokemonFromDex
          ? (project.hoverReadoutPadTop ?? "justify-end pb-1.5 sm:pb-2")
          : project.hoverReadoutCentered
            ? (project.hoverReadoutPadTop ?? "justify-center pt-4 sm:pt-5")
            : ""
      }`}
    >
      {readoutUsesDirectCenterLayout ? (
        <ProjectRowTypewriterReadout
          displayLine={displayLine}
          fullLine={fullLine}
          caretVisible={caretVisible}
          typingComplete={typingComplete}
          reserveAfterTypingSpace={project.hoverRandomPokemonFromDex === true}
          afterTyping={
            project.hoverRandomPokemonFromDex ? <PokemonRandomHoverSprite /> : project.hoverAfterTyping
          }
        />
      ) : (
        <motion.div
          className={`flex min-h-0 w-full flex-1 flex-col ${
            project.hoverReadoutPadTop ?? "items-center justify-center"
          }`}
        >
          <AnimatedHeightShell className="w-full">
            <ProjectRowTypewriterReadout
              displayLine={displayLine}
              fullLine={fullLine}
              caretVisible={caretVisible}
              typingComplete={typingComplete}
              afterTyping={project.hoverAfterTyping}
            />
          </AnimatedHeightShell>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <>
      {project.hoverRandomPokemonFromDex ? (
        <div className={readoutColClass} {...readoutRowHandlers}>
          {readoutInner}
        </div>
      ) : (
        <motion.div
          layout
          transition={featuredRowLayoutTransition}
          className={readoutColClass}
          {...readoutRowHandlers}
        >
          {readoutInner}
        </motion.div>
      )}
      <motion.div className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${featuredMiddleColPad}`}>
        {index > 0 ? <ViewportAdjacentRulesShaper /> : null}
        <div className={middleColumnInnerClass}>
          <motion.div
            layout
            role="listitem"
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.06,
              layout: featuredRowHeightTransition,
            }}
            className={`${featuredRowBodyPad} ${rowPointerClass}`}
            {...middleRowHandlers}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <h3 className="flex min-w-0 max-w-[42%] shrink items-baseline gap-x-1.5 truncate text-base font-semibold leading-snug text-gray-900 dark:text-white sm:max-w-[36%] sm:text-lg">
                  {caption ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`truncate ${linkClass}`}
                      title={project.title}
                    >
                      {project.titleShort ?? project.title}
                    </a>
                  ) : (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`truncate ${linkClass}`}
                      title={project.title}
                    >
                      {project.titleShort ?? project.title}
                    </a>
                  )}
                  {project.emoji?.length ? (
                    <span className="shrink-0 select-none text-base sm:text-lg" aria-hidden>
                      {project.emoji.join(" ")}
                    </span>
                  ) : null}
                </h3>
                <div
                  className="ml-auto flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 overflow-x-auto"
                  aria-label="Technologies used"
                >
                  {project.tools.map((tool, ti) => (
                    <span
                      key={`${project.title}-${tool}-${ti}`}
                      className="featured-project-tool shrink-0 whitespace-nowrap rounded-md border border-gray-200/90 bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:border-gray-600 dark:bg-black/70 dark:text-gray-400"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm leading-snug text-gray-600 dark:text-gray-400">{project.description}</p>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:hover:bg-neutral-800"
              >
                {isGitHub ? (
                  <>
                    <HeroIconGithub className="h-3.5 w-3.5 shrink-0" />
                    <span>View repo</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span>Visit</span>
                  </>
                )}
              </a>
            </div>

          </motion.div>
        </div>
      </motion.div>
      <div className="min-w-0" aria-hidden />
    </>
  );
}

const WASHINGTON_DC_TZ = "America/New_York";

type WashingtonDcClockParts = {
  hours: string;
  minutes: string;
  offset: string;
};

function getWashingtonDcClockParts(now: Date): WashingtonDcClockParts {
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: WASHINGTON_DC_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const [hours, minutes] = time.split(":");

  const offsetParts = new Intl.DateTimeFormat("en-US", {
    timeZone: WASHINGTON_DC_TZ,
    timeZoneName: "longOffset",
  }).formatToParts(now);
  let rawOffset = offsetParts.find((p) => p.type === "timeZoneName")?.value ?? "";
  if (!/^GMT/i.test(rawOffset)) {
    rawOffset =
      new Intl.DateTimeFormat("en-US", {
        timeZone: WASHINGTON_DC_TZ,
        timeZoneName: "shortOffset",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
  }
  const offset = /^GMT/i.test(rawOffset) ? rawOffset.replace(/^GMT/i, "UTC ") : rawOffset || "UTC";
  return { hours: hours ?? time, minutes: minutes ?? "", offset };
}

function WashingtonDcClockReadout({ parts, paused = false }: { parts: WashingtonDcClockParts; paused?: boolean }) {
  return (
    <>
      {parts.hours}
      <span className={paused ? undefined : "clock-colon-blink"} aria-hidden>
        :
      </span>
      {parts.minutes} ({parts.offset})
    </>
  );
}

function WashingtonDcClockPanel() {
  const [parts, setParts] = useState(() => getWashingtonDcClockParts(new Date()));
  const [blinkPaused, setBlinkPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const tick = () => setParts(getWashingtonDcClockParts(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = `${parts.hours}:${parts.minutes} (${parts.offset})`;

  return (
    <button
      type="button"
      onClick={() => setBlinkPaused((p) => !p)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="min-w-0 w-full py-1.5 text-left focus-visible:outline-none"
      aria-label={
        blinkPaused
          ? `Washington, DC time ${timeLabel}. Colon blink stopped. Click to resume blinking.`
          : `Washington, DC time ${timeLabel}. Click to stop the colon from blinking.`
      }
    >
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Washington, DC
        </span>
        <span className="relative inline-flex items-baseline">
          <span className="font-mono text-sm tabular-nums tracking-tight text-gray-700 dark:text-gray-300" aria-live="polite">
            <WashingtonDcClockReadout parts={parts} paused={blinkPaused} />
          </span>
          <span
            className={`pointer-events-none absolute left-full top-0 ml-2 whitespace-nowrap text-xs text-gray-500 transition-opacity dark:text-gray-400 ${hovered ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!hovered}
          >
            {blinkPaused ? "Click to resume blinking" : "Click to stop the blinking"}
          </span>
        </span>
      </div>
    </button>
  );
}

/** Full viewport width from inside the middle column (margin-based; avoids clip with overflow-x) */
const fullBleed =
  "relative w-screen max-w-none shrink-0 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]";

export function SectionDiagonalGap({ bottomBorder = false }: { bottomBorder?: boolean }) {
  return (
    <div
      aria-hidden
      className={`section-diagonal-gap${bottomBorder ? ` border-b border-solid ${borderLine}` : ""}`}
    />
  );
}

function SectionTopBorder2() {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-0 z-[1] w-screen -translate-x-1/2 border-t border-solid ${borderLine}`}
    />
  );
}

function SectionBottomBorder2() {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute bottom-0 left-1/2 z-[1] w-screen -translate-x-1/2 border-b border-solid ${borderLine}`}
    />
  );
}

const EEVEELUTION_SPECIES = [
  "eevee",
  "vaporeon",
  "jolteon",
  "flareon",
  "leafeon",
  "glaceon",
  "espeon",
  "umbreon",
  "sylveon",
] as const;

function eeveelutionSpriteUrl(slug: (typeof EEVEELUTION_SPECIES)[number]) {
  return `https://img.pokemondb.net/sprites/sword-shield/normal/${slug}.png`;
}

function eeveelutionLabel(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

const SHOWDOWN_CRY_BASE = "https://play.pokemonshowdown.com/audio/cries";

function eeveelutionCryUrl(slug: string) {
  return `${SHOWDOWN_CRY_BASE}/${slug}.mp3`;
}

const EEVEE_CRIES = [eeveelutionCryUrl("eevee"), `${SHOWDOWN_CRY_BASE}/eevee-starter.mp3`] as const;

function EeveelutionBar({
  unlocked,
  onSpeciesClick,
}: {
  unlocked: boolean;
  onSpeciesClick?: (slug: (typeof EEVEELUTION_SPECIES)[number]) => void;
}) {
  const eeveeCryIndexRef = useRef(0);
  const cryAudioRef = useRef<HTMLAudioElement | null>(null);

  const playEeveelutionCry = useCallback((slug: (typeof EEVEELUTION_SPECIES)[number]) => {
    const url =
      slug === "eevee"
        ? EEVEE_CRIES[eeveeCryIndexRef.current]
        : eeveelutionCryUrl(slug);
    if (slug === "eevee") {
      eeveeCryIndexRef.current = (eeveeCryIndexRef.current + 1) % EEVEE_CRIES.length;
    }
    if (cryAudioRef.current == null) {
      cryAudioRef.current = new Audio();
    }
    const audio = cryAudioRef.current;
    audio.src = url;
    audio.volume = 0.5;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }, []);

  const handleSpeciesClick = useCallback(
    (slug: (typeof EEVEELUTION_SPECIES)[number]) => {
      onSpeciesClick?.(slug);
      playEeveelutionCry(slug);
    },
    [onSpeciesClick, playEeveelutionCry],
  );

  return (
    <div
      className="grid w-full grid-cols-9 items-center -translate-y-0.5 sm:-translate-y-1"
      role="group"
      aria-label="Eeveelution line"
    >
      {EEVEELUTION_SPECIES.map((slug, index) => (
        <button
          key={slug}
          type="button"
          onClick={unlocked ? () => handleSpeciesClick(slug) : undefined}
          disabled={!unlocked}
          tabIndex={unlocked ? 0 : -1}
          className="flex h-11 w-full min-h-0 items-center justify-center overflow-hidden p-0 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-default dark:focus-visible:ring-offset-black sm:h-12 lg:h-14"
          aria-label={unlocked ? `${eeveelutionLabel(slug)} — click to play cry` : undefined}
          aria-hidden={!unlocked}
        >
          {unlocked ? (
            <motion.img
              key={`${slug}-sprite`}
              src={eeveelutionSpriteUrl(slug)}
              alt=""
              initial={{ opacity: 0, scale: 0.88, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-auto max-w-[min(100%,6.5rem)] object-contain transition-[opacity,transform] duration-200 hover:scale-105 sm:max-w-[min(100%,7rem)] lg:max-w-[min(100%,7.5rem)]"
              decoding="async"
            />
          ) : null}
        </button>
      ))}
    </div>
  );
}

const SYLVEON_SPACER_SPRITE_FILE = "sylveon_animated_sprite_by_retronc_dg5zzve.gif";

function spacerEeveelutionAnimUrl(slug: (typeof EEVEELUTION_SPECIES)[number]) {
  if (slug === "sylveon") {
    return connectAsset(SYLVEON_SPACER_SPRITE_FILE);
  }
  return `https://img.pokemondb.net/sprites/black-white/anim/normal/${slug}.gif`;
}

function spacerSpeciesLabel(slug: (typeof EEVEELUTION_SPECIES)[number]) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

const SPACER_STAT_BAR_MAX = 255;
const SPACER_STAT_SEGMENT_COUNT = 10;

function spacerStatSegmentColorClass(label: string): string {
  switch (label) {
    case "HP":
      return "spacer-stat-bar-segment--hp";
    case "Atk":
      return "spacer-stat-bar-segment--atk";
    case "Def":
      return "spacer-stat-bar-segment--def";
    case "SpA":
      return "spacer-stat-bar-segment--spa";
    case "SpD":
      return "spacer-stat-bar-segment--spd";
    case "Spe":
      return "spacer-stat-bar-segment--spe";
    default:
      return "spacer-stat-bar-segment--spe";
  }
}

function SpacerPokemonStatBarRow({ label, base }: SpacerPokemonStatLine) {
  const filledCount = Math.max(
    1,
    Math.min(SPACER_STAT_SEGMENT_COUNT, Math.round((base / SPACER_STAT_BAR_MAX) * SPACER_STAT_SEGMENT_COUNT)),
  );
  const colorClass = spacerStatSegmentColorClass(label);

  return (
    <motion.div
      className="grid grid-cols-[2.75rem_2rem_minmax(0,1fr)] items-center gap-x-2"
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="spacer-readout-field">{label}</span>
      <span className="spacer-readout-value tabular-nums">{base}</span>
      <motion.div
        className="spacer-stat-bar-segments"
        role="presentation"
        aria-hidden
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06, ease: "linear" } } }}
      >
        {Array.from({ length: filledCount }, (_, index) => (
          <motion.div
            key={`${label}-${index}`}
            className={cn(
              "spacer-stat-bar-segment",
              "spacer-stat-bar-segment--filled",
              colorClass,
            )}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={{ duration: 0.01, ease: "linear" }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function SpacerPokemonStatBars({ stats }: { stats: SpacerPokemonStatLine[] }) {
  return (
    <motion.div
      className="spacer-pokemon-stat-bars mt-2 w-full space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01 }}
    >
      {stats.map((row) => (
        <SpacerPokemonStatBarRow key={row.label} {...row} />
      ))}
    </motion.div>
  );
}

function spacerFormatAbilities(abilities: SpacerPokemonDetails["abilities"]): string {
  return abilities
    .map((row) => (row.isHidden ? `${row.name} (hidden)` : row.name))
    .join(", ");
}

function spacerPokemonNameLine(
  species: (typeof EEVEELUTION_SPECIES)[number],
  details: Pick<SpacerPokemonDetails, "id">,
): string {
  const name = spacerSpeciesLabel(species);
  return `Name: ${name} · #${details.id}`;
}

/** Right panel: name, types, abilities, stats header. */
function spacerPokemonRightCaption(
  species: (typeof EEVEELUTION_SPECIES)[number],
  details: SpacerPokemonDetails,
): string {
  return [
    spacerPokemonNameLine(species, details),
    `Types: ${details.types.join(", ")}`,
    `Abilities: ${spacerFormatAbilities(details.abilities)}`,
    "Stats:",
  ].join("\n");
}

/** Left panel: name plus all other Pokédex fields (not types, abilities, or stats). */
function spacerPokemonLeftCaption(
  species: (typeof EEVEELUTION_SPECIES)[number],
  details: SpacerPokemonDetails,
): string {
  const name = spacerSpeciesLabel(species);
  const habitatLine =
    details.habitat != null ? `Habitat: ${details.habitat}` : "Habitat: Not listed";
  const evLine =
    details.evYield.length > 0
      ? details.evYield.map((row) => `${row.label} ${row.base}`).join(" · ")
      : "none";
  const characteristicLine =
    details.characteristic != null
      ? `${name} — Characteristic (${details.characteristic.statLabel}): ${details.characteristic.descriptions.join(" · ")}`
      : `${name} — Characteristic: Not listed`;
  const heldLine =
    details.heldItems.length > 0 ? details.heldItems.join(", ") : "none when encountered";

  const lines = [
    spacerPokemonNameLine(species, details),
    details.genus != null ? `Genus: ${details.genus}` : null,
    `Egg Groups: ${details.eggGroups.join(", ")}`,
    `Height: ${details.height} · Weight: ${details.weight}`,
    `Shape: ${details.shape}`,
    habitatLine,
    `Gender: ${details.gender}`,
    `Capture rate: ${details.captureRate} · Base happiness: ${details.baseHappiness}`,
    characteristicLine,
    `EV yield: ${evLine}`,
    `Base EXP: ${details.baseExperience}`,
    `Moves: ${details.moveCount} · Forms: ${details.formCount}`,
    `Held items: ${heldLine}`,
  ];
  return lines.filter((line): line is string => line != null).join("\n");
}

function SpacerPokemonReadoutAside({
  displayLine,
  fullLine,
  caretVisible,
  typingComplete,
  readoutHandlers,
  columnClassName,
  afterReadout,
}: {
  displayLine: string;
  fullLine: string;
  caretVisible: boolean;
  typingComplete: boolean;
  readoutHandlers: { onMouseEnter: () => void; onMouseLeave: () => void };
  columnClassName: string;
  afterReadout?: ReactNode;
}) {
  const statsHeaderIndex = fullLine.indexOf("Stats:");
  const showStatBars =
    afterReadout != null &&
    statsHeaderIndex >= 0 &&
    (typingComplete || displayLine.length >= statsHeaderIndex + "Stats:".length);

  return (
    <motion.div className={columnClassName} {...readoutHandlers}>
      <motion.div className="flex min-h-full w-full flex-1 flex-col items-center justify-center">
        <AnimatedHeightShell className="w-full">
          <motion.div className="spacer-pokemon-readout-retro w-full min-w-0">
            <SpacerPokemonTypewriterReadout
              displayLine={displayLine}
              fullLine={fullLine}
              caretVisible={caretVisible}
              typingComplete={typingComplete}
            />
            {showStatBars ? afterReadout : null}
          </motion.div>
        </AnimatedHeightShell>
      </motion.div>
    </motion.div>
  );
}

/** Empty section shell (top/bottom borders + middle column) for page breathing room. */
export function EmptySpacerSection({ className }: { className: string }) {
  const typeHoverRequestRef = useRef(0);
  const activeSpeciesRef = useRef<(typeof EEVEELUTION_SPECIES)[number] | null>(null);
  const lastRightCaptionRef = useRef("");
  const lastLeftCaptionRef = useRef("");
  const [activeSpecies, setActiveSpecies] = useState<(typeof EEVEELUTION_SPECIES)[number] | null>(null);
  const [hoverDetails, setHoverDetails] = useState<SpacerPokemonDetails | null>(null);

  const rightTypewriter = useHoverWordTypewriter({
    charInMs: 16,
    charOutMs: 3,
    releaseDelayMs: 60,
  });
  const leftTypewriter = useHoverWordTypewriter({
    charInMs: 16,
    charOutMs: 3,
    releaseDelayMs: 60,
  });

  const {
    engage: engageRight,
    release: releaseRight,
    accelerate: accelerateRight,
    displayLine: rightDisplayLine,
    caretVisible: rightCaretVisible,
    typingComplete: rightTypingComplete,
    fullLine: rightFullLine,
    phase: rightPhase,
  } = rightTypewriter;
  const {
    engage: engageLeft,
    release: releaseLeft,
    accelerate: accelerateLeft,
    displayLine: leftDisplayLine,
    caretVisible: leftCaretVisible,
    typingComplete: leftTypingComplete,
    fullLine: leftFullLine,
    phase: leftPhase,
  } = leftTypewriter;

  const isReadoutFullyShown =
    rightFullLine.length > 0 &&
    leftFullLine.length > 0 &&
    rightDisplayLine.length >= rightFullLine.length &&
    leftDisplayLine.length >= leftFullLine.length &&
    rightPhase === "in" &&
    leftPhase === "in";

  const showTypeReadout = useCallback(
    (species: (typeof EEVEELUTION_SPECIES)[number], instant: boolean) => {
      activeSpeciesRef.current = species;
      const requestId = typeHoverRequestRef.current + 1;
      typeHoverRequestRef.current = requestId;

      fetchSpacerPokemonDetails(species)
        .then((details) => {
          if (typeHoverRequestRef.current !== requestId || activeSpeciesRef.current !== species) return;
          setHoverDetails(details);
          setActiveSpecies(species);
          const rightCaption = spacerPokemonRightCaption(species, details);
          const leftCaption = spacerPokemonLeftCaption(species, details);
          lastRightCaptionRef.current = rightCaption;
          lastLeftCaptionRef.current = leftCaption;
          engageRight(rightCaption);
          engageLeft(leftCaption);
          if (instant) {
            queueMicrotask(() => {
              accelerateRight();
              accelerateLeft();
            });
          }
        })
        .catch(() => {
          if (typeHoverRequestRef.current !== requestId || activeSpeciesRef.current !== species) return;
          setHoverDetails(null);
          setActiveSpecies(species);
          const name = spacerSpeciesLabel(species);
          const fallback = `Name: ${name}\nPokédex data unavailable`;
          lastRightCaptionRef.current = fallback;
          lastLeftCaptionRef.current = fallback;
          engageRight(fallback);
          engageLeft(fallback);
          if (instant) {
            queueMicrotask(() => {
              accelerateRight();
              accelerateLeft();
            });
          }
        });
    },
    [engageLeft, engageRight, accelerateLeft, accelerateRight],
  );

  const clearTypeReadout = useCallback(() => {
    activeSpeciesRef.current = null;
    typeHoverRequestRef.current += 1;
    setHoverDetails(null);
    setActiveSpecies(null);
    releaseRight();
    releaseLeft();
  }, [releaseLeft, releaseRight]);

  const resumeTypeReadout = useCallback(() => {
    if (lastRightCaptionRef.current) engageRight(lastRightCaptionRef.current);
    if (lastLeftCaptionRef.current) engageLeft(lastLeftCaptionRef.current);
  }, [engageLeft, engageRight]);

  const handleSpriteClick = useCallback(
    (species: (typeof EEVEELUTION_SPECIES)[number]) => {
      if (activeSpeciesRef.current === species && isReadoutFullyShown) {
        accelerateRight();
        accelerateLeft();
        return;
      }

      if (
        activeSpeciesRef.current === species &&
        rightFullLine.length > 0 &&
        rightPhase === "in" &&
        !isReadoutFullyShown
      ) {
        accelerateRight();
        accelerateLeft();
        return;
      }

      showTypeReadout(species, true);
    },
    [
      accelerateLeft,
      accelerateRight,
      isReadoutFullyShown,
      rightFullLine.length,
      rightPhase,
      showTypeReadout,
    ],
  );

  useEffect(() => {
    if (rightPhase === "idle" && leftPhase === "idle") {
      setActiveSpecies(null);
      activeSpeciesRef.current = null;
    }
  }, [leftPhase, rightPhase]);

  const typeReadoutHandlers = {
    onMouseEnter: resumeTypeReadout,
    onMouseLeave: clearTypeReadout,
  };
  const typeReadoutLeftColClass =
    "relative flex min-h-0 min-w-0 self-stretch overflow-x-hidden px-1 py-1.5 sm:pl-2 sm:pr-0.5 sm:py-2";
  const typeReadoutRightColClass =
    "relative flex min-h-0 min-w-0 self-stretch overflow-x-hidden px-1 py-1.5 sm:pl-0.5 sm:pr-2 sm:py-2";

  const statBarsAfterReadout =
    hoverDetails != null && activeSpecies != null ? (
      <SpacerPokemonStatBars key={hoverDetails.id} stats={hoverDetails.stats} />
    ) : null;

  return (
    <section aria-hidden className={`relative w-full transition-colors duration-300 ${className}`}>
      <SectionTopBorder2 />
      <ThreeColumnBody
        columnClassName={`${sectionColumnPad} spacer-middle-dots`}
        leftAside={
          <SpacerPokemonReadoutAside
            displayLine={leftDisplayLine}
            fullLine={leftFullLine}
            caretVisible={leftCaretVisible}
            typingComplete={leftTypingComplete}
            readoutHandlers={typeReadoutHandlers}
            columnClassName={typeReadoutLeftColClass}
          />
        }
        rightAside={
          <SpacerPokemonReadoutAside
            displayLine={rightDisplayLine}
            fullLine={rightFullLine}
            caretVisible={rightCaretVisible}
            typingComplete={rightTypingComplete}
            readoutHandlers={typeReadoutHandlers}
            columnClassName={typeReadoutRightColClass}
            afterReadout={statBarsAfterReadout}
          />
        }
      >
        <motion.div
          className="relative flex min-h-56 items-center justify-center sm:min-h-72 lg:min-h-96"
          onMouseLeave={clearTypeReadout}
        >
          {EEVEELUTION_SPECIES.map((species) => (
            <button
              key={species}
              type="button"
              data-species={species}
              className="spacer-eeveelution-sprite pointer-events-auto z-[2] cursor-pointer border-0 bg-transparent p-0"
              aria-label={`Show ${spacerSpeciesLabel(species)} details`}
              aria-pressed={activeSpecies === species && isReadoutFullyShown}
              onMouseEnter={() => showTypeReadout(species, false)}
              onFocus={() => showTypeReadout(species, false)}
              onBlur={clearTypeReadout}
              onClick={() => handleSpriteClick(species)}
            >
              <img
                src={spacerEeveelutionAnimUrl(species)}
                alt=""
                className="spacer-eeveelution-sprite-img h-40 w-auto max-w-[min(92%,320px)] object-contain sm:h-48 lg:h-56"
              />
            </button>
          ))}
        </motion.div>
      </ThreeColumnBody>
      <SectionBottomBorder2 />
    </section>
  );
}

function CompactSpacerSectionShell({
  className,
  children,
  ariaLabel,
}: {
  className: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <section
      aria-hidden={ariaLabel == null}
      aria-label={ariaLabel}
      className={`relative w-full transition-colors duration-300 ${className}`}
    >
      <SectionTopBorder2 />
      <ThreeColumnBody columnClassName={eeveelutionColumnPad}>{children}</ThreeColumnBody>
      <SectionBottomBorder2 />
    </section>
  );
}

/** Compact band matching Eeveelution height — empty (footer breathing room). */
export function CompactBlankSpacerSection({ className }: { className: string }) {
  return (
    <CompactSpacerSectionShell className={className}>
      <div className="grid w-full grid-cols-9 items-center -translate-y-0.5 sm:-translate-y-1" aria-hidden>
        <div className="col-span-9 h-11 sm:h-12 lg:h-14" />
      </div>
    </CompactSpacerSectionShell>
  );
}

/** Shorter band under the main spacer — Eeveelution row (same borders / three-column shell). */
export function CompactEmptySpacerSection({ className }: { className: string }) {
  const { eeveelutionsUnlocked, onEeveelutionClick } = useTheme();

  return (
    <CompactSpacerSectionShell className={className} ariaLabel="Eeveelutions">
      <EeveelutionBar unlocked={eeveelutionsUnlocked} onSpeciesClick={onEeveelutionClick} />
    </CompactSpacerSectionShell>
  );
}

function ViewportSingleRule() {
  return (
    <div
      aria-hidden
      className={`relative left-1/2 z-[1] h-0 w-screen max-w-none -translate-x-1/2 border-0 border-b border-solid ${borderLine}`}
    />
  );
}

/** Bottom border spanning the bordered middle column (measured; touches vertical rules). */
function ContentColumnRule() {
  const layout = useContext(MiddleRuleLayoutContext);
  return (
    <div
      aria-hidden
      className={`relative h-0 shrink-0 border-0 border-b border-solid ${borderLine} ${layout ? "" : "w-full"}`}
      style={layout ? { marginLeft: layout.marginLeft, width: layout.width } : undefined}
    />
  );
}

/** Span the full width inside the middle column’s vertical rules (no extra outer box). */
function MiddleColumnBleed({ children, className = "" }: { children: ReactNode; className?: string }) {
  const layout = useContext(MiddleRuleLayoutContext);
  return (
    <div
      className={`relative shrink-0 ${layout ? "" : "w-full"} ${className}`}
      style={layout ? { marginLeft: layout.marginLeft, width: layout.width } : undefined}
    >
      {children}
    </div>
  );
}

/** Invisible height match for double rules in the middle column (side readout alignment). */
function CredentialRowTopSpacer() {
  return (
    <div aria-hidden className="invisible pointer-events-none w-full shrink-0">
      <ViewportAdjacentRulesShaper />
    </div>
  );
}

/** Full-bleed rule(s) between subsections within a major section. */
function ViewportAdjacentRulesShaper({
  variant = "double",
  rulePad = subsectionRulePadY,
}: {
  variant?: "single" | "double";
  rulePad?: string;
}) {
  return (
    <div aria-hidden className={rulePad}>
      {variant === "single" ? (
        <ViewportSingleRule />
      ) : (
        <div className="flex flex-col gap-1">
          <ViewportSingleRule />
          <ViewportSingleRule />
        </div>
      )}
    </div>
  );
}

/** Final full-bleed rule before section bottom border (Featured Work: bare rule, gap from column pad). */
function SectionFinalRule() {
  return <ViewportSingleRule />;
}

/** Single full-bleed line before a major section’s bottom border (portfolio grid sections). */
function SectionEndCap() {
  return (
    <div aria-hidden>
      <SectionFinalRule />
    </div>
  );
}

function TechStackCategory({
  title,
  children,
  contentPad = techBadgesPad,
}: {
  title: string;
  children: ReactNode;
  contentPad?: string;
}) {
  return (
    <>
      <h3
        className={`mb-0 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-2 text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200 ${techSubsectionTitlePad}`}
      >
        <span
          aria-hidden
          className={`tech-subsection-title-rule block h-px w-full border-0 border-b border-solid ${borderLine}`}
        />
        <span className="shrink-0 px-0.5">{title}</span>
        <span
          aria-hidden
          className={`tech-subsection-title-rule block h-px w-full border-0 border-b border-solid ${borderLine}`}
        />
      </h3>
      <div className={contentPad}>{children}</div>
    </>
  );
}

function ThreeColumnBody({
  children,
  gridClassName = "",
  columnClassName = "",
  middleBorderClassName,
  leftAside,
  rightAside,
}: {
  children: ReactNode;
  gridClassName?: string;
  columnClassName?: string;
  /** Defaults to gray rules; use e.g. `border-white/30` on dark bars (footer). */
  middleBorderClassName?: string;
  /** Optional content in the left grid column (e.g. Featured Work typewriter). */
  leftAside?: ReactNode;
  /** Optional content in the right grid column (e.g. Tech Stack personal experience). */
  rightAside?: ReactNode;
}) {
  const middleBorders = middleBorderClassName ?? borderLine;
  const middleEl = useRef<HTMLDivElement>(null);
  const innerEl = useRef<HTMLDivElement>(null);
  const [middleRuleLayout, setMiddleRuleLayout] = useState<MiddleRuleLayout | null>(null);

  useLayoutEffect(() => {
    const mid = middleEl.current;
    const inner = innerEl.current;
    if (!mid || !inner) return;

    const update = () => {
      const m = middleEl.current;
      const i = innerEl.current;
      if (!m || !i) return;
      const midR = m.getBoundingClientRect();
      const innerR = i.getBoundingClientRect();
      const cs = getComputedStyle(m);
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const marginLeft = midR.left + bl - innerR.left;
      const width = midR.width - bl - (parseFloat(cs.borderRightWidth) || 0);
      setMiddleRuleLayout({ marginLeft, width });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(mid);
    ro.observe(inner);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <MiddleRuleLayoutContext.Provider value={middleRuleLayout}>
      <div className={`${pageGridClass} ${gridClassName}`}>
        <div
          className={
            leftAside != null
              ? "relative flex min-h-0 min-w-0 flex-col self-stretch overflow-x-hidden"
              : "min-w-0"
          }
          aria-hidden={leftAside == null}
        >
          {leftAside ?? null}
        </div>
        <div
          ref={middleEl}
          className={`relative min-w-0 overflow-visible border-l border-r border-solid ${middleBorders} ${columnClassName}`}
        >
          <div ref={innerEl} className={middleColumnInnerClass}>
            {children}
          </div>
        </div>
        <div
          className={
            rightAside != null
              ? "relative flex min-h-0 min-w-0 flex-col self-stretch overflow-x-hidden"
              : "min-w-0"
          }
          aria-hidden={rightAside == null}
        >
          {rightAside ?? null}
        </div>
      </div>
    </MiddleRuleLayoutContext.Provider>
  );
}

const TechBadge = ({
  name,
  iconImage,
  fallbackIcon,
  website,
  hoverCaption,
  personalExperience,
  personalWhy,
  onHoverDescribe,
  onHoverEnd,
}: TechStackItem & {
  onHoverDescribe: (item: TechStackItem) => void;
  onHoverEnd: () => void;
}) => {
  const iconEl = iconImage ? (
    <img
      src={iconImage}
      alt=""
      className="h-8 w-8 object-contain opacity-45 grayscale transition-[transform,filter,opacity] duration-200 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0 group-focus-within:opacity-100 group-focus-within:grayscale-0"
      onError={(e) => {
        if (fallbackIcon && e.currentTarget.src !== fallbackIcon) {
          e.currentTarget.src = fallbackIcon;
        }
      }}
    />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-gray-500 opacity-50 transition-opacity duration-200 group-hover:opacity-100 dark:text-gray-400">
      {name.slice(0, 2)}
    </span>
  );

  const hitTargetClass =
    "inline-flex rounded-sm p-0.5 outline-none ring-offset-2 ring-offset-white transition-[opacity,box-shadow] hover:opacity-90 hover:ring-2 hover:ring-gray-300/80 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:ring-offset-black dark:hover:ring-gray-600 dark:focus-visible:ring-gray-500";

  const hoverItem: TechStackItem = {
    name,
    hoverCaption,
    personalExperience,
    personalWhy,
    website,
    iconImage,
    fallbackIcon,
  };

  const hoverHandlers = {
    onMouseEnter: () => onHoverDescribe(hoverItem),
    onMouseLeave: onHoverEnd,
    onFocus: () => onHoverDescribe(hoverItem),
    onBlur: onHoverEnd,
  };

  return (
    <div className="group relative">
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} — hover for description, click to open site`}
          className={hitTargetClass}
          {...hoverHandlers}
        >
          {iconEl}
        </a>
      ) : (
        <span className={`${hitTargetClass} cursor-pointer`} aria-label={name} {...hoverHandlers}>
          {iconEl}
        </span>
      )}
    </div>
  );
};

function TechStackSection() {
  const { engage: engageDesc, release: releaseDesc, displayLine, caretVisible } = useHoverWordTypewriter();
  const {
    engage: engageExp,
    release: releaseExp,
    displayLine: experienceLine,
    caretVisible: experienceCaret,
  } = useHoverWordTypewriter();
  const { engage: engageWhy, release: releaseWhy, displayLine: whyLine, caretVisible: whyCaret } =
    useHoverWordTypewriter();
  const {
    engage: engageInterest,
    release: releaseInterest,
    displayLine: interestLine,
    caretVisible: interestCaret,
  } = useHoverWordTypewriter();
  const [activeName, setActiveName] = useState("");

  const engageInterestWhy = useCallback(
    (text: string) => {
      engageInterest(text);
    },
    [engageInterest],
  );

  const releaseInterestWhy = useCallback(() => {
    releaseInterest();
  }, [releaseInterest]);

  const engageTool = useCallback(
    (item: TechStackItem) => {
      setActiveName(item.name);
      engageDesc(item.hoverCaption);
      engageExp(item.personalExperience);
      engageWhy(item.personalWhy);
    },
    [engageDesc, engageExp, engageWhy],
  );

  const releaseTool = useCallback(() => {
    releaseDesc();
    releaseExp();
    releaseWhy();
  }, [releaseDesc, releaseExp, releaseWhy]);

  useEffect(() => {
    if (!displayLine && !caretVisible && !experienceLine && !experienceCaret && !whyLine && !whyCaret) {
      setActiveName("");
    }
  }, [displayLine, caretVisible, experienceLine, experienceCaret, whyLine, whyCaret]);

  return (
    <MiddleRuleLayoutContext.Provider value={null}>
      <motion.div className={pageGridClass}>
        <TechStackSideCell side="left" className="sm:pt-8">
          <TechStackTypewriterReadout label={activeName} displayLine={displayLine} caretVisible={caretVisible} />
        </TechStackSideCell>
        <TechStackMiddleCell
          className="pt-1.5 sm:pt-2"
          trailing={
            <div aria-hidden className={techStackTitleRulePadY}>
              <ViewportSingleRule />
            </div>
          }
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Toolkit</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Tech Stack
            </h2>
          </motion.div>
        </TechStackMiddleCell>
        <TechStackSideCell side="right" className="sm:pt-8">
          <TechStackNameSlot label={activeName} />
        </TechStackSideCell>

        {techStackSections.map((section, sectionIndex) => (
          <Fragment key={section.title}>
            <TechStackSideCell side="left" />
            <TechStackMiddleCell pad="subsection">
              <TechStackCategory title={section.title}>
                <div className="flex flex-wrap gap-4">
                  {section.items.map((item) => (
                    <TechBadge key={item.name} {...item} onHoverDescribe={engageTool} onHoverEnd={releaseTool} />
                  ))}
                </div>
              </TechStackCategory>
            </TechStackMiddleCell>
            <TechStackSideCell side="right">
              {section.title === "Programming" ? (
                <TechStackExperienceSlot experienceLine={experienceLine} experienceCaret={experienceCaret} />
              ) : section.title === "Technologies" ? (
                <TechStackWhySlot whyLine={whyLine} whyCaret={whyCaret} />
              ) : null}
            </TechStackSideCell>
            {sectionIndex < techStackSections.length - 1 ? (
              <>
                <TechStackSideCell side="left" />
                <TechStackMiddleCell
                  pad="rule"
                  trailing={<ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />}
                />
                <TechStackSideCell side="right" />
              </>
            ) : null}
          </Fragment>
        ))}

        <TechStackSideCell side="left" />
        <TechStackMiddleCell
          pad="rule"
          trailing={<ViewportAdjacentRulesShaper variant="single" rulePad={techSubsectionRulePadY} />}
        />
        <TechStackSideCell side="right" />

        <TechStackSideCell side="left" />
        <TechStackMiddleCell pad="subsection">
          <TechStackCategory title="Interests" contentPad="pt-0 pb-1 sm:pb-1.5">
            {techInterests.map((interest) => (
              <InterestCell
                key={interest.label}
                label={interest.label}
                whyInterest={interest.whyInterest}
                onHover={engageInterestWhy}
                onLeave={releaseInterestWhy}
              />
            ))}
          </TechStackCategory>
        </TechStackMiddleCell>
        <TechStackSideCell side="right">
          <TechStackInterestWhySlot whyLine={interestLine} whyCaret={interestCaret} />
        </TechStackSideCell>

        <TechStackSideCell side="left" />
        <TechStackMiddleCell className={sectionEndPadBelowRule}>
          <SectionFinalRule />
        </TechStackMiddleCell>
        <TechStackSideCell side="right" />
      </motion.div>
    </MiddleRuleLayoutContext.Provider>

  );
}

export default function PersonalHomepage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const weirdWebsiteCategories = [
    {
      title: "Random weird buttons",
      sites: [
        { name: "The Useless Web", url: "https://theuselessweb.com" },
        { name: "The Bored Button", url: "https://boredbutton.com" },
        { name: "Neal.fun", url: "https://neal.fun" },
        { name: "Neave Interactive", url: "https://neave.com" },
        { name: "Wiki Roulette", url: "https://wikiroulette.co" },
        { name: "MapCrunch", url: "https://mapcrunch.com" },
        { name: "Pixel Thoughts", url: "https://pixelthoughts.co" },
        { name: "The Secret Door", url: "https://thesecretdoor.com" },
        { name: "Always Judge A Book By Its Cover", url: "https://alwaysjudgeabookbyitscover.com" },
        { name: "Wayback Machine", url: "https://web.archive.org" },
      ],
    },
    {
      title: "Pointless, but weirdly satisfying",
      sites: [
        { name: "Pointer Pointer", url: "https://pointerpointer.com" },
        { name: "Heeeeeeeey", url: "https://heeeeeeeey.com" },
        { name: "Zombo", url: "https://zombo.com" },
        { name: "Cat Bounce", url: "https://cat-bounce.com" },
        { name: "Eel Slap", url: "https://eelslap.com" },
        { name: "Bury Me With My Money", url: "https://burymewithmymoney.com" },
        { name: "Paper Toilet", url: "https://papertoilet.com" },
        { name: "Long Doge Challenge", url: "https://longdogechallenge.com" },
        { name: "Endless Horse", url: "https://endless.horse" },
        { name: "Corndog", url: "https://corndog.io" },
        { name: "Make Everything OK", url: "https://make-everything-ok.com" },
        { name: "Is It Christmas?", url: "https://isitchristmas.com" },
        { name: "Is It Friday Yet?", url: "https://isitfridayyet.net" },
        { name: "Patience Is A Virtue", url: "https://patience-is-a-virtue.org" },
        { name: "Scream Into The Void", url: "https://screamintothevoid.com" },
      ],
    },
    {
      title: "Interactive art and visuals",
      sites: [
        { name: "Staggering Beauty", url: "https://staggeringbeauty.com" },
        { name: "Koalas to the Max", url: "https://koalastothemax.com" },
        { name: "Zoomquilt", url: "https://zoomquilt.org" },
        { name: "Zoomquilt 2", url: "https://zoomquilt2.com" },
        { name: "Falling Falling", url: "https://fallingfalling.com" },
        { name: "This Is Sand", url: "https://thisissand.com" },
        { name: "Weave Silk", url: "https://weavesilk.com" },
        { name: "Patatap", url: "https://patatap.com" },
        { name: "The Internet Map", url: "https://internet-map.net" },
        { name: "The Wilderness Downtown", url: "https://thewildernessdowntown.com" },
        { name: "Cool Backgrounds", url: "https://coolbackgrounds.io" },
        { name: "AutoDraw", url: "https://autodraw.com" },
        { name: "CSS Zen Garden", url: "https://csszengarden.com" },
        { name: "The Pudding", url: "https://pudding.cool" },
        { name: "Information Is Beautiful", url: "https://informationisbeautiful.net" },
        { name: "The True Size Of...", url: "https://thetruesize.com" },
        { name: "Scale of the Universe", url: "https://scaleofuniverse.com" },
        { name: "Every Time Zone", url: "https://everytimezone.com" },
        { name: "Nyan Cat", url: "https://nyan.cat" },
      ],
    },
    {
      title: "Sound, music, and calm weird",
      sites: [
        { name: "A Soft Murmur", url: "https://asoftmurmur.com" },
        { name: "Rainy Mood", url: "https://rainymood.com" },
        { name: "Incredibox", url: "https://incredibox.com" },
        { name: "Radio Garden", url: "https://radio.garden" },
        { name: "The Zen Zone", url: "https://thezen.zone" },
        { name: "WindowSwap", url: "https://window-swap.com" },
        { name: "The Nicest Place on the Internet", url: "https://thenicestplace.net" },
        { name: "Music Map", url: "https://music-map.com" },
        { name: "Gnoosic", url: "https://gnoosic.com" },
      ],
    },
    {
      title: "Mini games and browser challenges",
      sites: [
        { name: "Hacker Typer", url: "https://hackertyper.com" },
        { name: "The Wiki Game", url: "https://thewikigame.com" },
        { name: "Find The Invisible Cow", url: "https://findtheinvisiblecow.com" },
        { name: "Little Alchemy 2", url: "https://littlealchemy2.com" },
        { name: "GeoGuessr", url: "https://geoguessr.com" },
        { name: "Playingcards.io", url: "https://playingcards.io" },
        { name: "Akinator", url: "https://akinator.com" },
        { name: "Checkbox Olympics", url: "https://checkboxolympics.com" },
      ],
    },
    {
      title: "Weird tools that are oddly useful",
      sites: [
        { name: "Time.is", url: "https://time.is" },
        { name: "Random.org", url: "https://random.org" },
        { name: "Generated Photos", url: "https://generated.photos" },
        { name: "This Person Does Not Exist", url: "https://thispersondoesnotexist.com" },
        { name: "FutureMe", url: "https://futureme.org" },
        { name: "Hemingway Editor", url: "https://hemingwayapp.com" },
        { name: "Zoom Earth", url: "https://zoom.earth" },
        { name: "Bored API", url: "https://boredapi.com" },
      ],
    },
    {
      title: "Rabbit holes and internet culture",
      sites: [
        { name: "The Library of Babel", url: "https://libraryofbabel.info" },
        { name: "Don't Even Reply", url: "https://dontevenreply.com" },
        { name: "Not Always Right", url: "https://notalwaysright.com" },
        { name: "Wait But Why", url: "https://waitbutwhy.com" },
        { name: "OMFGDOGS", url: "https://omfgdogs.com" },
        { name: "The Big Blue Ball", url: "https://bigblueball.com" },
        { name: "SCP Foundation Wiki", url: "https://scp-wiki.wikidot.com" },
        { name: "Space Jam (1996)", url: "https://spacejam.com/1996" },
        { name: "The Quiet Place Project", url: "https://thequietplaceproject.xyz" },
        { name: "One Million Checkboxes", url: "https://onemillioncheckboxes.com" },
        { name: "The Oatmeal", url: "https://theoatmeal.com" },
        { name: "CodePen", url: "https://codepen.io" },
      ],
    },
  ];

  const allWebsites = weirdWebsiteCategories.flatMap((cat) => cat.sites);
  const getRandomWebsites = () => [...allWebsites].sort(() => Math.random() - 0.5).slice(0, 4);

  const [randomWebsites, setRandomWebsites] = useState(getRandomWebsites());
  const [showAllWebsitesModal, setShowAllWebsitesModal] = useState(false);
  const [resumeRolled, setResumeRolled] = useState(false);

  const projects = [
    {
      title: "PatriotRead",
      description:
        "A browser extension for accessibility through TTS, summarization, and visual modes.",
      hoverCaption: `We all know what it feels like to open a page and instantly shut down: tiny fonts, dense paragraphs, jargon everywhere. For students with ADHD, dyslexia, visual impairments, or just end-of-day brain fog, that "wall of text" can be a real barrier, not just an annoyance.

We wanted something that follows the user, not the website. Instead of begging every site to fix its accessibility, we asked:

"What if you could take any web page and instantly make it easier to read, understand, and listen to?"`,
      tools: ["JavaScript", "Azure OpenAI", "Chrome Extension API", "TTS"],
      link: "https://github.com/VuNguyen123456/pocket-translator",
      image: patriotReadLogo,
      emoji: null as string[] | null,
    },
    {
      title: "Quizly - AI-Powered Flashcard Generator",
      titleShort: "Quizly",
      description: "Generate flashcards from PDFs/text with a FastAPI and React stack.",
      hoverCaption: `Quizly started from a personal problem I was trying to solve. I spend a lot of time commuting, and I wanted a more efficient way to study during that time instead of just passively reviewing notes. I realized that if I could turn things like PDFs or lecture notes into interactive flashcards or quizzes automatically, I could make that time much more productive.`,
      hoverReadoutPadTop: "justify-start pt-3 sm:pt-4",
      tools: ["FastAPI", "React", "OpenAI GPT-4o", "JWT", "MongoDB"],
      link: "https://github.com/prabhath004/quizly",
      image: null as string | null,
      emoji: null,
    },
    {
      title: "Pokemon AI Agent",
      description: "Conversational assistant for Pokemon strategy and analysis.",
      hoverCaption: "I love pokemon",
      clickDismissMercyMs: 500,
      hoverReadoutPadTop: "justify-center pt-4 sm:pt-5",
      hoverRandomPokemonFromDex: true,
      tools: ["LangChain", "ChatGPT-4o Mini", "Python", "Smogon API"],
      link: "https://github.com/VuNguyen123456/Discord-bot",
      image: pokemonImage,
      emoji: null,
    },
    {
      title: "CourseCupid MVP",
      description: "Course collaboration and study-partner matching platform.",
      hoverCaption: `Our inspiration was the beautiful holiday of valentines! We figured that the best way to get students together was to make it easy! Sometimes the classroom is overwhelming and can bog students down. So we decided to make it easy and allow students to work together remotely, through a dedicated prestructured app with relevant course material instead of external applications.`,
      hoverReadoutPadTop: "justify-start pt-3 sm:pt-4",
      tools: ["MongoDB", "React", "Node.js", "AI Matching"],
      link: "https://github.com/dzhou6/SPEED",
      image: courseCupidLogo,
      emoji: null,
    },
    {
      title: "Coffee Store E-commerce Checkout Service",
      titleShort: "Coffee Store Checkout",
      description: "AWS checkout service with HA and blue-green deploys for an end-to-end coffee store.",
      hoverCaption:
        "Coffee is the shit. ☕",
      clickDismissMercyMs: 500,
      hoverReadoutCentered: true,
      tools: ["AWS", "Docker", "Kubernetes", "Load Balancer", "PCI DSS"],
      link: "https://github.com/VuNguyen123456/E-commerce-Platform-Deployment",
      image: null,
      emoji: null,
    },
  ];

  const displayedProjects = showAllProjects ? projects : projects.slice(0, 2);

  return (
    <div className="relative min-h-screen bg-white transition-colors duration-300 dark:bg-black">
      <motion.section
        id="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full bg-white transition-colors duration-300 dark:bg-black"
      >
        <SectionTopBorder2 />
        <ThreeColumnBody columnClassName={sectionColumnPad}>
          <motion.div
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative z-[2] flex min-w-0 flex-col gap-1.5"
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className="absolute -right-2 top-0 z-10 shrink-0 rounded-full border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-100 sm:-right-3.5 lg:-right-5 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-neutral-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className={`flex flex-col gap-0.5 text-left pb-2 sm:pb-2.5 ${sectionTitlePad}`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Computer Science
              </p>
              <h1 className="min-w-0 max-w-full break-words pr-12 text-3xl font-bold leading-snug tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
                Vu Nguyen
              </h1>
            </div>
            <div className="flex min-w-0 flex-col">
              <div aria-hidden className={rulePadY}>
                <ViewportSingleRule />
              </div>
              <WashingtonDcClockPanel />
              <div aria-hidden className={rulePadY}>
                <ViewportSingleRule />
              </div>
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Machine Learning. Cloud Computing. Full-Stack Development.
            </p>
            <div aria-hidden className={rulePadY}>
              <ViewportSingleRule />
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Passionate about building innovative software solutions at George Mason University.
            </p>
            <div className="flex min-w-0 flex-col">
              <div aria-hidden className="pt-1">
                <ViewportSingleRule />
              </div>
              <div
                className="my-2 flex min-w-0 overflow-hidden rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm dark:border-gray-600 dark:bg-white dark:text-gray-900"
                role="group"
                aria-label="Resume and social links"
              >
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setResumeRolled(true)}
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-normal tracking-wide text-gray-900 outline-none transition-colors hover:bg-gray-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-3"
                  aria-label={resumeRolled ? "rolled lmao :)" : "Resume"}
                >
                  {resumeRolled ? null : (
                    <FileText className="h-3 w-3 shrink-0 text-gray-800" strokeWidth={1.5} />
                  )}
                  <span className="truncate lowercase">{resumeRolled ? "rolled lmao :)" : "resume"}</span>
                </a>
                <div className="w-px shrink-0 self-stretch bg-gray-300 dark:bg-gray-500" aria-hidden />
                <a
                  href="https://github.com/VuNguyen123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-normal tracking-wide text-gray-900 outline-none transition-colors hover:bg-gray-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-3"
                  aria-label="GitHub profile"
                >
                  <HeroIconGithub className="h-3 w-3 shrink-0 text-gray-800" />
                  <span className="truncate lowercase">github</span>
                </a>
                <div className="w-px shrink-0 self-stretch bg-gray-300 dark:bg-gray-500" aria-hidden />
                <a
                  href="https://www.linkedin.com/in/vu-nguyen-in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-normal tracking-wide text-gray-900 outline-none transition-colors hover:bg-gray-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-3"
                  aria-label="LinkedIn profile"
                >
                  <HeroIconLinkedin className="h-3 w-3 shrink-0 text-gray-800" />
                  <span className="truncate lowercase">linkedin</span>
                </a>
              </div>
              <div aria-hidden>
                <SectionFinalRule />
              </div>
            </div>
          </motion.div>
        </ThreeColumnBody>
        <SectionBottomBorder2 />
      </motion.section>

      <SectionDiagonalGap />

      <section
        id="projects"
        className="relative w-full bg-white transition-colors duration-300 dark:bg-black"
      >
        <SectionTopBorder2 />
        <MiddleRuleLayoutContext.Provider value={null}>
          <LayoutGroup id="featured-work">
          <div className={pageGridClass}>
            <div className="min-w-0" aria-hidden />
            <div className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${portfolioTitleBlockPad}`}>
              <div className={middleColumnInnerClass}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Portfolio</p>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Featured Work
                  </h2>
                  <p className="mt-0.5 max-w-xl font-mono text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                    Hover a project for a typed hint. Click the row (left or right) to reveal or clear instantly.
                  </p>
                </motion.div>
              </div>
              <motion.div aria-hidden className={featuredWorkTitleRulePadY}>
                <ViewportSingleRule />
              </motion.div>
            </div>
            <div className="min-w-0" aria-hidden />

            {displayedProjects.map((project, index) => (
              <FeaturedProjectGridRow key={project.title} project={project} index={index} />
            ))}

            <Fragment>
              <div className="min-w-0" aria-hidden />
              <div
                className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} px-1.5 pt-0 pb-0.5 sm:px-2 sm:pb-1 lg:px-3`}
              >
                <ViewportAdjacentRulesShaper rulePad="pt-1 sm:pt-1.5 pb-0" />
                <motion.div className={middleColumnInnerClass}>

                  <div className="flex items-center justify-center py-0.5 sm:py-1">
                    <Button
                      onClick={() => setShowAllProjects(!showAllProjects)}
                      variant="ghost"
                      size="relaxRow"
                      aria-label={showAllProjects ? "See less projects" : "See more projects"}
                      aria-expanded={showAllProjects}
                      className="group box-border inline-flex size-7 min-h-0 items-center justify-center p-0 leading-none text-gray-600 transition-[color,filter] duration-200 hover:bg-transparent hover:text-blue-600 hover:drop-shadow-[0_0_6px_rgba(37,99,235,0.4)] dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-blue-400 dark:hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] [&_svg]:block [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:-translate-y-px"
                    >
                      {showAllProjects ? (
                        <ChevronsDownUp strokeWidth={2} aria-hidden />
                      ) : (
                        <ChevronsUpDown strokeWidth={2} aria-hidden />
                      )}
                    </Button>
                  </div>

                  <SectionEndCap />
                </motion.div>
              </div>
              <div className="min-w-0" aria-hidden />
            </Fragment>
          </div>
          </LayoutGroup>
        </MiddleRuleLayoutContext.Provider>
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      <section
        id="work-experience"
        className="relative w-full bg-white transition-colors duration-300 dark:bg-black"
      >
        <SectionTopBorder2 />
        <MiddleRuleLayoutContext.Provider value={null}>
          <div className={pageGridClass}>
            <div className="min-w-0" aria-hidden />
            <div className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${portfolioTitleBlockPad}`}>
              <div className={middleColumnInnerClass}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Career</p>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Work Experience
                  </h2>
                </motion.div>
              </div>
              <motion.div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </motion.div>
              <motion.div className={afterTitleRulePad}>
                {workExperienceEntries.map((entry, index) => (
                  <Fragment key={entry.id}>
                    {index > 0 ? (
                      <motion.div aria-hidden className={subsectionRulePadY}>
                        <ViewportAdjacentRulesShaper />
                      </motion.div>
                    ) : null}
                    <WorkExperienceRow entry={entry} />
                  </Fragment>
                ))}
              </motion.div>
              <motion.div className={`${subsectionRulePadY} ${sectionEndPadBelowRule}`}>
                <SectionEndCap />
              </motion.div>
            </div>
            <div className="min-w-0" aria-hidden />
          </div>
        </MiddleRuleLayoutContext.Provider>
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      <section id="tech-stack" className="relative w-full bg-white transition-colors duration-300 dark:bg-black">
        <SectionTopBorder2 />
        <TechStackSection />
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      <section
        id="credentials"
        className="relative w-full bg-white transition-colors duration-300 dark:bg-black"
      >
        <SectionTopBorder2 />
        <MiddleRuleLayoutContext.Provider value={null}>
          <div className={pageGridClass}>
            <div className="min-w-0" aria-hidden />
            <div className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${portfolioTitleBlockPad}`}>
              <div className={middleColumnInnerClass}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Recognition
                  </p>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Scholarships & awards
                  </h2>
                </motion.div>
              </div>
              <div aria-hidden className={subsectionRulePadY}>
                <ViewportSingleRule />
              </div>
            </div>
            <div className="min-w-0" aria-hidden />

            {credentialEntries.map((entry, index) => (
              <CredentialGridRow key={entry.title} entry={entry} index={index} />
            ))}

            <Fragment>
              <div className="min-w-0" aria-hidden />
              <div
                className={`relative min-w-0 overflow-visible border-l border-r border-solid ${borderLine} ${portfolioMiddlePad} ${sectionEndPadBelowRule}`}
              >
                <div className={middleColumnInnerClass}>
                  <SectionEndCap />
                </div>
              </div>
              <div className="min-w-0" aria-hidden />
            </Fragment>
          </div>
        </MiddleRuleLayoutContext.Provider>
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      <section id="relaxing" className="relative w-full bg-white transition-colors duration-300 dark:bg-black">
        <SectionTopBorder2 />
        <ThreeColumnBody columnClassName={sectionColumnPad}>
          <motion.div className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Break Time</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">Relaxing</h2>
            <p className="text-sm leading-snug text-gray-600 dark:text-gray-400">
              Weird websites to waste time on — shuffle for a new set of four.
            </p>
          </motion.div>

          <div className={afterTitleRulePad}>
            <div className="relax-websites-block">
              <div aria-hidden className={relaxGridRulePadY}>
                <ViewportSingleRule />
              </div>
              <MiddleColumnBleed className="relax-panels-grid relative grid grid-cols-1 gap-x-0 gap-y-0 sm:grid-cols-2">
                {randomWebsites.map((site, index) => (
                <motion.div
                  key={`${site.url}-${index}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.05 + index * 0.06 }}
                  className="min-w-0 h-full bg-white dark:bg-black"
                >
                  <RelaxSiteCell site={site} className="h-full" />
                </motion.div>
                ))}
              </MiddleColumnBleed>

              <div aria-hidden className={relaxGridRulePadY}>
                <ViewportSingleRule />
              </div>
            </div>

            <div className="flex flex-col" role="group" aria-label="Relaxing section actions">
              <MiddleColumnBleed className={relaxActionRowPad}>
                <Button
                  onClick={() => setRandomWebsites(getRandomWebsites())}
                  variant="ghost"
                  size="relaxRow"
                  className={relaxActionButtonClass}
                >
                  <Globe />
                  Shuffle
                </Button>
              </MiddleColumnBleed>
              <div aria-hidden className={relaxGridRulePadY}>
                <ViewportSingleRule />
              </div>
              <MiddleColumnBleed className={relaxActionRowPad}>
                <Button
                  onClick={() => setShowAllWebsitesModal(true)}
                  variant="ghost"
                  size="relaxRow"
                  className={relaxActionButtonClass}
                >
                  <BookOpen />
                  View all
                </Button>
              </MiddleColumnBleed>
            </div>

            <div aria-hidden>
              <SectionFinalRule />
            </div>
          </div>
        </ThreeColumnBody>
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      <section id="connect" className="relative w-full bg-white transition-colors duration-300 dark:bg-black">
        <SectionTopBorder2 />
        <ThreeColumnBody columnClassName={sectionColumnPad}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`mb-0 flex flex-col gap-0 text-left ${sectionTitlePad}`}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Connect</p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">Elsewhere</h2>
          </motion.div>

          <div className={cn(afterTitleRulePad, "connect-elsewhere-block")}>
            <div aria-hidden className={connectRulePadY}>
              <ViewportSingleRule />
            </div>
            <MiddleColumnBleed className="connect-panels-grid eevee-connect-panels relative grid grid-cols-1 gap-x-0 gap-y-0 sm:grid-cols-3">
              {connectElsewhereEntries.map((entry, index) => (
                <motion.div
                  key={`${entry.title}-${entry.subtitle}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.04 + index * 0.05 }}
                  className="min-w-0 h-full bg-white dark:bg-black"
                >
                  <ConnectElsewhereCell entry={entry} />
                </motion.div>
              ))}
            </MiddleColumnBleed>

            <div aria-hidden className={connectRulePadY}>
              <SectionFinalRule />
            </div>
          </div>
        </ThreeColumnBody>
        <SectionBottomBorder2 />
      </section>

      <SectionDiagonalGap />

      {showAllWebsitesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowAllWebsitesModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between bg-gray-900 px-8 py-6">
              <h2 className="text-3xl font-bold text-white">All Weird Websites</h2>
              <button
                onClick={() => setShowAllWebsitesModal(false)}
                className="text-3xl font-light text-white transition-colors hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="max-h-[calc(85vh-88px)] overflow-y-auto p-8">
              <div className="space-y-8">
                {weirdWebsiteCategories.map((category, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="mb-4 border-b-2 border-gray-200 pb-2 text-xl font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                      {category.title}
                    </h3>
                    <div
                      className={`grid grid-cols-1 divide-y divide-solid sm:grid-cols-2 sm:divide-x ${borderLine} border border-solid ${borderLine}`}
                    >
                      {category.sites.map((site, siteIndex) => (
                        <RelaxSiteCell key={siteIndex} site={site} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <footer className="relative w-full bg-white transition-colors duration-300 dark:bg-black">
        <SectionTopBorder2 />
        <ThreeColumnBody columnClassName="px-2 pb-0 pt-0 sm:px-3 lg:px-4">
          <MiddleColumnBleed>
            <div className={`eevee-footer-panels grid grid-cols-1 border-t border-solid sm:grid-cols-3 sm:items-stretch ${borderLine}`}>
              <div className={`border-solid sm:border-r ${borderLine}`}>
                <div className="px-3 py-5 lg:px-4">
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="#hero"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="#projects"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Projects
                    </a>
                  </li>
                  <li>
                    <a
                      href="#work-experience"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Work Experience
                    </a>
                  </li>
                  <li>
                    <a
                      href="#tech-stack"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Tech Stack
                    </a>
                  </li>
                  <li>
                    <a
                      href="#credentials"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Scholarships & awards
                    </a>
                  </li>
                  <li>
                    <a
                      href="#relaxing"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Relaxing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#connect"
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Connect
                    </a>
                  </li>
                </ul>
                </div>
              </div>

              <div className={`border-t border-solid sm:border-r sm:border-t-0 ${borderLine}`}>
                <div className="px-3 py-5 lg:px-4">
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="https://github.com/VuNguyen123456"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/in/vu-nguyen-in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                      LinkedIn
                    </a>
                  </li>
                </ul>
                </div>
              </div>

              <div className={`border-t border-solid sm:border-t-0 ${borderLine}`}>
                <div className="px-3 py-5 lg:px-4">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Computer Science student at George Mason University building innovative solutions.
                </p>
                </div>
              </div>
            </div>
          </MiddleColumnBleed>

          <div aria-hidden>
            <ViewportSingleRule />
          </div>

          <p className="py-1.5 text-center text-sm text-gray-500 dark:text-gray-400 sm:py-2">
            © 2026 Vu Nguyen · George Mason University
          </p>

          <div aria-hidden>
            <SectionFinalRule />
          </div>
        </ThreeColumnBody>
        <SectionBottomBorder2 />
      </footer>

      <SectionDiagonalGap />
      <CompactBlankSpacerSection className="bg-white dark:bg-black" />
      <SectionDiagonalGap />
      <EmptySpacerSection className="bg-white dark:bg-black" />
    </div>
  );
}
