import { InvestmentListScreen } from "@/components/investment-list-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function InvestmentsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <InvestmentListScreen />
      <BottomNavigation activeTab="asset" />
    </main>
  )
}
