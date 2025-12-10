import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { NowPlayingSection } from "@/components/now-playing-section"
import { ScheduleSection } from "@/components/schedule-section"
import { NewsSection } from "@/components/news-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <NowPlayingSection />
        <ScheduleSection />
        <NewsSection />
      </main>
      <Footer />
    </div>
  )
}
