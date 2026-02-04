# Blog 内容说明

## Frontmatter 标准

`content/blog/` 下的每篇 `.mdx` 文件需在开头包含 YAML frontmatter，字段约定如下：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 是 | 文章标题 |
| `date` | ISO 日期 | 是 | 发布日期，如 `2024-12-05` 或 `2023-10-10 11:59:00-0400` |
| `description` | string | 是 | 简短描述，用于列表与 SEO |
| `tags` | string[] | 是 | 标签数组，如 `["ssh", "tutorial"]` |
| `published` | boolean | 否 | 是否公开，默认 `true` |
| `categories` | string[] | 否 | 分类数组，如 `["西电相关", "项目"]`，默认 `[]` |
| `giscus_comments` | boolean | 否 | 是否开启 Giscus 评论，默认 `true` |
| `toc` | boolean | 否 | 是否显示正文左侧目录，默认 `true` |

### 示例

```yaml
---
title: "文章标题"
date: "2024-12-05"
description: "一句话描述"
tags: ["tag1", "tag2"]
published: true
categories: ["分类A", "分类B"]
giscus_comments: true
toc: true
---
```
