import Link from "next/link"
import Image from "next/image"
import { Radio, Twitter, Instagram, Facebook, Youtube, Heart } from "lucide-react"
import { stationConfig } from "@/lib/station-config"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 pb-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-border/50 bg-background/50">
                {stationConfig.logo ? (
                  <Image
                    src={stationConfig.logo}
                    alt={`${stationConfig.name} logo`}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                ) : (
                  <>
                    <Radio className="h-8 w-8 p-1.5 text-primary" />
                    <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full animate-pulse-glow" />
                  </>
                )}
              </div>
              <span className="text-lg font-bold">{stationConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{stationConfig.description || stationConfig.tagline}</p>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/schedule" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  News & Articles
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For DJs */}
          <div>
            <h3 className="font-semibold mb-4">For DJs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/staff" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Staff Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/connection"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Connection Guide
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Become a DJ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {stationConfig.name}. All rights reserved.</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the community
          </p>
        </div>
      </div>
    </footer>
  )
}
