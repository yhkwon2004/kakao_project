import { MileageScreen } from "@/components/mileage-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MileagePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <MileageScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
