"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MaskedSvgIcon = ({
  src,
  className,
  title,
}: {
  src: string;
  className?: string;
  title?: string;
}) => (
  <span
    aria-hidden={title ? undefined : "true"}
    title={title}
    className={cn("bg-black dark:bg-white", className)}
    style={{
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const navLinks = [
  { label: "README", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "Favorites", href: "/favorites" },
  { label: "「The World」", href: "/the-world" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Iamnotphage", icon: "/icons/Github-Icons.svg" },
  { label: "X", href: "https://x.com/iamnotphage", icon: "/icons/X-Icons.svg" },
  { label: "Instagram", href: "https://www.instagram.com/iamn0tphage/", icon: "/icons/Instagram-Icons.svg" },
  { label: "Red Note", href: "https://xhslink.com/m/3pQXApovmMO", icon: "/icons/Xiaohongshu-Icons.svg" },
  { label: "Steam", href: "https://steamcommunity.com/profiles/76561198803581331/", icon: "/icons/Steam-Icons.svg" },
];

export function FooterLinks() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/icons/dock-icon.webp"
                alt=""
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Neuromancer
              </span>
            </Link>
            <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                Build with Next.js and Velite <br/>
                Depolyed on Github Pages
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Navigation
              </h3>
              <ul className="space-y-2">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Interlinked
              </h3>
              <ul className="flex flex-wrap gap-3">
                {socialLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                      aria-label={item.label}
                    >
                      <MaskedSvgIcon src={item.icon} className="h-5 w-5" title={item.label} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-neutral-200 pt-8 dark:border-neutral-800 sm:flex-row">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © 2026 neuromancer.club
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            All rights reserved
            <a
              href="https://github.com/Iamnotphage/iamnotphage.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="Source"
            >
              <MaskedSvgIcon
                src="/icons/Source-Icons.svg"
                className="h-[1em] w-[1em]"
                title="Source"
              />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
