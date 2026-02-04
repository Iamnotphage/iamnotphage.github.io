import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGemoji from 'remark-gemoji'
import { visit } from 'unist-util-visit'
import type { Root } from 'hast'
import type { Root as MdastRoot } from 'mdast'

/** 两个及以上连续空行时插入可见间距：在 mdast 中插入一个会渲染为 div 的占位节点 */
function remarkDoubleBlankSpacer() {
  return (tree: MdastRoot) => {
    const children = tree.children
    if (!Array.isArray(children) || children.length < 2) return
    const next: MdastRoot['children'] = []
    for (let i = 0; i < children.length; i++) {
      next.push(children[i])
      const curr = children[i]
      const prev = children[i + 1]
      if (!prev || !curr.position || !prev.position) continue
      const gap = prev.position.start.line - curr.position.end.line
      if (gap > 2) {
        next.push({
          type: 'paragraph',
          children: [],
          data: {
            hName: 'div',
            hProperties: { className: 'prose-double-blank-spacer my-4' },
          },
        } as MdastRoot['children'][0])
      }
    }
    tree.children = next
  }
}

/** 将 GitHub blob 图片链接转为 raw 直链，否则 <img> 会拿到 HTML 无法显示 */
function rehypeGitHubRawImages() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' || typeof node.properties?.src !== 'string') return
      const src = node.properties.src
      const m = src.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
      if (m) {
        const [, owner, repo, branch, path] = m
        node.properties.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      }
    })
  }
}

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      date: s.isodate(),
      description: s.string(),
      tags: s.array(s.string()),
      published: s.boolean().default(true),
      categories: s.array(s.string()).optional().default([]),
      giscus_comments: s.boolean().optional().default(true),
      toc: s.boolean().optional().default(true),
      slug: s.path().transform(p => p.split('/').pop()?.replace('.mdx', '') || ''),
      content: s.mdx(),
    })
    .transform(data => ({ ...data, permalink: `/blog/${data.slug}` })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      rehypeGitHubRawImages,
      [rehypePrettyCode, { theme: 'one-dark-pro' }],
      [
        rehypeKatex,
        {
          output: 'html',
          strict: false,
          minRuleThickness: 0.06,
        },
      ],
    ],
    remarkPlugins: [remarkGfm, remarkMath, remarkGemoji, remarkDoubleBlankSpacer],
  },
})