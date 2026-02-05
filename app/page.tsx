"use client";

import confetti from "canvas-confetti";
import Image from "next/image";
import { useRef } from "react";
import { SiteNavbar } from "@/components/site-navbar";

const BIO_FIRST_LINE = "动物界｜脊索动物门｜哺乳纲｜灵长目｜人科｜人属｜智人";

const BIO_PARAGRAPHS = [
  "学生党，励志成为全栈开发者，喜欢编程与游戏。",
  "探索新技术，分享知识。",
];

const TECH_TAGS = [
  "FastAPI",
  "SpringBoot",
  "Next.js",
  "LLM",
  "Linux",
  "Docker",
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
  const avatarRef = useRef<HTMLButtonElement>(null);

  const handleAvatarClick = () => {
    const el = avatarRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    const origin = { x, y };
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
      origin,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });
      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <button
          ref={avatarRef}
          type="button"
          onClick={handleAvatarClick}
          className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          aria-label="Trigger confetti"
        >
          <Image
            src="/images/avatar.webp"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </button>

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
