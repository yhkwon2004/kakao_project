import { InvestmentVisualizationScreen } from "@/components/investment-visualization-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function InvestmentVisualizationPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <InvestmentVisualizationScreen />
      <BottomNavigation activeTab="asset" />
    </main>
  )
}
