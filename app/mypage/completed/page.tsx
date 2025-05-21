import { CompletedProjectsScreen } from "@/components/completed-projects-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function CompletedProjectsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <CompletedProjectsScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
