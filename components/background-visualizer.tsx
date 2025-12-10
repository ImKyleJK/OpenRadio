"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRadio } from "@/context/radio-context"

export function BackgroundVisualizer() {
  const { isPlaying, analyserRef, visualizerEnabled } = useRadio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const smoothValuesRef = useRef<number[]>([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scheduleNext = () => {
      animationRef.current = requestAnimationFrame(draw)
    }

    if (!visualizerEnabled) {
      scheduleNext()
      return
    }

    const barCount = 48
    const barWidth = canvas.width / barCount
    const gap = 2

    if (!analyser || !isPlaying) {
      // Draw subtle animated bars when audio is paused or analyser not ready
      const t = Date.now() / 600
      for (let i = 0; i < barCount; i++) {
        const wobble = Math.sin(t + i * 0.3) * 10
        const height = 30 + wobble
        const x = i * barWidth
        const y = canvas.height - height

        ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
        ctx.fillRect(x + gap / 2, y, barWidth - gap, height)
      }
      scheduleNext()
      return
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    const sum = dataArray.reduce((acc, val) => acc + val, 0)
    const hasAudioData = sum > 10
    if (smoothValuesRef.current.length !== barCount) {
      smoothValuesRef.current = new Array(barCount).fill(0)
    }

    const points: { x: number; y: number }[] = []

    for (let i = 0; i < barCount; i++) {
      // Logarithmic mapping: lower freqs (bass) clustered left, highs right
      const norm = i / barCount
      const logIndex = Math.pow(norm, 2) * (bufferLength - 1)
      const dataIndex = Math.max(0, Math.min(bufferLength - 1, Math.floor(logIndex)))
      const rawValue = dataArray[dataIndex]

      const noiseFloor = 4
      const boosted =
        rawValue > noiseFloor
          ? (rawValue - noiseFloor) / (255 - noiseFloor)
          : hasAudioData
            ? 0
            : 0.05

      // Balanced emphasis: bass (left) and vocals/highs (right) still pop
      const emphasis = norm < 0.35 ? 1.7 : norm > 0.65 ? 1.35 : 1.2
      const target = Math.max(0.05, Math.min(1, Math.pow(boosted * emphasis, 0.9)))

      const prev = smoothValuesRef.current[i] || 0
      const smoothingFactor = target > prev ? 0.35 : 0.78 // quicker attack, gentle decay
      const smoothed = prev * smoothingFactor + target * (1 - smoothingFactor)
      smoothValuesRef.current[i] = smoothed

      const height = smoothed * canvas.height * 1.1 + canvas.height * 0.03
      const x = i * barWidth
      const y = canvas.height - height
      points.push({ x: x + barWidth / 2, y })
    }

    // Draw a smooth wave path based on points
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(points[0]?.x ?? 0, points[0]?.y ?? canvas.height)
    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const xc = (current.x + next.x) / 2
      const yc = (current.y + next.y) / 2
      ctx.quadraticCurveTo(current.x, current.y, xc, yc)
    }
    const last = points[points.length - 1]
    if (last) {
      ctx.lineTo(last.x, last.y)
      ctx.lineTo(canvas.width, canvas.height)
    }
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.1)
    gradient.addColorStop(0, "rgba(34, 211, 238, 0.08)")
    gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.04)")
    gradient.addColorStop(1, "rgba(34, 211, 238, 0.01)")
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.strokeStyle = "rgba(34, 211, 238, 0.2)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    scheduleNext()
  }, [isPlaying, analyserRef, visualizerEnabled])

  useEffect(() => {
    draw()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  useEffect(() => {
    if (isPlaying && visualizerEnabled) {
      draw()
    }
  }, [isPlaying, visualizerEnabled, draw])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      draw()
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [draw])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />
}
