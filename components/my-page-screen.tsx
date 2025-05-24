"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Settings,
  Wallet,
  Gift,
  Heart,
  BarChart3,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"

export function MyPageScreen() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [mileage, setMileage] = useState(0)

  useEffect(() => {
    // 사용자 정보 로드
    const userData = getUserFromStorage()
    if (userData) {
      setUser(userData)
      setUserBalance(userData.balance || 150000)
    }

    // 투자 내역 로드
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      const total = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0)
      setTotalInvestment(total)
    }

    // 마일리지 로드
    const mileageStr = localStorage.getItem("userMileage")
    if (mileageStr) {
      const mileageData = JSON.parse(mileageStr)
      setMileage(mileageData.totalMileage || 0)
    }
  }, [])

  const menuItems = [
    {
      icon: Wallet,
      title: "결제 관리",
      subtitle: "충전 및 결제 수단 관리",
      route: "/mypage/payment",
      color: "text-blue-600",
      bgColor: "bg-blue/10",
    },
    {
      icon: Gift,
      title: "마일리지",
      subtitle: `${mileage.toLocaleString()}P 보유`,
      route: "/mypage/mileage",
      color: "text-yellow-600",
      bgColor: "bg-yellow/10",
    },
    {
      icon: Heart,
      title: "관심 웹툰",
      subtitle: "즐겨찾기한 웹툰 관리",
      route: "/mypage/favorites",
      color: "text-red-600",
      bgColor: "bg-red/10",
    },
    {
      icon: BarChart3,
      title: "투자 내역",
      subtitle: "나의 투자 현황 확인",
      route: "/mypage/investment",
      color: "text-green-600",
      bgColor: "bg-green/10",
    },
    {
      icon: Award,
      title: "완료된 프로젝트",
      subtitle: "투자 완료 작품 보기",
      route: "/mypage/completed",
      color: "text-purple-600",
      bgColor: "bg-purple/10",
    },
  ]

  const settingsItems = [
    {
      icon: Bell,
      title: "알림 설정",
      route: "/mypage/settings",
    },
    {
      icon: Shield,
      title: "개인정보 보호",
      route: "/mypage/settings",
    },
    {
      icon: HelpCircle,
      title: "고객 지원",
      route: "/mypage/settings",
    },
    {
      icon: Settings,
      title: "계정 설정",
      route: "/mypage/settings",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray/10">
        <Logo size="sm" showSubtitle={false} />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* 프로필 카드 */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 border-4 border-white/20">
                <AvatarFallback className="text-blue-600 text-xl font-bold">
                  {user?.name?.charAt(0) || "권"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.name || "권민수"}</h2>
                <p className="text-blue-100 text-sm">{user?.email || "user@example.com"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">프리미엄 투자자</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">₩{userBalance.toLocaleString()}</p>
                <p className="text-blue-100 text-xs">보유 잔액</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">₩{totalInvestment.toLocaleString()}</p>
                <p className="text-blue-100 text-xs">총 투자금</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{mileage.toLocaleString()}P</p>
                <p className="text-blue-100 text-xs">마일리지</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-2 hover:bg-blue/5 hover:border-blue/30"
            onClick={() => router.push("/mypage/payment")}
          >
            <Wallet className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium">충전</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-2 hover:bg-green/5 hover:border-green/30"
            onClick={() => router.push("/mypage/investment")}
          >
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium">투자현황</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-2 hover:bg-yellow/5 hover:border-yellow/30"
            onClick={() => router.push("/mypage/mileage")}
          >
            <Gift className="h-5 w-5 text-yellow-600" />
            <span className="text-xs font-medium">마일리지</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col gap-2 border-2 hover:bg-red/5 hover:border-red/30"
            onClick={() => router.push("/mypage/favorites")}
          >
            <Heart className="h-5 w-5 text-red-600" />
            <span className="text-xs font-medium">관심목록</span>
          </Button>
        </div>

        {/* 메인 메뉴 */}
        <Card className="border-gray/20 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-darkblue dark:text-light mb-4">서비스</h3>
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-gray/5"
                  onClick={() => router.push(item.route)}
                >
                  <div className={`p-2 rounded-lg mr-3 ${item.bgColor}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-darkblue dark:text-light">{item.title}</p>
                    <p className="text-xs text-gray">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 설정 메뉴 */}
        <Card className="border-gray/20 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-darkblue dark:text-light mb-4">설정</h3>
            <div className="space-y-1">
              {settingsItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-gray/5"
                  onClick={() => router.push(item.route)}
                >
                  <div className="p-2 rounded-lg mr-3 bg-gray/10">
                    <item.icon className="h-5 w-5 text-gray" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-darkblue dark:text-light">{item.title}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 로그아웃 */}
        <Card className="border-red/20 shadow-lg">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red/5"
              onClick={() => {
                localStorage.removeItem("currentUser")
                router.push("/login")
              }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
