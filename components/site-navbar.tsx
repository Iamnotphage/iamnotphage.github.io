"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { useBlogSearch } from "@/components/blog-search-context"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useTheWorldTransition } from "@/components/ui/the-world"

const navItems = [
  { name: "README", link: "/" },
  { name: "Projects", link: "/projects" },
  { name: "Blog", link: "/blog" },
  { name: "Favorites", link: "/favorites" },
  { name: "「The World」", link: "/the-world" },
]

const MaskedSvgIcon = ({
  src,
  className,
  title,
}: {
  src: string
  className?: string
  title?: string
}) => (
  <span
    aria-hidden={title ? undefined : "true"}
    title={title}
    className={`bg-black dark:bg-white ${className ?? ""}`}
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
)

const contactLinks = [
  {
    name: "GitHub",
    href: "https://github.com/Iamnotphage",
    icon: <MaskedSvgIcon src="/icons/github.svg" className="h-4 w-4" title="GitHub" />,
  },
  {
    name: "X",
    href: "https://x.com/iamnotphage",
    icon: <MaskedSvgIcon src="/icons/x.svg" className="h-4 w-4" title="X" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/iamn0tphage/",
    icon: <MaskedSvgIcon src="/icons/instagram.svg" className="h-4 w-4" title="Instagram" />,
  },
  {
    name: "Red Note",
    href: "https://xhslink.com/m/3pQXApovmMO",
    icon: <MaskedSvgIcon src="/icons/xiaohongshu.svg" className="h-4 w-4" title="Red Note" />,
  },
  {
    name: "Steam",
    href: "https://steamcommunity.com/profiles/76561198803581331/",
    icon: <MaskedSvgIcon src="/icons/steam.svg" className="h-4 w-4" title="Steam" />,
  },
]

/** 仅在 blog（含详情页）显示，dock 右侧搜索入口：一小矩形内先 ⌘K 再放大镜（无内框），点击或快捷键打开居中搜索框 */
function BlogSearchTrigger() {
  const pathname = usePathname()
  const blogSearch = useBlogSearch()
  if (!pathname?.startsWith("/blog") || !blogSearch) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        blogSearch.openSearch()
      }}
      className="relative z-10 flex shrink-0 items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
      aria-label="搜索文章 (⌘K)"
    >
      <span className="text-[11px] font-medium tabular-nums text-neutral-500 dark:text-neutral-400">⌘K</span>
      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  )
}

const NavbarLogo = () => (
  <Link
    href="/"
    className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
  >
    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-lg">
      <Image
        src="/icons/dock-icon.webp"
        alt="Neuromancer"
        fill
        className="object-cover"
        sizes="24px"
        priority
      />
    </div>
    <span className="font-bold text-black dark:text-white">Neuromancer</span>
  </Link>
)

export function SiteNavbar() {
  const pathname = usePathname()
  const isBlog = pathname?.startsWith("/blog")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false)
  const contactMenuRef = useRef<HTMLDivElement>(null)
  const runTheWorldTransition = useTheWorldTransition()

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contactMenuRef.current &&
        !contactMenuRef.current.contains(event.target as Node)
      ) {
        setIsContactMenuOpen(false)
      }
    }

    if (isContactMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isContactMenuOpen])

  // ESC 关闭下拉菜单
  useEffect(() => {
    if (!isContactMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsContactMenuOpen(false)
        contactMenuRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isContactMenuOpen])

  const menuVariants = {
    closed: {
      opacity: 0,
      y: 10,
      scale: 0.98,
      transition: { duration: 0.12, ease: "easeOut" },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 520,
        damping: 34,
        mass: 0.7,
        staggerChildren: 0.045,
        delayChildren: 0.02,
      },
    },
  } as const

  const itemVariants = {
    closed: { opacity: 0, x: 6 },
    open: { opacity: 1, x: 0, transition: { duration: 0.14 } },
  } as const

  return (
    <Navbar>
      {/* blog 页多一个搜索按钮，缩小状态时提高 minWidth 避免与前面元素重叠，各屏尺寸表现一致 */}
      <NavBody narrowMinWidth={isBlog ? "960px" : undefined}>
        <NavbarLogo />
        <NavItems
          items={navItems}
          onTheWorldClick={(e) => {
            const target = e.currentTarget
            if (target && "getBoundingClientRect" in target) {
              runTheWorldTransition((target as HTMLElement).getBoundingClientRect())
            }
          }}
        />
        {/* 使用 relative z-10 避免被 NavItems 的 absolute inset-0 遮挡，防止与「The World」重合且可点击 */}
        <div className="relative z-10 flex shrink-0 items-center gap-4">
          <BlogSearchTrigger />
          <ThemeToggle />
          {/* Contact 下拉菜单 */}
          <div className="relative" ref={contactMenuRef}>
            <NavbarButton
              variant="primary"
              as="button"
              onClick={() => setIsContactMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isContactMenuOpen}
              aria-controls="contact-menu"
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Contact
            </NavbarButton>

            {/* 下拉菜单 */}
            <AnimatePresence>
              {isContactMenuOpen && (
                <motion.div
                  id="contact-menu"
                  role="menu"
                  aria-label="Contact links"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={menuVariants}
                  className="absolute right-0 top-full mt-2 z-50 min-w-[12rem] origin-top-right rounded-xl border border-neutral-200/70 bg-white/85 p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-950/70"
                >
                  {/* 小尖角 */}
                  <div className="absolute -top-1 right-5 h-2 w-2 rotate-45 rounded-[2px] border border-neutral-200/70 bg-white/85 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-950/70" />

                  <motion.div
                    variants={{
                      open: { transition: { staggerChildren: 0.045 } },
                      closed: { transition: { staggerChildren: 0.02 } },
                    }}
                    className="flex flex-col gap-1"
                  >
                    {contactLinks.map((link, idx) => (
                      <motion.a
                        key={`contact-${idx}`}
                        role="menuitem"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        variants={itemVariants}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800/70"
                        onClick={() => setIsContactMenuOpen(false)}
                      >
                        <span className="flex h-5 w-5 items-center justify-center">
                          {link.icon}
                        </span>
                        <span className="whitespace-nowrap">{link.name}</span>
                        <span className="ml-auto text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-500">
                          ↗
                        </span>
                      </motion.a>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </a>
          ))}

          {/* 移动端联系方式列表 */}
          <div className="flex w-full flex-col gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2">
              联系方式
            </span>
            {contactLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex h-6 w-6 items-center justify-center">
                  {link.icon}
                </span>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
