import { AssetScreen } from "@/components/asset-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function AssetPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <AssetScreen />
      <BottomNavigation activeTab="asset" />
    </main>
  )
}
