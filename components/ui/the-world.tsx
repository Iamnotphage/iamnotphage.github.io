"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { flushSync } from "react-dom"

const THE_WORLD_PATH = "/the-world"
const DURATION_PHASE1 = 500
const DURATION_PHASE2 = 400
const EASING = "ease-in-out"

function getCenterAndRadius(rect: DOMRect) {
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const toLeft = x
  const toRight = window.innerWidth - x
  const toTop = y
  const toBottom = window.innerHeight - y
  const maxRadius = Math.hypot(Math.max(toLeft, toRight), Math.max(toTop, toBottom))
  return { x, y, maxRadius }
}

export function useTheWorldTransition() {
  const router = useRouter()
  const isAnimating = useRef(false)

  const runTheWorldTransition = useCallback(
    async (buttonRect: DOMRect) => {
      if (isAnimating.current) return
      
      if (typeof document === "undefined" || !document.startViewTransition) {
        router.push(THE_WORLD_PATH)
        return
      }

      isAnimating.current = true
      const { x, y, maxRadius } = getCenterAndRadius(buttonRect)

      // 1. 发起转场
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          router.push(THE_WORLD_PATH)
        })
      })

      await transition.ready

      // ==================================================================================
      // 步骤 A: 预先挂载 Phase 2 Overlay (无缝接力)
      // ==================================================================================
      // 既然 Phase 2 我们用的是 backdrop-filter（效果验证是好的），
      // 我们预先挂载它，Phase 1 结束瞬间它会接替 VT，保证效果一致。
      const phase2Style = document.createElement("style")
      phase2Style.id = "the-world-phase2-style"
      phase2Style.textContent = `
        .the-world-phase2-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          pointer-events: none;
          
          /* Phase 2: 同样使用反色滤镜 */
          clip-path: circle(${maxRadius}px at ${x}px ${y}px);
          backdrop-filter: invert(1) hue-rotate(180deg);
          -webkit-backdrop-filter: invert(1) hue-rotate(180deg);
          will-change: clip-path;
        }
      `
      document.head.appendChild(phase2Style)

      const overlay = document.createElement("div")
      overlay.className = "the-world-phase2-overlay"
      overlay.setAttribute("aria-hidden", "true")
      document.documentElement.appendChild(overlay)

      // ==================================================================================
      // 步骤 B: Phase 1 样式 (圆内反色，圆外正常)
      // ==================================================================================
      const phase1Style = document.createElement("style")
      phase1Style.id = "the-world-phase1-style"
      phase1Style.textContent = `
        @property --tw-r-expand {
          syntax: "<length>";
          inherits: false;
          initial-value: 0px;
        }

        /* 关键修复：View Transition 默认会有混合模式(plus-lighter)，这会破坏反色滤镜的效果 */
        /* 我们必须强制设为 normal，否则 invert 的颜色会变得很奇怪或者看起来像没变 */
        ::view-transition-group(root),
        ::view-transition-image-pair(root) {
          mix-blend-mode: normal;
        }

        @keyframes the-world-phase1-expand {
          from { --tw-r-expand: 0px; }
          to { --tw-r-expand: ${maxRadius}px; }
        }

        /* 
           底层：Old View (旧页面，正常颜色) 
           不做任何动画，作为背景静止不动 
        */
        ::view-transition-old(root) {
          z-index: 1;
          opacity: 1 !important; /* 防止默认的 fade-out */
          animation: none !important;
        }

        /* 
           顶层：New View (新页面，反色)
           圆内可见（反色），圆外被裁剪（透明，露底下的旧页面）
        */
        ::view-transition-new(root) {
          z-index: 2;
          
          /* 关键修复：防止默认的 fade-in 导致半透明 */
          opacity: 1 !important;
          
          /* 滤镜：New View 是一张截图(img)，我们对图片像素取反 */
          /* filter: invert(1) hue-rotate(180deg);  */
          backdrop-filter: invert(1) hue-rotate(180deg);
          
          /* 裁剪：只显示圆内的部分 */
          clip-path: circle(var(--tw-r-expand) at ${x}px ${y}px);
          
          /* 动画 */
          animation: the-world-phase1-expand ${DURATION_PHASE1}ms ${EASING} forwards;
        }
      `
      document.head.appendChild(phase1Style)

      // 2. 等待 Phase 1 结束
      await transition.finished

      // ==================================================================================
      // 步骤 C: 无缝切换到 Phase 2
      // ==================================================================================
      // VT 只有 4000ms，结束后 VT 层移除。
      // 此时 DOM 里的 Overlay (Phase 2 style) 已经在那里了，全屏反色。
      // 视觉上用户无感知。
      
      phase1Style.remove()

      const animation = overlay.animate(
        [
          { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` },
          { clipPath: `circle(0px at ${x}px ${y}px)` },
        ],
        {
          duration: DURATION_PHASE2,
          easing: EASING,
          fill: "forwards",
        }
      )

      await animation.finished

      // 3. 清理收尾
      overlay.remove()
      phase2Style.remove()
      isAnimating.current = false
    },
    [router]
  )

  return runTheWorldTransition
}