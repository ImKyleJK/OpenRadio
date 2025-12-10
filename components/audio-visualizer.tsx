"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRadio } from "@/context/radio-context"

export function AudioVisualizer() {
  const { isPlaying, analyserRef } = useRadio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas || !analyser || !isPlaying) {
      // Draw static bars when not playing
      const ctx = canvas?.getContext("2d")
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const barCount = 32
        const barWidth = canvas.width / barCount - 2
        ctx.fillStyle = "oklch(0.75 0.15 195 / 0.3)"

        for (let i = 0; i < barCount; i++) {
          const height = Math.random() * 10 + 5
          const x = i * (barWidth + 2)
          const y = canvas.height - height
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, height, 2)
          ctx.fill()
        }
      }
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barCount = 32
    const barWidth = canvas.width / barCount - 2

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i * bufferLength) / barCount)
      const value = dataArray[dataIndex]
      const height = (value / 255) * canvas.height * 0.9 + 5

      const x = i * (barWidth + 2)
      const y = canvas.height - height

      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height)
      gradient.addColorStop(0, "oklch(0.75 0.15 195)")
      gradient.addColorStop(1, "oklch(0.75 0.15 195 / 0.3)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, height, 2)
      ctx.fill()
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [isPlaying, analyserRef])

  useEffect(() => {
    draw()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  useEffect(() => {
    if (isPlaying) {
      draw()
    }
  }, [isPlaying, draw])

  return <canvas ref={canvasRef} width={320} height={64} className="w-full h-full" aria-label="Audio visualizer" />
}
