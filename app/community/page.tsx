import { CommunityScreen } from "@/components/community-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function CommunityPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <CommunityScreen />
      <BottomNavigation activeTab="community" />
    </main>
  )
}
