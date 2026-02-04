"use client";
import Image from "next/image";
import { CometCard } from "@/components/ui/comet-card";
import { RetroGrid } from "@/components/ui/retro-grid";
import { SiteNavbar } from "@/components/site-navbar";

export default function Home() {
  return (
    <div className="relative w-full">
      <SiteNavbar />
      <MainContent />
    </div>
  );
}

const MainContent = () => {
  return (
    <>
      <div className="bg-background relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
        <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-emerald-400 via-green-500 to-green-700 bg-clip-text text-center text-7xl font-bold leading-none tracking-tighter text-transparent dark:from-yellow-300 dark:via-green-500 dark:to-green-700">
          Neuromancer
        </span>
        <RetroGrid />
      </div>

      <div className="container mx-auto p-8">
        <main className="flex flex-col items-center justify-center gap-12">
          {/* 个人介绍卡片 */}
          <CometCard rotateDepth={20} translateDepth={25} className="w-80">
            <div
              className="relative flex flex-col rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 shadow-2xl"
              style={{
                aspectRatio: "3/4",
                transformStyle: "preserve-3d",
              }}
            >
              {/* 背景装饰 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-green-600/10 dark:from-yellow-300/10 dark:to-green-500/10" />

              {/* README 标题 */}
              <div className="absolute top-4 left-4 z-20">
                <span className="font-mono text-xs font-semibold tracking-wider text-green-400 bg-black/30 px-2 py-1 rounded backdrop-blur-sm border border-green-500/20 dark:text-green-400 dark:border-green-500/20">
                  README
                </span>
              </div>

              {/* 内容区域 */}
              <div className="relative z-10 flex h-full flex-col items-center justify-between">
                {/* 头像区域 */}
                <div className="mt-6 flex flex-col items-center gap-4">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 bg-gradient-to-br from-emerald-400 to-green-600 dark:from-yellow-300 dark:to-green-500 shadow-xl">
                    <Image
                      fill
                      src="/images/avatar.webp"
                      alt="头像"
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Neuromancer</h2>
                </div>

                {/* 简介区域 */}
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm font-medium text-green-300 dark:text-green-300">
                    全栈开发者 | 学生
                  </p>
                  <p className="px-4 text-sm leading-relaxed text-gray-300">
                    热爱编程和设计，专注于创造美好的用户体验。
                    喜欢探索新技术，分享知识。
                  </p>
                </div>

                {/* 底部标签 */}
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 dark:bg-yellow-500/20 dark:text-yellow-200">
                    React
                  </span>
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-200 dark:bg-green-500/20 dark:text-green-200">
                    Next.js
                  </span>
                  <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal-200 dark:bg-lime-500/20 dark:text-lime-200">
                    TypeScript
                  </span>
                </div>
              </div>

              {/* 底部装饰线 */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-green-700 dark:from-yellow-300 dark:via-green-500 dark:to-green-700 rounded-b-2xl" />
            </div>
          </CometCard>

          {/* 提示文字 */}
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-20">
            向下滚动查看导航栏变化
          </p>
        </main>

        {/* 额外内容 - 让页面可以滚动 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mt-20">
          {[
            {
              id: 1,
              title: "向上滚动",
              width: "md:col-span-2",
              height: "h-60",
            },
            {
              id: 2,
              title: "查看导航栏",
              width: "md:col-span-2",
              height: "h-60",
            },
            {
              id: 3,
              title: "缩小效果",
              width: "md:col-span-4",
              height: "h-60",
            },
          ].map((box) => (
            <div
              key={box.id}
              className={`${box.width} ${box.height} bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-lg p-4 shadow-sm`}
            >
              <h2 className="text-xl font-medium text-neutral-800 dark:text-neutral-100">
                {box.title}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
