"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"

export function AssetScreen() {
  const router = useRouter()
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalReturn, setTotalReturn] = useState(0)
  const [investments, setInvestments] = useState<any[]>([])

  useEffect(() => {
    const loadInvestments = () => {
      const user = getUserFromStorage()
      if (user) {
        setUserBalance(user.balance || 150000)
      }

      const investmentsStr = localStorage.getItem("userInvestments")
      let userInvestments = []

      if (investmentsStr) {
        userInvestments = JSON.parse(investmentsStr)
      }

      setInvestments(userInvestments)

      const total = userInvestments.reduce((sum: number, inv: any) => sum + inv.amount, 0)
      setTotalInvestment(total)

      const totalExpectedReturn = userInvestments.reduce((sum: number, inv: any) => {
        const roi = typeof inv.expectedROI === "string" ? Number.parseFloat(inv.expectedROI) : inv.expectedROI
        return sum + Math.round(inv.amount * (1 + roi / 100))
      }, 0)
      setTotalReturn(totalExpectedReturn)
    }

    loadInvestments()

    const handleStorageChange = () => loadInvestments()
    const handleProgressUpdate = () => loadInvestments()

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleStorageChange)
    window.addEventListener("webtoonProgressUpdate", handleProgressUpdate)
    window.addEventListener("userDataChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleStorageChange)
      window.removeEventListener("webtoonProgressUpdate", handleProgressUpdate)
      window.removeEventListener("userDataChanged", handleStorageChange)
    }
  }, [])

  const totalAssets = userBalance + totalReturn
  const profitLoss = totalReturn - totalInvestment
  const profitRate = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

  const getWebtoonImage = (id: string) => {
    const imageMap: { [key: string]: string } = {
      "bad-secretary": "/webtoons/나쁜-비서.png",
      "blood-sword-family-hunting-dog": "/images/철혈검가-사냥개의-회귀.png",
      // 기타 웹툰 맵 추가 가능
    }
    return imageMap[id] || "/placeholder.svg?height=60&width=60&query=webtoon cover art"
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* ✅ 헤더 - 뒤로가기 버튼 제거됨 */}
      <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray/10">
        <div className="flex items-center">
          {/* 삭제된 뒤로가기 버튼 */}
          <Logo size="sm" showSubtitle={false} />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarFallback className="text-darkblue"> </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* 자산 카드 */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">총 자산</p>
                <p className="text-3xl font-bold">{totalAssets.toLocaleString()}원</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">현금</p>
                <p className="text-lg font-bold">{userBalance.toLocaleString()}원</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">투자자산</p>
                <p className="text-lg font-bold">{totalReturn.toLocaleString()}원</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 수익률 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-gray/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray text-xs font-medium">총 수익</p>
                  <p className={`text-lg font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {profitLoss.toLocaleString()}원
                  </p>
                </div>
                <div className={`p-2 rounded-full ${profitLoss >= 0 ? "bg-green/10" : "bg-red/10"}`}>
                  {profitLoss >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray text-xs font-medium">수익률</p>
                  <p className={`text-lg font-bold ${profitRate >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {profitRate.toFixed(1)}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${profitRate >= 0 ? "bg-green/10" : "bg-red/10"}`}>
                  <TrendingUp className={`h-4 w-4 ${profitRate >= 0 ? "text-green-600" : "text-red-500"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="h-16 flex-col gap-2 border-2 hover:bg-blue/5 hover:border-blue/30"
            onClick={() => router.push("/webtoons")}
          >
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium">투자하기</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex-col gap-2 border-2 hover:bg-green/5 hover:border-green/30"
            onClick={() => router.push("/asset/visualization")}
          >
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span className="text-xs font-medium">분석</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex-col gap-2 border-2 hover:bg-purple/5 hover:border-purple/30"
            onClick={() => router.push("/mypage/payment")}
          >
            <Wallet className="h-5 w-5 text-purple-600" />
            <span className="text-xs font-medium">충전</span>
          </Button>
        </div>

        {/* 투자 현황 섹션은 그대로 유지됩니다 */}
        {/* ... 이하 생략 ... */}
      </div>
    </div>
  )
}
