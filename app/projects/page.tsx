"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SiteNavbar } from "@/components/site-navbar";
import { ShiftCard } from "@/components/ui/shift-card";
import { TextureOverlay } from "@/components/ui/texture-overlay";

type Project = {
  id: string;
  title: string;
  /** 折叠时 content 第一行展示的文案，不填则用 title */
  preview?: string;
  description: string;
  techStack?: string;
  image: string;
  href: string;
};

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "This Website",
    preview: "Next.js 个人网站项目",
    description: "此站点主要用Next.js框架搭建，用Velite渲染mdx文章，ui组件来自各种开源网站，部署到Github Pages，并利用Cloudflare全球CDN加速。",
    techStack: "Next.js, Velite, Cloudflare",
    image: "/images/avatar.webp",
    href: "https://github.com/Iamnotphage/iamnotphage.github.io",
  },
  {
    id: "2",
    title: "CosyVoice vLLM",
    preview: "CosyVoice vLLM服务端",
    description: "基于社区优化vllm的版本，构建FastAPI服务端，支持零样本语音克隆、跨语种语音克隆、自然语言指令控制等多种语音合成模式，消费级GPU首包延迟500ms。",
    techStack: "FastAPI, vLLM, Python",
    image: "/images/projects/project2.png",
    href: "https://github.com/Iamnotphage/CosyVoice-vllm",
  },
  {
    id: "3",
    title: "MortarAid4PUBG",
    preview: "PUBG迫击炮辅助测距工具",
    description: "(玩具项目)PUBG迫击炮测距工具(含仰角高程修正)",
    techStack: "Python",
    image: "/images/projects/project3.png",
    href: "https://github.com/Iamnotphage/MortarAid4PUBG",
  },
];

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen w-full">
      <SiteNavbar />
      <div className="relative min-h-screen bg-white dark:bg-neutral-950">
        <TextureOverlay
          texture="grid"
          opacityLight={0.12}
          opacityDark={0.3}
          className="z-0 pointer-events-none"
        />
        <main className="relative z-10 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Projects
            </h1>
            <p className="mb-12 text-neutral-600 dark:text-neutral-400">
              Things I built or tinkered with.
            </p>

            <div className="flex flex-wrap justify-center gap-8">
              {PROJECTS.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const layoutId = `project-img-${project.id}`;

  const topContent = (
    <div className="rounded-md bg-neutral-200/90 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(255,255,255,0.03)_inset,0_0_0_1px_rgba(0,0,0,0.1),0_2px_2px_0_rgba(0,0,0,0.1),0_4px_4px_0_rgba(0,0,0,0.1),0_8px_8px_0_rgba(0,0,0,0.1)]">
      <h3 className="text-lg font-semibold p-4 flex items-center gap-2">
        {project.title}
      </h3>
    </div>
  );

  const topAnimateContent = (
    <motion.img
      src={project.image}
      alt=""
      layoutId={layoutId}
      width={78}
      height={100}
      transition={{ duration: 0.3, ease: "circIn" }}
      className="rounded-sm object-cover absolute top-1.5 right-2 shadow-lg"
    />
  );

  const middleContent = (
    <motion.img
      src={project.image}
      alt={project.title}
      layoutId={layoutId}
      width={150}
      height={200}
      transition={{ duration: 0.3, ease: "circIn" }}
      className="rounded-sm object-cover"
    />
  );

  const bottomContent = (
    <div className="h-full min-h-0 flex flex-col overflow-hidden rounded-t-lg bg-neutral-100 dark:bg-neutral-800/90 border-t border-neutral-200 dark:border-neutral-700">
      {/* 折叠时只露出一行：优先用 preview，否则用 title */}
      <p className="font-sans text-sm font-semibold text-neutral-800 dark:text-neutral-200 pt-2.5 px-4 truncate shrink-0">
        {project.preview ?? project.title}
      </p>
      {/* 悬停展开后：描述占剩余空间，技术栈+链接贴底 */}
      <p className="font-sans text-sm font-medium text-neutral-700 dark:text-neutral-300 pt-1 px-4 flex-1 min-h-0 overflow-auto whitespace-normal">
        {project.description}
      </p>
      <div className="shrink-0 mt-auto px-4 pb-3 pt-1 flex flex-col gap-2">
        {project.techStack && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.split(",").map((tech) => (
              <span
                key={tech.trim()}
                className="inline-flex items-center rounded-md border border-neutral-300 dark:border-neutral-600 bg-neutral-200/80 dark:bg-neutral-700/80 px-2 py-0.5 font-sans text-xs text-neutral-700 dark:text-neutral-300"
              >
                {tech.trim()}
              </span>
            ))}
          </div>
        )}
        <Link
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          View project
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <ShiftCard
      className="bg-card dark:bg-[#1A1A1A]"
      topContent={topContent}
      topAnimateContent={topAnimateContent}
      middleContent={middleContent}
      bottomContent={bottomContent}
    />
  );
}
