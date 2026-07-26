"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { useTheme } from "@/components/theme-provider";
import { buttonVariants } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { TextureOverlay } from "@/components/ui/texture-overlay";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  /** 卡片副标题，不填则使用 title */
  preview?: string;
  description: string;
  techStack?: string;
  image: string;
  href: string;
};

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "myDBMS",
    preview: "精简SQL编译器实现",
    description: "西电编译原理大作业:精简SQL编译器实现",
    techStack: "C, C++, Lex, Yacc",
    image: "/images/projects/project5.png",
    href: "https://github.com/Iamnotphage/myDBMS",
  },
  {
    id: "2",
    title: "MortarAid4PUBG",
    preview: "PUBG迫击炮辅助测距工具",
    description: "(玩具项目)PUBG迫击炮测距工具(含仰角高程修正)",
    techStack: "Python",
    image: "/images/projects/project4.png",
    href: "https://github.com/Iamnotphage/MortarAid4PUBG",
  },
  {
    id: "3",
    title: "seekdb-2025",
    preview: "第五届OceanBase数据库大赛",
    description:
      "第五届OceanBase数据库大赛全国第15名。在seekdb社区版基础上，优化带标量的全文索引检索的性能。设计并实现多模态RAG应用：支持图文混排PDF知识库的解析、多模态检索与图文关联推理，并在查询回答中提供精确可溯源的引用。",
    techStack: "RAG, C++, OceanBase, seekdb",
    image: "/images/projects/project3.png",
    href: "https://github.com/Iamnotphage/seekdb-2025",
  },
  {
    id: "4",
    title: "CosyVoice vLLM",
    preview: "CosyVoice vLLM服务端",
    description: "基于社区优化vllm的版本，构建FastAPI服务端，支持零样本语音克隆、跨语种语音克隆、自然语言指令控制等多种语音合成模式，消费级GPU首包延迟500ms。",
    techStack: "FastAPI, vLLM, Python",
    image: "/images/projects/project2.png",
    href: "https://github.com/Iamnotphage/CosyVoice-vllm",
  },
  {
    id: "5",
    title: "This Website",
    preview: "Next.js 个人网站项目",
    description: "此站点主要用Next.js框架搭建，用Velite渲染mdx文章，ui组件来自各种开源网站，部署到Github Pages，并利用Cloudflare全球CDN加速。",
    techStack: "Next.js, Velite, Cloudflare",
    image: "/images/avatar.webp",
    href: "https://github.com/Iamnotphage/iamnotphage.github.io",
  },
  {
    id: "6",
    title: "MT-Agent",
    preview: "Coding Agent for MT-3000",
    description: "LangGraph搭建ReAct循环，仿照Gemini-CLI的Coding Agent",
    techStack: "LangGraph, Python, REPL",
    image: "/images/projects/project6.png",
    href: "https://github.com/Iamnotphage/MT-Agent",
  },
  {
    id: "7",
    title: "GraspNet-NPU",
    preview: "GraspNet在晟腾NPU上适配调优",
    description: "在graspnet-baseline基础上，在 Atlas 300V Pro (Ascend 310P3) 上全链路优化的 GraspNet 推理，推理延迟平均67.9ms，test_novel数据集AP 16.73%",
    techStack: "Python, PyTorch, NPU",
    image: "https://avatars.githubusercontent.com/u/66550349?s=200&v=4",
    href: "https://github.com/Iamnotphage/GraspNet-NPU",
  }
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...PROJECTS]
                .sort((a, b) => Number(b.id) - Number(a.id))
                .map((project) => (
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <article className="h-full min-w-0 rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-lg focus-within:shadow-lg">
      <MagicCard
        mode="orb"
        gradientFrom={isDark ? "#22c55e" : "#4ade80"}
        gradientTo={isDark ? "#14b8a6" : "#2dd4bf"}
        glowFrom={isDark ? "#22c55e" : "#86efac"}
        glowTo={isDark ? "#14b8a6" : "#5eead4"}
        glowOpacity={isDark ? 0.45 : 0.7}
        className="h-full p-0"
      >
        <div className="flex h-full min-h-[360px] flex-col">
          <header className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-foreground">
                  {project.title}
                </h2>
                <p className="mt-1 truncate text-sm font-medium text-neutral-600 dark:text-neutral-200">
                  {project.preview ?? project.title}
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col p-4">
            <p className="text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {project.description}
            </p>

            {project.techStack && (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-6" aria-label="Tech stack">
                {project.techStack.split(",").map((tech) => (
                  <span
                    key={tech.trim()}
                    className="inline-flex items-center rounded-md border border-neutral-300 bg-white/70 px-2 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <footer className="border-t border-border p-4">
            <Link
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 w-full cursor-pointer gap-2 bg-neutral-900 text-white [a]:hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:[a]:hover:bg-neutral-200"
              )}
            >
              <Github aria-hidden="true" className="size-4" />
              View on GitHub
              <ExternalLink aria-hidden="true" className="size-3.5 opacity-70" />
            </Link>
          </footer>
        </div>
      </MagicCard>
    </article>
  );
}
