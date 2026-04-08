"use client"

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { posts } from '#velite'
import { compareDesc, format } from 'date-fns'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { TextureOverlay } from '@/components/ui/texture-overlay'
import { WobbleCard } from '@/components/ui/wobble-card'

const PER_PAGE = 10

function BlogPageContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category') ?? ''
  const pageParam = searchParams.get('page') ?? '1'
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1)
  const sortedPosts = useMemo(
    () =>
      [...posts]
        .filter(post => post.published)
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return compareDesc(new Date(a.date), new Date(b.date))
        }),
    []
  )
  const allCategories = useMemo(() => {
    const set = new Set<string>()
    sortedPosts.forEach(p => (p.categories ?? []).forEach(c => set.add(c)))
    return Array.from(set).sort()
  }, [sortedPosts])
  const filteredPosts = useMemo(() => {
    let list = sortedPosts
    if (categoryParam) list = list.filter(p => (p.categories ?? []).includes(categoryParam))
    return list
  }, [sortedPosts, categoryParam])
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PER_PAGE))
  const page = Math.min(currentPage, totalPages)
  const postsToShow = useMemo(
    () => filteredPosts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filteredPosts, page]
  )

  function buildFilterHref(updates: { category?: string | null }) {
    const p = new URLSearchParams(searchParams.toString())
    if ('category' in updates) {
      if (updates.category) p.set('category', updates.category)
      else p.delete('category')
    }
    p.delete('page')
    const s = p.toString()
    return s ? `/blog?${s}` : '/blog'
  }

  function buildPageHref(pageNum: number) {
    const p = new URLSearchParams(searchParams.toString())
    if (pageNum <= 1) p.delete('page')
    else p.set('page', String(pageNum))
    const s = p.toString()
    return s ? `/blog?${s}` : '/blog'
  }

  function getPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const result: (number | 'ellipsis')[] = []
    result.push(1)
    if (page > 3) result.push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (!result.includes(i)) result.push(i)
    }
    if (page < totalPages - 2) result.push('ellipsis')
    if (totalPages > 1) result.push(totalPages)
    return result.filter((v, i, a) => v !== 'ellipsis' || a[i - 1] !== 'ellipsis')
  }

  return (
    <div className="relative">
      <div className="relative min-h-[40vh] bg-white dark:bg-neutral-950">
        {/* Posts Grid - 仅此区域有 grid 纹理 */}
        <TextureOverlay texture="grid" opacityLight={0.12} opacityDark={0.3} className="z-0 pointer-events-none" />
        <div className="relative z-10 container mx-auto max-w-6xl px-6 pt-12 pb-16">
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Blog
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Thoughts on technology, programming, and everything in between.
            </p>
          </div>
          {/* Category filters（搜索请用顶部 dock 右侧「搜索」或 ⌘K） */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            {allCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">分类:</span>
                {allCategories.map(cat => (
                  <Link
                    key={cat}
                    href={buildFilterHref({ category: categoryParam === cat ? null : cat })}
                    className={`rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                      categoryParam === cat
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        {postsToShow.length ? (
          <div className="flex flex-col gap-4">
            {postsToShow.map(post => (
              <article key={post.slug} className="group relative w-full">
                <WobbleCard
                  containerClassName="border border-neutral-200/80 bg-neutral-50/80 dark:border-neutral-800/80 dark:bg-neutral-950/90 hover:border-neutral-300 hover:shadow-md hover:shadow-neutral-900/10 dark:hover:border-neutral-700 dark:hover:shadow-black/10"
                  className="relative px-6 py-4 sm:px-6"
                >
                  <Link href={post.permalink} className="block">
                    {/* Tags & Categories 仅展示 */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {post.pinned ? (
                        <span
                          className="inline-flex items-center rounded-full bg-amber-100/90 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          aria-label="Pinned post"
                          title="Pinned post"
                        >
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M15 3l6 6" />
                            <path d="M9 7l8 8" />
                            <path d="M6 10l8 8" />
                            <path d="M11 5l8 8" />
                            <path d="M8 14l-5 7 7-5" />
                          </svg>
                        </span>
                      ) : null}
                      {post.tags?.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="rounded-full bg-neutral-200/80 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {post.categories?.slice(0, 2).map(cat => (
                        <span
                          key={cat}
                          className="rounded-full bg-neutral-200/60 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    {/* Title - 悬停时主题色高亮，区分深浅模式 */}
                    <h2 className="mb-2 text-xl font-bold text-neutral-900 transition-colors group-hover:text-green-600 dark:text-neutral-100 dark:group-hover:text-green-400">
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {post.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <time className="text-xs text-neutral-500 dark:text-neutral-500">
                        {format(new Date(post.date), 'MMMM d, yyyy')}
                      </time>
                      <span className="flex items-center gap-1 text-xs font-medium text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-400">
                        Read more
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </WobbleCard>
              </article>
            ))}
          </div>
        ) : null}
        {filteredPosts.length > 0 && (
          <Pagination className="mt-10" aria-label="分页">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(page - 1)}
                  aria-label="上一页"
                  className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
              {getPageNumbers().map((n, i) =>
                n === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={n}>
                    <PaginationLink href={buildPageHref(n)} isActive={n === page} aria-label={`第 ${n} 页`}>
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(page + 1)}
                  aria-label="下一页"
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        {filteredPosts.length === 0 && (
          sortedPosts.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                该筛选下暂无文章
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                试试其他分类。
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                No posts yet
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Check back soon for new content!
              </p>
            </div>
          )
        )}
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-[40vh] bg-white dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">加载中…</p>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}
