# The World 页面图片存放说明

Next.js 项目中对**静态图片**的推荐做法：

- **位置**：放在 `public` 目录下，通过**根路径**引用。
- **本页约定**：
  - `physical/` — 现实世界照片（风景、城市、生活等）
  - `digital/` — 游戏 / 数字世界相关图片
- **引用方式**：`src="/images/the-world/physical/1.jpg"`（无需写 `public`）。
- **可选**：使用 `next/image` 的 `Image` 组件引用同一路径，可获得优化与懒加载。

示例目录结构：

```
public/
  images/
    the-world/
      physical/
        1.jpg
        2.jpg
        ...
      digital/
        1.jpg
        2.jpg
        ...
```

若对应路径下暂无图片，页面会使用占位图显示。
