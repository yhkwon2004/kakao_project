import { InvestmentHistoryScreen } from "@/components/investment-history-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function InvestmentHistoryPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <InvestmentHistoryScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
