"use client";

import Image from "next/image";
import { SiteNavbar } from "@/components/site-navbar";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { TextureOverlay } from "@/components/ui/texture-overlay";

/**
 * 图片存放说明（Next.js 推荐）：
 * - 静态图片放在 public 目录下，通过根路径引用。
 * - 建议：public/images/the-world/physical/ 放现实世界照片，
 *         public/images/the-world/digital/ 放游戏/数字世界照片。
 * - 引用方式：src="/images/the-world/physical/1.jpg"
 * - 若使用 Next.js Image 组件，可放同一路径，获得优化与懒加载。
 */

const PHYSICAL_ITEMS = [
  {
    title: "Chongqing",
    image: "/images/the-world/physical/chongqing.webp",
    className: "absolute top-[8%] left-[5%] rotate-[-10deg]",
  },
  {
    title: "Kyoto",
    image: "/images/the-world/physical/kyoto.webp",
    className: "absolute top-[35%] left-[28%] rotate-[6deg]",
  },
  {
    title: "My Desktop",
    image: "/images/the-world/physical/desktop.webp",
    className: "absolute top-[5%] right-[22%] rotate-[9deg]",
  },
  {
    title: "Hangzhou",
    image: "/images/the-world/physical/hangzhou.webp",
    className: "absolute top-[38%] right-[4%] rotate-[-7deg]",
  },
];

const DIGITAL_ITEMS = [
  {
    title: "Counter Strike",
    image: "/images/the-world/digital/cs.webp",
    className: "absolute top-[35%] left-[8%] rotate-[-9deg] w-[26rem] h-[23rem] min-h-0 flex flex-col",
    landscape: true,
  },
  {
    title: "Overwatch",
    image: "/images/the-world/digital/overwatch.webp",
    className: "absolute top-[8%] left-[15%] rotate-[8deg]",
    landscape: false,
  },
  {
    title: "Game 3",
    image: "/images/the-world/digital/3.jpg",
    className: "absolute top-[5%] right-[12%] rotate-[-6deg]",
    landscape: false,
  },
  {
    title: "Game 4",
    image: "/images/the-world/digital/4.jpg",
    className: "absolute top-[42%] right-[22%] rotate-[11deg]",
    landscape: false,
  },
];

export default function TheWorldPage() {
  return (
    <div className="relative min-h-screen w-full">
      <SiteNavbar />
      {/* 背景：与 blog 一致的网格纹理 */}
      <div className="relative min-h-screen bg-white dark:bg-neutral-950">
        <TextureOverlay texture="grid" opacityLight={0.12} opacityDark={0.3} className="z-0 pointer-events-none" />
        <main className="relative z-10 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              The World
            </h1>
            <p className="mb-12 text-neutral-600 dark:text-neutral-400">
              Time stops. Only this page remains.
            </p>

            <section className="mb-12 overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-50/90 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/90">
              <div className="px-6 pt-8 pb-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Physical World
                </h2>
              </div>
              <DraggableCardContainer className="relative flex min-h-[90vh] w-full items-start justify-center overflow-clip px-4 pb-8">
                {PHYSICAL_ITEMS.map((item) => (
                  <DraggableCardBody key={item.title} className={item.className}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={320}
                      height={320}
                      className="pointer-events-none relative z-10 h-80 w-80 object-cover"
                      unoptimized
                    />
                    <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                      {item.title}
                    </h3>
                  </DraggableCardBody>
                ))}
              </DraggableCardContainer>
            </section>

            <section className="mb-12 overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-50/90 shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/90">
              <div className="px-6 pt-8 pb-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Digital World
                </h2>
              </div>
              <DraggableCardContainer className="relative flex min-h-[90vh] w-full items-start justify-center overflow-clip px-4 pb-8">
                {DIGITAL_ITEMS.map((item) => (
                  <DraggableCardBody key={item.title} className={item.className}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={item.landscape ? 416 : 320}
                      height={item.landscape ? 312 : 320}
                      className={
                        item.landscape
                          ? "pointer-events-none relative z-10 w-full flex-shrink-0 object-cover"
                          : "pointer-events-none relative z-10 h-80 w-80 object-cover"
                      }
                      unoptimized
                      style={item.landscape ? { aspectRatio: "4/3" } : undefined}
                    />
                    <h3 className={item.landscape ? "mt-4 flex-shrink-0 text-center text-xl font-bold text-neutral-700 dark:text-neutral-300" : "mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300"}>
                      {item.title}
                    </h3>
                  </DraggableCardBody>
                ))}
              </DraggableCardContainer>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
