"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRadio } from "@/context/radio-context"

export function AudioVisualizer() {
  const { isPlaying, analyserRef } = useRadio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const smoothValuesRef = useRef<number[]>([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Match parent size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const barCount = 24
    const gap = 2
    const barWidth = canvas.width / barCount - gap

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!analyser || !isPlaying) {
      // subtle idle shimmer
      const t = Date.now() / 800
      ctx.fillStyle = "oklch(0.75 0.15 195 / 0.2)"
      for (let i = 0; i < barCount; i++) {
        const wobble = Math.sin(t + i * 0.4) * 6 + 10
        const x = i * (barWidth + gap)
        const y = canvas.height - wobble
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, wobble, 2)
        ctx.fill()
      }
      animationRef.current = requestAnimationFrame(draw)
      return
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    if (smoothValuesRef.current.length !== barCount) {
      smoothValuesRef.current = new Array(barCount).fill(0)
    }

    const sum = dataArray.reduce((acc, val) => acc + val, 0)
    const hasAudio = sum > 1

    for (let i = 0; i < barCount; i++) {
      const norm = i / barCount
      const logIndex = Math.pow(norm, 2) * (bufferLength - 1)
      const dataIndex = Math.max(0, Math.min(bufferLength - 1, Math.floor(logIndex)))
      const raw = dataArray[dataIndex]

      const noiseFloor = 4
      const boosted =
        raw > noiseFloor ? (raw - noiseFloor) / (255 - noiseFloor) : hasAudio ? 0 : 0.06 + Math.random() * 0.03

      const emphasis = norm < 0.35 ? 1.7 : norm > 0.65 ? 1.35 : 1.1
      const target = Math.max(0.05, Math.min(1, Math.pow(boosted * emphasis, 0.9)))

      const prev = smoothValuesRef.current[i] || 0
      const smoothingFactor = target > prev ? 0.35 : 0.82 // slightly faster attack, smoother decay
      const smoothed = prev * smoothingFactor + target * (1 - smoothingFactor)
      smoothValuesRef.current[i] = smoothed

      const height = smoothed * canvas.height * 0.95 + canvas.height * 0.03
      const x = i * (barWidth + gap)
      const y = canvas.height - height

      const gradient = ctx.createLinearGradient(x, y, x, canvas.height)
      gradient.addColorStop(0, "oklch(0.75 0.15 195)")
      gradient.addColorStop(1, "oklch(0.75 0.15 195 / 0.25)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, height, 3)
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

  useEffect(() => {
    const handleResize = () => draw()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [draw])

  return <canvas ref={canvasRef} className="w-full h-full" aria-label="Audio visualizer" />
}
