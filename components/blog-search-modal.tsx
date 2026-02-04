'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { posts } from '#velite'
import { compareDesc } from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

function matchPost(post: (typeof posts)[0], q: string): boolean {
  if (!q.trim()) return true
  const lower = q.toLowerCase().trim()
  const str = [
    post.title,
    post.description ?? '',
    (post.tags ?? []).join(' '),
    (post.categories ?? []).join(' '),
  ]
    .join(' ')
    .toLowerCase()
  return str.includes(lower)
}

export function BlogSearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const sortedPosts = useMemo(
    () =>
      [...posts]
        .filter(p => p.published)
        .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date))),
    []
  )
  const results = useMemo(
    () => sortedPosts.filter(p => matchPost(p, query)),
    [sortedPosts, query]
  )

  const openSearch = useCallback(() => {
    setQuery('')
    setSelectedIndex(-1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    if (open) openSearch()
  }, [open, openSearch])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i < results.length - 1 ? i + 1 : i === -1 ? 0 : i))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i <= 0 ? -1 : i - 1))
        return
      }
      if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault()
        router.push(results[selectedIndex].permalink)
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, results, selectedIndex, router])

  // scroll selected into view（仅在有选中项时）
  useEffect(() => {
    if (selectedIndex < 0) return
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 pt-[15vh] px-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="搜索博客文章"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <svg className="h-5 w-5 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-neutral-900 focus:outline-none dark:text-neutral-100 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              autoComplete="off"
              aria-label="搜索输入"
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 rounded p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                aria-label="清空搜索"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
            <kbd className="hidden rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 sm:inline-block">
              ESC
            </kbd>
          </div>
          <div
            ref={listRef}
            className="max-h-[min(60vh,400px)] overflow-y-auto py-2"
          >
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {query.trim() ? '未找到匹配文章' : '输入关键词搜索'}
              </div>
            ) : (
              <ul className="space-y-0.5">
                {results.map((post, index) => (
                  <li key={post.slug} data-index={index}>
                    <Link
                      href={post.permalink}
                      onClick={onClose}
                      className={cn(
                        'flex flex-col gap-0.5 px-4 py-2.5 text-left transition-colors',
                        selectedIndex >= 0 && index === selectedIndex
                          ? 'bg-green-50 text-green-900 dark:bg-green-950/50 dark:text-green-100'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      )}
                    >
                      <span className="font-medium">{post.title}</span>
                      {post.description && (
                        <span className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {post.description}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
