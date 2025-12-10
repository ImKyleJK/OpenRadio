import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { NowPlayingSection } from "@/components/now-playing-section"
import { ScheduleSection } from "@/components/schedule-section"
import { NewsSection } from "@/components/news-section"
import { Footer } from "@/components/footer"
import { StickyPlayer } from "@/components/sticky-player"
import { RadioProvider } from "@/context/radio-context"

export default function HomePage() {
  return (
    <RadioProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <NowPlayingSection />
          <ScheduleSection />
          <NewsSection />
        </main>
        <Footer />
        <StickyPlayer />
      </div>
    </RadioProvider>
  )
}
