import { cn } from "@/lib/utils"

export type TextureType =
  | "dots"
  | "grid"
  | "noise"
  | "crosshatch"
  | "diagonal"
  | "scatteredDots"
  | "halftone"
  | "triangular"
  | "chevron"
  | "paperGrain"
  | "horizontalLines"
  | "verticalLines"
  | "none"

interface TextureOverlayProps {
  texture: TextureType
  /** 统一透明度（浅色/深色一致时使用） */
  opacity?: number
  /** 浅色模式透明度，与 opacityDark 同传时优先级高于 opacity */
  opacityLight?: number
  /** 深色模式透明度，与 opacityLight 同传时优先级高于 opacity */
  opacityDark?: number
  className?: string
}

const texturePatterns: Record<TextureType, string> = {
  dots: "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.4)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] bg-[length:8px_8px]",
  grid: "bg-[linear-gradient(rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:12px_12px]",
  noise:
    "bg-[radial-gradient(circle_at_2px_2px,rgba(0,0,0,0.25)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.25)_1px,transparent_0)] bg-[length:6px_6px]",
  crosshatch:
    "bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px),repeating-linear-gradient(-45deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]",
  diagonal:
    "bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_6px)]",
  scatteredDots:
    "bg-[radial-gradient(circle_at_3px_7px,rgba(0,0,0,0.3)_1px,transparent_0),radial-gradient(circle_at_11px_2px,rgba(0,0,0,0.3)_1px,transparent_0),radial-gradient(circle_at_7px_12px,rgba(0,0,0,0.3)_1px,transparent_0)] bg-[length:16px_16px]",
  halftone:
    "bg-[radial-gradient(circle,rgba(0,0,0,0.4)_25%,transparent_25%)] bg-[length:10px_10px] bg-[position:0_0,5px_5px]",
  triangular:
    "bg-[conic-gradient(from_0deg_at_50%_50%,rgba(0,0,0,0.3)_0deg_120deg,transparent_120deg_240deg,rgba(0,0,0,0.3)_240deg_360deg)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]",
  chevron:
    "bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_8px),repeating-linear-gradient(-45deg,rgba(0,0,0,0.2)_0px,rgba(0,0,0,0.2)_2px,transparent_2px,transparent_8px)]",
  paperGrain:
    "bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,transparent_1px,transparent_3px),repeating-linear-gradient(90deg,rgba(0,0,0,0.1)_0px,transparent_1px,transparent_4px),repeating-linear-gradient(45deg,rgba(0,0,0,0.05)_0px,transparent_1px,transparent_5px)]",
  horizontalLines:
    "bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_4px)]",
  verticalLines:
    "bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.25)_0px,rgba(0,0,0,0.25)_1px,transparent_1px,transparent_4px)]",
  none: "",
}

const defaultOpacities: Record<TextureType, number> = {
  dots: 1,
  grid: 1,
  noise: 1,
  crosshatch: 1,
  diagonal: 1,

  scatteredDots: 1,
  halftone: 1,
  triangular: 1,
  chevron: 1,
  paperGrain: 1,
  horizontalLines: 1,
  verticalLines: 1,
  none: 0,
}

export function TextureOverlay({
  texture,
  opacity,
  opacityLight,
  opacityDark,
  className,
}: TextureOverlayProps) {
  if (texture === "none") return null

  const baseOpacity = opacity ?? defaultOpacities[texture]
  const pattern = texturePatterns[texture]
  const useModeOpacity = opacityLight != null && opacityDark != null
  // 使用字面量类名以便 Tailwind JIT 生成（动态拼接不会被扫描）
  const modeOpacityClass =
    useModeOpacity && opacityLight === 0.12 && opacityDark === 0.3
      ? "opacity-[0.12] dark:opacity-[0.3]"
      : useModeOpacity && opacityLight === 0.15 && opacityDark === 0.3
        ? "opacity-[0.15] dark:opacity-[0.3]"
        : null

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none",
        pattern,
        modeOpacityClass,
        className
      )}
      style={
        modeOpacityClass
          ? undefined
          : { opacity: useModeOpacity ? opacityLight ?? baseOpacity : baseOpacity }
      }
    />
  )
}
