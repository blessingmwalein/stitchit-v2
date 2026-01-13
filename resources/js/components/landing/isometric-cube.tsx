"use client"

import { useEffect, useRef } from "react"

export function IsometricCube() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    let animationFrame: number
    let time = 0

    const drawGrid = (offsetY: number) => {
      ctx.strokeStyle = "rgba(234, 88, 12, 0.1)"
      ctx.lineWidth = 1

      const gridSize = 40
      const rows = 20
      const cols = 15

      for (let i = 0; i <= rows; i++) {
        ctx.beginPath()
        const y = (i * gridSize + offsetY) % (rows * gridSize)
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
      }

      for (let i = 0; i <= cols; i++) {
        ctx.beginPath()
        ctx.moveTo(i * gridSize, 0)
        ctx.lineTo(i * gridSize, rect.height)
        ctx.stroke()
      }
    }

    const drawIsometricCube = (x: number, y: number, size: number, alpha: number, hue: number) => {
      const h = size * 0.866
      const w = size

      // Top face
      ctx.beginPath()
      ctx.moveTo(x, y - h)
      ctx.lineTo(x + w, y - h / 2)
      ctx.lineTo(x, y)
      ctx.lineTo(x - w, y - h / 2)
      ctx.closePath()
      ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${alpha * 0.5})`
      ctx.fill()
      ctx.strokeStyle = `hsla(${hue}, 90%, 50%, ${alpha})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Right face
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + w, y - h / 2)
      ctx.lineTo(x + w, y + h / 2)
      ctx.lineTo(x, y + h)
      ctx.closePath()
      ctx.fillStyle = `hsla(${hue}, 90%, 45%, ${alpha * 0.4})`
      ctx.fill()
      ctx.strokeStyle = `hsla(${hue}, 90%, 50%, ${alpha})`
      ctx.stroke()

      // Left face
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - w, y - h / 2)
      ctx.lineTo(x - w, y + h / 2)
      ctx.lineTo(x, y + h)
      ctx.closePath()
      ctx.fillStyle = `hsla(${hue}, 90%, 35%, ${alpha * 0.4})`
      ctx.fill()
      ctx.strokeStyle = `hsla(${hue}, 90%, 50%, ${alpha})`
      ctx.stroke()
    }

    const drawLabel = (x: number, y: number, text: string, alpha: number) => {
      ctx.fillStyle = `rgba(30, 30, 30, ${alpha})`
      ctx.font = "12px Inter, system-ui, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(text, x + 10, y)

      // Connector dot - orange
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 88, 12, ${alpha})`
      ctx.fill()
    }

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Draw animated grid
      drawGrid((time * 20) % 40)

      // Draw stacked cubes with floating animation
      const floatOffset1 = Math.sin(time) * 10
      const floatOffset2 = Math.sin(time + 1) * 8
      const floatOffset3 = Math.sin(time + 2) * 12

      // Bottom cube (largest)
      drawIsometricCube(centerX, centerY + 80 + floatOffset1, 80, 0.8, 25)

      // Middle cube
      drawIsometricCube(centerX, centerY - 20 + floatOffset2, 60, 0.9, 30)

      // Top cube (smallest)
      drawIsometricCube(centerX, centerY - 100 + floatOffset3, 45, 1, 35)

      // Draw labels with connections
      const labelAlpha = 0.7 + Math.sin(time * 2) * 0.3

      drawLabel(centerX + 100, centerY - 140 + floatOffset3, "Smart Production", labelAlpha)
      drawLabel(centerX + 80, centerY - 40 + floatOffset2, "Full Pipeline", labelAlpha * 0.9)
      drawLabel(centerX - 140, centerY + 20 + floatOffset1, "Deep Analytics", labelAlpha * 0.8)
      drawLabel(centerX + 100, centerY + 100 + floatOffset1, "Inventory Control", labelAlpha * 0.85)

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-[400px] lg:h-[600px]" style={{ width: "100%", height: "100%" }} />
}
