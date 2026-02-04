'use client'

import dynamic from 'next/dynamic'
import { useTheme } from '@/components/theme-provider'

const Giscus = dynamic(() => import('@giscus/react'), { ssr: false })

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? ''
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? ''
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? 'Announcements'
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? ''

const enabled = !!(repo && repoId && categoryId)

export function GiscusComments({ show = true }: { show?: boolean }) {
  const { theme } = useTheme()
  if (!show || !enabled) return null
  return (
    <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800" aria-label="评论">
      <Giscus
        repo={repo as `${string}/${string}`}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </section>
  )
}
