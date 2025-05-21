import { HomeScreen } from "@/components/home-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HomeScreen />
      <BottomNavigation activeTab="home" />
    </main>
  )
}
