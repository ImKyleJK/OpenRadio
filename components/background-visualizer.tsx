"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRadio } from "@/context/radio-context"

export function BackgroundVisualizer() {
  const { isPlaying, analyserRef, visualizerMode } = useRadio()
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

    if (visualizerMode === "off") {
      scheduleNext()
      return
    }

    const barCount = visualizerMode === "bars" ? 8 : 24
    const barWidth = canvas.width / barCount
    const gap = 2

    const hasAnalyser = Boolean(analyser && isPlaying)

    if (!hasAnalyser) {
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

    const bufferLength = analyser!.frequencyBinCount
    const freqArray = new Uint8Array(bufferLength)
    analyser!.getByteFrequencyData(freqArray)
    const timeArray = new Uint8Array(bufferLength)
    analyser!.getByteTimeDomainData(timeArray)

    const freqSum = freqArray.reduce((acc, val) => acc + val, 0)
    const freqRms = Math.sqrt(freqArray.reduce((acc, v) => acc + v * v, 0) / Math.max(1, freqArray.length))
    const timeVariance =
      timeArray.reduce((acc, v) => acc + Math.pow(v - 128, 2), 0) / Math.max(1, timeArray.length)

    const hasAudioData = freqSum > 0 && (freqRms > 0.05 || timeVariance > 1.5)
    if (smoothValuesRef.current.length !== barCount) {
      smoothValuesRef.current = new Array(barCount).fill(0)
    }

    const rawLevels: number[] = []
    const t = Date.now() / 600
    for (let i = 0; i < barCount; i++) {
      const norm = i / barCount
      const logIndex = Math.pow(norm, 1.2) * (bufferLength - 1)
      const dataIndex = Math.max(0, Math.min(bufferLength - 1, Math.floor(logIndex)))
      const rawValue = freqArray[dataIndex]

      const noiseFloor = 2
      const boosted = hasAudioData
        ? Math.max(0, rawValue - noiseFloor) / (255 - noiseFloor)
        : 0.04 + 0.02 * Math.sin(t + i * 0.4)

      const emphasis =
        visualizerMode === "wave"
          ? norm < 0.35
            ? 1.3
            : norm > 0.65
              ? 1.15
              : 1.05
          : norm < 0.35
            ? 1.55
            : norm > 0.65
              ? 1.3
              : 1.1
      const target = Math.max(0.04, Math.min(1, Math.pow(boosted * emphasis, 0.85)))
      rawLevels.push(target)
    }

    // Neighbor smoothing to create gradual rises/falls across bars
    const spatiallySmoothed = rawLevels.map((level, idx) => {
      const prev = rawLevels[idx - 1] ?? level
      const next = rawLevels[idx + 1] ?? level
      const prev2 = rawLevels[idx - 2] ?? prev
      const next2 = rawLevels[idx + 2] ?? next
      return level * 0.5 + prev * 0.2 + next * 0.2 + prev2 * 0.05 + next2 * 0.05
    })

    const timeSmoothed: number[] = []
    for (let i = 0; i < barCount; i++) {
      const target = spatiallySmoothed[i]
      const prev = smoothValuesRef.current[i] || 0
      const smoothingFactor = target > prev ? 0.25 : 0.9 // more responsive, slower decay
      const smoothed = prev * smoothingFactor + target * (1 - smoothingFactor)
      smoothValuesRef.current[i] = smoothed
      timeSmoothed.push(smoothed)
    }

    const points: { x: number; y: number; height: number; barX: number }[] = []
    for (let i = 0; i < barCount; i++) {
      const smoothed = timeSmoothed[i]
      const height =
        smoothed * canvas.height * (visualizerMode === "wave" ? 1.05 : 1.2) + canvas.height * 0.02
      const x = i * barWidth
      const y = canvas.height - height
      points.push({ x: x + barWidth / 2, y, height, barX: x })
    }

    if (visualizerMode === "wave") {
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
    } else {
      const t = Date.now() / 4000
      points.forEach((p, idx) => {
        const shift = (idx / barCount + t) % 1
        const hue = 20 + shift * 40 // cycle orange/yellow over time
        const top = `hsla(${hue}, 85%, 60%, 0.6)`
        const bottom = `hsla(${hue}, 85%, 60%, 0.1)`
        const gradient = ctx.createLinearGradient(p.barX, p.y, p.barX, canvas.height)
        gradient.addColorStop(0, top)
        gradient.addColorStop(1, bottom)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(p.barX, p.y, barWidth, p.height, 4)
        ctx.fill()
      })
    }

    scheduleNext()
  }, [isPlaying, analyserRef, visualizerMode])

  useEffect(() => {
    draw()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  useEffect(() => {
    if (isPlaying && visualizerMode !== "off") {
      draw()
    }
  }, [isPlaying, visualizerMode, draw])

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
