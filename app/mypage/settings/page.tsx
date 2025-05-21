import { AccountSettingsScreen } from "@/components/account-settings-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function AccountSettingsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <AccountSettingsScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
