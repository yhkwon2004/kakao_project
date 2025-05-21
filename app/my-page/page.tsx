import { MyPageScreen } from "@/components/my-page-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <MyPageScreen />
      <BottomNavigation activeTab="myPage" />
    </main>
  )
}
