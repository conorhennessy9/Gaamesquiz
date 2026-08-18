import type { ReactNode } from "react"

interface GameIconProps {
  icon: ReactNode
  color: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function GameIcon({ icon, color, size = "md" }: GameIconProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-xl",
    lg: "w-14 h-14 text-3xl",
    xl: "w-20 h-20 text-5xl",
  }

  return (
    <div className={`${color} ${sizeClasses[size]} rounded-lg flex items-center justify-center`}>
      <span className="text-white">{icon}</span>
    </div>
  )
}
