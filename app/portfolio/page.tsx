import { PortfolioScreen } from "@/components/portfolio-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function PortfolioPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PortfolioScreen />
      <BottomNavigation activeTab="portfolio" />
    </main>
  )
}
