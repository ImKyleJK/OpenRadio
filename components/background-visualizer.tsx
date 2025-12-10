"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRadio } from "@/context/radio-context"

export function BackgroundVisualizer() {
  const { isPlaying, analyserRef, visualizerEnabled } = useRadio()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

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

    const barCount = 64
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
    const hasAudioData = sum > 0

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i * bufferLength) / barCount)
      const value = dataArray[dataIndex]
      const normalized = value / 255
      const height = (hasAudioData ? normalized : 0.15 + Math.random() * 0.05) * canvas.height * 0.8 + 20

      const x = i * barWidth
      const y = canvas.height - height

      // Create gradient from bottom to top
      const gradient = ctx.createLinearGradient(x, canvas.height, x, y)
      gradient.addColorStop(0, "rgba(34, 211, 238, 0.08)")
      gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.04)")
      gradient.addColorStop(1, "rgba(34, 211, 238, 0.01)")

      ctx.fillStyle = gradient
      ctx.fillRect(x + gap / 2, y, barWidth - gap, height)
    }

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
