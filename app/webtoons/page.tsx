import { WebtoonListScreen } from "@/components/webtoon-list-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function WebtoonListPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <WebtoonListScreen />
      <BottomNavigation activeTab="home" />
    </main>
  )
}
