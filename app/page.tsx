"use client";

import Image from "next/image";
import { SiteNavbar } from "@/components/site-navbar";

const BIO_FIRST_LINE = "动物界｜脊索动物门｜哺乳纲｜灵长目｜人科｜人属｜智人";

const BIO_PARAGRAPHS = [
  "全栈开发者，喜欢编程与设计。",
  "探索新技术，分享知识。",
];

const TECH_TAGS = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
];

export default function Home() {
  return (
    <div className="relative w-full">
      <SiteNavbar />
      <MainContent />
    </div>
  );
}

function MainContent() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* 圆形头像 */}
        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700">
          <Image
            src="/images/avatar.webp"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* 名字 */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Neuromancer
        </h1>

        {/* 简介：第一行 */}
        <p className="mt-6 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {BIO_FIRST_LINE}
        </p>

        {/* 简介：下面几句 */}
        <div className="mt-4 space-y-2">
          {BIO_PARAGRAPHS.map((line, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
            >
              {line}
            </p>
          ))}
        </div>

        {/* 技术栈 tag */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {TECH_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
