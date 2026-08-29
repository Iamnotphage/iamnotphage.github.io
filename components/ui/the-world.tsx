"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { flushSync } from "react-dom"

const THE_WORLD_PATH = "/the-world"
const DURATION_PHASE1 = 500
const DURATION_PHASE2 = 400
const EASING = "ease-in-out"
const PHASE1_STYLE_ID = "the-world-phase1-style"
const PHASE2_STYLE_ID = "the-world-phase2-style"

function isChromiumBrowser() {
  return /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent)
}

function getClipPathScale(isChromium: boolean) {
  // Chromium on HiDPI screens resolves View Transition clip-path lengths in
  // backing-store pixels, while button geometry is reported in CSS pixels.
  return isChromium ? window.devicePixelRatio || 1 : 1
}

function getMaxRadius(x: number, y: number, width: number, height: number) {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
}

function getViewportGeometry(rect: DOMRect) {
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  const width = document.documentElement.clientWidth || window.innerWidth
  const height = document.documentElement.clientHeight || window.innerHeight

  return { x, y, maxRadius: getMaxRadius(x, y, width, height) }
}

function createInversionOverlay(
  x: number,
  y: number,
  clipPathScale: number,
  initialState: "expanded" | "collapsed"
) {
  const style = document.createElement("style")
  style.id = PHASE2_STYLE_ID
  style.textContent = `
    .the-world-phase2-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
      backdrop-filter: invert(1) hue-rotate(180deg);
      -webkit-backdrop-filter: invert(1) hue-rotate(180deg);
      will-change: clip-path;
    }
  `
  document.head.appendChild(style)

  const overlay = document.createElement("div")
  overlay.className = "the-world-phase2-overlay"
  overlay.setAttribute("aria-hidden", "true")
  document.body.appendChild(overlay)

  const overlayRect = overlay.getBoundingClientRect()
  const localX = x - overlayRect.left
  const localY = y - overlayRect.top
  const maxRadius = getMaxRadius(
    localX,
    localY,
    overlayRect.width,
    overlayRect.height
  )
  const clipX = localX * clipPathScale
  const clipY = localY * clipPathScale
  const clipRadius = maxRadius * clipPathScale
  const expandedClipPath = `circle(${clipRadius}px at ${clipX}px ${clipY}px)`
  const collapsedClipPath = `circle(0px at ${clipX}px ${clipY}px)`
  const initialClipPath =
    initialState === "expanded" ? expandedClipPath : collapsedClipPath

  overlay.style.clipPath = initialClipPath
  overlay.style.setProperty("-webkit-clip-path", initialClipPath)

  return {
    style,
    overlay,
    expandedClipPath,
    collapsedClipPath,
  }
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

export function useTheWorldTransition() {
  const router = useRouter()
  const isAnimating = useRef(false)

  const runTheWorldTransition = useCallback(
    async (buttonRect: DOMRect) => {
      if (isAnimating.current) return

      const shouldReduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (typeof document === "undefined" || shouldReduceMotion) {
        router.push(THE_WORLD_PATH)
        return
      }

      isAnimating.current = true

      let phase1Style: HTMLStyleElement | null = null
      let phase2Style: HTMLStyleElement | null = null
      let overlay: HTMLDivElement | null = null
      let phase2Animation: Animation | null = null

      try {
        const { x, y, maxRadius } = getViewportGeometry(buttonRect)
        const isChromium = isChromiumBrowser()
        const clipPathScale = getClipPathScale(isChromium)
        const clipX = x * clipPathScale
        const clipY = y * clipPathScale
        const clipRadius = maxRadius * clipPathScale
        const phase1ColorFilter = isChromium
          ? `
            backdrop-filter: invert(1) hue-rotate(180deg);
            -webkit-backdrop-filter: invert(1) hue-rotate(180deg);
          `
          : `
            filter: invert(1) hue-rotate(180deg);
            -webkit-filter: invert(1) hue-rotate(180deg);
          `

        // Chrome 在 View Transition API 不可用时使用同一张真实 DOM 反色层完成两段动画。
        // 圆形先在旧页面展开，路由切换后再从新页面收回。
        if (!document.startViewTransition) {
          const fallbackOverlay = createInversionOverlay(
            x,
            y,
            clipPathScale,
            "collapsed"
          )
          phase2Style = fallbackOverlay.style
          overlay = fallbackOverlay.overlay

          phase2Animation = overlay.animate(
            [
              { clipPath: fallbackOverlay.collapsedClipPath },
              { clipPath: fallbackOverlay.expandedClipPath },
            ],
            {
              duration: DURATION_PHASE1,
              easing: EASING,
              fill: "forwards",
            }
          )

          await phase2Animation.finished

          overlay.style.clipPath = fallbackOverlay.expandedClipPath
          overlay.style.setProperty(
            "-webkit-clip-path",
            fallbackOverlay.expandedClipPath
          )
          phase2Animation.cancel()
          phase2Animation = null

          flushSync(() => {
            router.push(THE_WORLD_PATH)
          })
          await waitForNextPaint()

          phase2Animation = overlay.animate(
            [
              { clipPath: fallbackOverlay.expandedClipPath },
              { clipPath: fallbackOverlay.collapsedClipPath },
            ],
            {
              duration: DURATION_PHASE2,
              easing: EASING,
              fill: "forwards",
            }
          )

          await phase2Animation.finished
          return
        }

        const transition = document.startViewTransition(() => {
          flushSync(() => {
            router.push(THE_WORLD_PATH)
          })
        })

        await transition.ready

        // Phase 2 使用真实 DOM 覆盖层。挂到 body 后按覆盖层自身的参考框换算圆心，
        // 避免 Chrome 在 View Transition 合成期间使用偏移后的裁剪坐标原点。
        const mountedOverlay = createInversionOverlay(
          x,
          y,
          clipPathScale,
          "expanded"
        )
        phase2Style = mountedOverlay.style
        overlay = mountedOverlay.overlay

        // Phase 1 直接动画 clip-path，并对 View Transition 截图应用 filter。
        // 这条渲染路径在 Safari 中比注册自定义属性与 backdrop-filter 的组合稳定。
        phase1Style = document.createElement("style")
        phase1Style.id = PHASE1_STYLE_ID
        phase1Style.textContent = `
          ::view-transition-group(root),
          ::view-transition-image-pair(root) {
            mix-blend-mode: normal;
          }

          @keyframes the-world-phase1-expand {
            from {
              clip-path: circle(0px at ${clipX}px ${clipY}px);
              -webkit-clip-path: circle(0px at ${clipX}px ${clipY}px);
            }
            to {
              clip-path: circle(${clipRadius}px at ${clipX}px ${clipY}px);
              -webkit-clip-path: circle(${clipRadius}px at ${clipX}px ${clipY}px);
            }
          }

          ::view-transition-old(root) {
            z-index: 1;
            opacity: 1 !important;
            animation: none !important;
          }

          ::view-transition-new(root) {
            z-index: 2;
            opacity: 1 !important;
            ${phase1ColorFilter}
            clip-path: circle(0px at ${clipX}px ${clipY}px);
            -webkit-clip-path: circle(0px at ${clipX}px ${clipY}px);
            animation: the-world-phase1-expand ${DURATION_PHASE1}ms ${EASING} forwards;
          }
        `
        document.head.appendChild(phase1Style)

        await transition.finished

        phase1Style.remove()
        phase1Style = null

        phase2Animation = overlay.animate(
          [
            { clipPath: mountedOverlay.expandedClipPath },
            { clipPath: mountedOverlay.collapsedClipPath },
          ],
          {
            duration: DURATION_PHASE2,
            easing: EASING,
            fill: "forwards",
          }
        )

        await phase2Animation.finished
      } catch (error) {
        console.warn("The World transition was interrupted.", error)

        if (window.location.pathname !== THE_WORLD_PATH) {
          router.push(THE_WORLD_PATH)
        }
      } finally {
        phase2Animation?.cancel()
        overlay?.remove()
        phase1Style?.remove()
        phase2Style?.remove()
        isAnimating.current = false
      }
    },
    [router]
  )

  return runTheWorldTransition
}
