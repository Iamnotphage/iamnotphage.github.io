'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type TocItem = { id: string; text: string; level: number }

const ARTICLE_SELECTOR = '[data-article-body]'

export function BlogTableOfContents() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const container = document.querySelector(ARTICLE_SELECTOR)
    if (!container) return

    const headings = container.querySelectorAll('h2, h3, h4')
    const list: TocItem[] = []
    headings.forEach((el) => {
      const id = el.id
      if (!id) return
      const text = el.textContent?.replace(/^#+\s*/, '')?.trim() ?? ''
      const level = parseInt(el.tagName.charAt(1), 10)
      list.push({ id, text, level })
    })
    queueMicrotask(() => setItems(list))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0% -80% 0%', threshold: 0 }
    )

    list.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden lg:block w-52 shrink-0 space-y-2 text-sm"
    >
      <div className="font-medium text-neutral-700 dark:text-neutral-300">目录</div>
      <ul className="space-y-1.5 border-l border-neutral-200 dark:border-neutral-700 pl-3">
        {items.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: (level - 2) * 10 }}
            className={cn(
              'border-l-2 -ml-px pl-2 transition-colors',
              activeId === id
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            <a href={`#${id}`} className="block py-0.5 leading-snug">
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
