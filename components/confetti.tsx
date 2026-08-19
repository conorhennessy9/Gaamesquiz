"use client"

import { useEffect, useState } from "react"

interface ConfettiProps {
  active: boolean
  config?: {
    angle?: number
    spread?: number
    startVelocity?: number
    elementCount?: number
    dragFriction?: number
    duration?: number
    stagger?: number
    width?: string
    height?: string
    colors?: string[]
  }
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
  velocityX: number
  velocityY: number
  color: string
  shape: "square" | "circle" | "triangle"
}

export function Confetti({ active, config = {} }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  const defaultConfig = {
    angle: 90,
    spread: 45,
    startVelocity: 45,
    elementCount: 50,
    dragFriction: 0.1,
    duration: 3000,
    stagger: 0,
    width: "10px",
    height: "10px",
    colors: ["#f43f5e", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"],
  }

  const finalConfig = { ...defaultConfig, ...config }

  useEffect(() => {
    if (!active) {
      setPieces([])
      return
    }

    const newPieces: ConfettiPiece[] = []
    const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"]

    for (let i = 0; i < finalConfig.elementCount; i++) {
      const angle = finalConfig.angle - finalConfig.spread / 2 + finalConfig.spread * Math.random()
      const velocity = finalConfig.startVelocity * (0.5 + Math.random() * 0.5)

      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        velocityX: Math.cos((angle * Math.PI) / 180) * velocity,
        velocityY: -Math.sin((angle * Math.PI) / 180) * velocity,
        color: finalConfig.colors[Math.floor(Math.random() * finalConfig.colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      })
    }

    setPieces(newPieces)

    const animationInterval = setInterval(() => {
      setPieces((currentPieces) =>
        currentPieces
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.velocityX,
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + 5,
            velocityY: piece.velocityY + 0.5, // gravity
            velocityX: piece.velocityX * (1 - finalConfig.dragFriction),
          }))
          .filter((piece) => piece.y < window.innerHeight + 100),
      )
    }, 16)

    const cleanupTimeout = setTimeout(() => {
      clearInterval(animationInterval)
      setPieces([])
    }, finalConfig.duration)

    return () => {
      clearInterval(animationInterval)
      clearTimeout(cleanupTimeout)
    }
  }, [active])

  if (!active || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            transition: "none",
          }}
        >
          {piece.shape === "square" && <div className="w-3 h-3" style={{ backgroundColor: piece.color }} />}
          {piece.shape === "circle" && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: piece.color }} />
          )}
          {piece.shape === "triangle" && (
            <div
              className="w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: `12px solid ${piece.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
