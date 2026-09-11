import Image from "next/image";
import { GitHubActivity } from "@/components/github-activity";

type ResumeEntry = {
  name: string;
  description: string;
  logo: string;
  logoSize: number;
  start: { dateTime: string; label: string };
  end?: { dateTime: string; label: string };
};

const WORK_EXPERIENCE: ResumeEntry[] = [
  {
    name: "ByteDance",
    description: "Intern",
    logo: "/icons/organizations/bytedance.svg",
    logoSize: 28,
    start: { dateTime: "2026-07", label: "Jul 2026" },
  },
  {
    name: "Huawei",
    description: "Software Engineer Intern",
    logo: "/icons/organizations/huawei.svg",
    logoSize: 28,
    start: { dateTime: "2024-07", label: "Jul 2024" },
    end: { dateTime: "2024-09", label: "Sep 2024" },
  },
];

const EDUCATION: ResumeEntry[] = [
  {
    name: "Xi’an Jiaotong University",
    description: "Master of Engineering in Software Engineering",
    logo: "/icons/organizations/xjtu.webp",
    logoSize: 36,
    start: { dateTime: "2025-09", label: "Sep 2025" },
  },
  {
    name: "Xidian University",
    description: "Bachelor’s Degree in Computer Science",
    logo: "/icons/organizations/xidian.webp",
    logoSize: 36,
    start: { dateTime: "2021-09", label: "Sep 2021" },
    end: { dateTime: "2025-06", label: "Jun 2025" },
  },
];

const TECH_STACK: {
  name: string;
  icon: string;
  darkIcon?: string;
  iconSize?: number;
}[] = [
  // Languages
  { name: "Java", icon: "/icons/tech/java.svg" },
  { name: "Python", icon: "/icons/tech/python.svg" },
  { name: "Go", icon: "/icons/tech/go.svg" },
  { name: "C", icon: "/icons/tech/c.svg" },
  // Backend and database
  { name: "Spring Boot", icon: "/icons/tech/spring-boot.svg" },
  { name: "FastAPI", icon: "/icons/tech/fastapi.svg" },
  {
    name: "MySQL",
    icon: "/icons/tech/mysql-light.svg",
    darkIcon: "/icons/tech/mysql-dark.svg",
    iconSize: 18,
  },
  // Frontend
  { name: "React", icon: "/icons/tech/react.svg" },
  { name: "Next.js", icon: "/icons/tech/nextdotjs.svg" },
  // Development and deployment
  { name: "Git", icon: "/icons/tech/git.svg" },
  { name: "Linux", icon: "/icons/tech/linux.svg" },
  { name: "Docker", icon: "/icons/tech/docker.svg" },
  { name: "Kubernetes", icon: "/icons/tech/kubernetes.svg" },
];

function ResumeSection({
  id,
  title,
  entries,
  showLogoBackground = false,
  monochromeLogos = false,
}: {
  id: string;
  title: string;
  entries: ResumeEntry[];
  showLogoBackground?: boolean;
  monochromeLogos?: boolean;
}) {
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
      >
        {title}
      </h2>
      <ol className="mt-5 space-y-5">
        {entries.map((entry) => (
          <li
            key={entry.name}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]"
          >
            <div
              aria-hidden="true"
              className={`row-span-2 flex size-11 items-center justify-center sm:row-span-1 ${
                showLogoBackground
                  ? "rounded-full bg-white ring-1 ring-neutral-200/80 dark:ring-white/15"
                  : ""
              }`}
            >
              <Image
                src={entry.logo}
                alt=""
                width={entry.logoSize}
                height={entry.logoSize}
                className={`object-contain ${monochromeLogos ? "brightness-0 dark:invert" : ""}`}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-6 text-neutral-900 dark:text-neutral-100">
                {entry.name}
              </h3>
              <p className="mt-0.5 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                {entry.description}
              </p>
            </div>
            <p className="col-start-2 whitespace-nowrap text-xs leading-6 tabular-nums text-neutral-500 dark:text-neutral-400 sm:col-start-3 sm:self-start sm:text-right">
              <time dateTime={entry.start.dateTime}>{entry.start.label}</time>
              <span> – </span>
              {entry.end ? (
                <time dateTime={entry.end.dateTime}>{entry.end.label}</time>
              ) : (
                <span>Present</span>
              )}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ResumeSections() {
  return (
    <div className="mt-12 w-full max-w-xl space-y-8 text-left">
      <GitHubActivity />
      <ResumeSection
        id="work-experience"
        title="Work Experience"
        entries={WORK_EXPERIENCE}
      />
      <ResumeSection
        id="education"
        title="Education"
        entries={EDUCATION}
        showLogoBackground
      />
      <section aria-labelledby="tech-stack">
        <h2
          id="tech-stack"
          className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Tech Stack
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <li
              key={tech.name}
              className="inline-flex h-9 cursor-default items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 text-sm font-medium text-neutral-700 transition duration-200 ease-out hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <Image
                src={tech.icon}
                alt=""
                width={tech.iconSize ?? 16}
                height={tech.iconSize ?? 16}
                className={`shrink-0 object-contain brightness-0 ${tech.darkIcon ? "dark:hidden" : "dark:invert"}`}
              />
              {tech.darkIcon && (
                <Image
                  src={tech.darkIcon}
                  alt=""
                  width={tech.iconSize ?? 16}
                  height={tech.iconSize ?? 16}
                  className="hidden shrink-0 object-contain dark:block"
                />
              )}
              <span>{tech.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
