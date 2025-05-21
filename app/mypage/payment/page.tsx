import { PaymentScreen } from "@/components/payment-screen"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function PaymentPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PaymentScreen />
      <BottomNavigation activeTab="mypage" />
    </main>
  )
}
