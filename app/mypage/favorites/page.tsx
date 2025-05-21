import { FavoritesScreen } from "@/components/favorites-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function FavoritesPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <FavoritesScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
