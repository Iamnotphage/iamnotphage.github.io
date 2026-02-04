import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts } from '#velite'
import { GiscusComments } from '@/components/giscus-comments'
import { MDXContent } from '@/components/mdx-content'
import { format } from 'date-fns'
import { TextureOverlay } from '@/components/ui/texture-overlay'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return posts
    .filter(post => post.published)
    .map(post => ({ slug: post.slug }))
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = posts.find(post => post.slug === slug)

  if (!post || !post.published) {
    notFound()
  }

  return (
    <div className="relative">
      {/* Hero Section - 无 grid 纹理，深色下封面干净 */}
      <div className="relative z-10 overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-green-950/20 dark:to-neutral-950">
        <div className="container mx-auto max-w-6xl px-6 py-4 lg:py-5">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-green-600 dark:text-neutral-400 dark:hover:text-green-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to blog
          </Link>

          {/* Tags & Categories */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags?.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
              >
                {tag}
              </span>
            ))}
            {post.categories?.map(cat => (
              <span
                key={cat}
                className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-4 bg-gradient-to-r from-emerald-500 via-green-500 to-green-700 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-yellow-300 dark:via-green-400 dark:to-green-600 lg:text-5xl">
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p className="mb-4 text-lg text-neutral-600 dark:text-neutral-400">
              {post.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500">
            <time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
          </div>
        </div>

        {/* Decorative gradient orb */}
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-600/20 blur-3xl dark:from-yellow-300/10 dark:to-green-500/10" />
      </div>

      {/* Content - 仅此区域有 grid 纹理；矩形阅读区与封面无缝衔接，最大宽度与 blog dock 一致 960px */}
      <div className="relative bg-white dark:bg-neutral-950">
        <TextureOverlay texture="grid" opacityLight={0.12} opacityDark={0.3} className="z-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-[960px] px-6">
          <article>
            {/* 矩形阅读区：与封面无缝衔接，左右下边框；内边距加大 */}
            <div className="border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b-2xl bg-white dark:bg-neutral-950 p-8">
                <div
                  data-article-body
                  className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-green-400 prose-li:my-1 prose-ul:my-4 prose-ol:my-4 prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-green-700 prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-neutral-800 dark:prose-code:text-green-400 prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-table:my-6 prose-th:bg-neutral-100 dark:prose-th:bg-neutral-800 prose-blockquote:border-l-green-500 dark:prose-blockquote:border-l-green-500 prose-blockquote:bg-emerald-50 dark:prose-blockquote:bg-neutral-900/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-hr:my-8"
                >
                  <MDXContent code={post.content} />
                </div>

                {post.giscus_comments !== false && (
                  <GiscusComments show />
                )}

                {/* Footer */}
                <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-green-100 hover:text-green-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to all posts
                  </Link>
                </div>
              </div>
          </article>
        </div>
      </div>
    </div>
  )
}
