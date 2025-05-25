"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Wallet, PieChart, BarChart3, ArrowDownRight, Eye, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"
import { formatKoreanCurrency } from "@/lib/format-currency"

export function AssetScreen() {
  const router = useRouter()
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalReturn, setTotalReturn] = useState(0)
  const [investments, setInvestments] = useState<any[]>([])

  useEffect(() => {
    const loadInvestments = () => {
      const user = getUserFromStorage()
      if (user && user.balance !== undefined) {
        setUserBalance(user.balance)
      }

      const investmentsStr = localStorage.getItem("userInvestments")
      let userInvestments = []

      if (investmentsStr) {
        userInvestments = JSON.parse(investmentsStr)
      }

      setInvestments(userInvestments)

      // Add null checks and ensure numbers
      const total = userInvestments.reduce((sum: number, inv: any) => {
        const amount = Number(inv.amount) || 0
        return sum + amount
      }, 0)
      setTotalInvestment(total)

      const totalExpectedReturn = userInvestments.reduce((sum: number, inv: any) => {
        const amount = Number(inv.amount) || 0
        const roi =
          typeof inv.expectedROI === "string" ? Number.parseFloat(inv.expectedROI) || 0 : Number(inv.expectedROI) || 0
        return sum + Math.round(amount * (1 + roi / 100))
      }, 0)
      setTotalReturn(totalExpectedReturn)
    }

    loadInvestments()

    const handleStorageChange = () => loadInvestments()
    const handleProgressUpdate = () => loadInvestments()
    const handleInvestmentUpdate = () => loadInvestments()

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleStorageChange)
    window.addEventListener("webtoonProgressUpdate", handleProgressUpdate)
    window.addEventListener("userDataChanged", handleStorageChange)
    window.addEventListener("investmentUpdate", handleInvestmentUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleStorageChange)
      window.removeEventListener("webtoonProgressUpdate", handleProgressUpdate)
      window.removeEventListener("userDataChanged", handleStorageChange)
      window.removeEventListener("investmentUpdate", handleInvestmentUpdate)
    }
  }, [])

  const totalAssets = (userBalance || 0) + (totalReturn || 0)
  const profitLoss = (totalReturn || 0) - (totalInvestment || 0)
  const profitRate = totalInvestment > 0 ? ((profitLoss || 0) / totalInvestment) * 100 : 0

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
                <p className="text-3xl font-bold">{formatKoreanCurrency(totalAssets)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">현금</p>
                <p className="text-lg font-bold">{formatKoreanCurrency(userBalance)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">투자자산</p>
                <p className="text-lg font-bold">{formatKoreanCurrency(totalReturn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 수익률 - 개선된 시각화 */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${profitLoss >= 0 ? "bg-green/20" : "bg-red/20"}`}>
                    {profitLoss >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-darkblue dark:text-light">투자 수익 현황</h3>
                    <p className="text-sm text-gray">총 투자 대비 수익률</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${profitLoss >= 0 ? "bg-green/10" : "bg-red/10"}`}>
                  <span className={`text-lg font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {profitRate >= 0 ? "+" : ""}
                    {profitRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 dark:bg-darkblue/20 p-4 rounded-xl">
                    <p className="text-sm text-gray mb-1">총 투자금액</p>
                    <p className="text-xl font-bold text-darkblue dark:text-light">
                      {formatKoreanCurrency(totalInvestment)}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-darkblue/20 p-4 rounded-xl">
                    <p className="text-sm text-gray mb-1">예상 수익금</p>
                    <p className="text-xl font-bold text-darkblue dark:text-light">
                      {formatKoreanCurrency(totalReturn)}
                    </p>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-darkblue/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray">수익/손실</span>
                    <span className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {profitLoss >= 0 ? "+" : ""}
                      {formatKoreanCurrency(profitLoss)}
                    </span>
                  </div>

                  {/* 수익률 진행바 */}
                  <div className="mt-3">
                    <div className="h-3 bg-gray/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          profitRate >= 0
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : "bg-gradient-to-r from-red-400 to-red-600"
                        }`}
                        style={{ width: `${Math.min(Math.abs(profitRate), 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray mt-1">
                      <span>0%</span>
                      <span>{Math.abs(profitRate).toFixed(1)}%</span>
                    </div>
                  </div>
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

        {/* 투자 현황 */}
        <Card className="border-gray/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-darkblue dark:text-light">투자 현황</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push("/investments")}>
                <Eye className="h-4 w-4 mr-1" />
                전체보기
              </Button>
            </div>

            {investments.length > 0 ? (
              <div className="space-y-4">
                {investments.slice(0, 2).map((investment, index) => {
                  const currentValue = Math.round((investment.amount || 0) * (1 + (investment.expectedROI || 0) / 100))
                  const profit = currentValue - (investment.amount || 0)
                  const isProfit = profit > 0

                  return (
                    <div
                      key={investment.id || index}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-darkblue/20 dark:to-darkblue/10 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 border border-gray/10"
                      onClick={() => router.push(`/webtoon/${investment.id}`)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            investment.thumbnail ||
                            investment.webtoonThumbnail ||
                            getWebtoonImage(investment.id) ||
                            "/placeholder.svg?height=60&width=60&query=webtoon cover" ||
                            "/placeholder.svg"
                          }
                          alt={investment.title || investment.webtoonTitle}
                          className="w-16 h-16 rounded-xl object-cover shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=60&width=60&query=webtoon cover"
                          }}
                        />
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            investment.status === "진행중" || investment.status === "제작 중"
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : "bg-gradient-to-r from-blue-400 to-blue-500"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-darkblue dark:text-light text-sm truncate mb-1">
                          {investment.title || investment.webtoonTitle}
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-gray">투자금액</span>
                          <span className="text-sm font-medium text-darkblue dark:text-light">
                            {formatKoreanCurrency(investment.amount)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              investment.status === "진행중" || investment.status === "제작 중"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {investment.status}
                          </span>
                          <span className="text-xs text-gray">{investment.date}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className={`px-3 py-2 rounded-lg ${isProfit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
                        >
                          <p
                            className={`text-sm font-bold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {isProfit ? "+" : ""}
                            {formatKoreanCurrency(profit)}
                          </p>
                          <p
                            className={`text-xs ${isProfit ? "text-green-500 dark:text-green-500" : "text-red-500 dark:text-red-500"}`}
                          >
                            {isProfit ? "+" : ""}
                            {investment.expectedROI}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {investments.length > 2 && (
                  <div className="text-center pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashed border-2 hover:bg-blue/5"
                      onClick={() => router.push("/investments")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {investments.length - 2}개 더보기
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-darkblue dark:text-light mb-2">투자를 시작해보세요</h4>
                <p className="text-gray text-sm mb-4">
                  다양한 웹툰 프로젝트에 투자하고
                  <br />
                  수익을 창출해보세요
                </p>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="sm"
                  onClick={() => router.push("/webtoons")}
                >
                  투자 시작하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
