import { MyPageScreen } from "@/components/mypage-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <MyPageScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
