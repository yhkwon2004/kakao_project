"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Wallet, PieChart, BarChart3, ArrowDownRight, Eye, Plus, X, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { getUserFromStorage, getUserProfileImage } from "@/lib/auth"
import { formatKoreanCurrency } from "@/lib/format-currency"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

export function AssetScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalReturn, setTotalReturn] = useState(0)
  const [investments, setInvestments] = useState<any[]>([])
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadInvestments = () => {
      const user = getUserFromStorage()
      if (user && user.balance !== undefined) {
        setUserBalance(user.balance)
      }

      // Add this inside the loadInvestments function, after setting userBalance
      const currentUser = getUserFromStorage()
      setUser(currentUser)

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

  // 24시간 이내 투자인지 확인
  const canCancelInvestment = (investment: any) => {
    const investmentDate = new Date(investment.date || investment.investmentTime || "2024-01-01")
    const now = new Date()
    const hoursDiff = (now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff < 24
  }

  // 투자 취소 처리
  const handleCancelInvestment = () => {
    if (!selectedInvestment) return

    try {
      // 사용자 잔액 업데이트
      const user = getUserFromStorage()
      if (user) {
        user.balance = (user.balance || 0) + selectedInvestment.amount
        localStorage.setItem("currentUser", JSON.stringify(user))
      }

      // 투자 내역에서 제거
      const updatedInvestments = investments.filter((inv) => inv.id !== selectedInvestment.id)
      setInvestments(updatedInvestments)
      localStorage.setItem("userInvestments", JSON.stringify(updatedInvestments))

      // 웹툰 진행 상황 업데이트 (투자 금액 차감)
      const progressData = localStorage.getItem(`webtoon_progress_${selectedInvestment.id}`)
      if (progressData) {
        const data = JSON.parse(progressData)
        const newCurrentRaised = Math.max(0, data.currentRaised - selectedInvestment.amount)
        const newTotalInvestors = Math.max(0, data.totalInvestors - 1)

        const updatedProgressData = {
          currentRaised: newCurrentRaised,
          totalInvestors: newTotalInvestors,
          lastUpdated: new Date().toISOString(),
        }
        localStorage.setItem(`webtoon_progress_${selectedInvestment.id}`, JSON.stringify(updatedProgressData))
      }

      // 환불 내역 추가 (결제 내역에 표시용)
      const refundRecord = {
        id: `refund_${Date.now()}`,
        amount: selectedInvestment.amount,
        method: "투자 취소",
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        fee: 0,
        type: "refund",
        webtoonTitle: selectedInvestment.title || selectedInvestment.webtoonTitle,
      }

      const chargeHistoryStr = localStorage.getItem("chargeHistory")
      const chargeHistory = chargeHistoryStr ? JSON.parse(chargeHistoryStr) : []
      const updatedChargeHistory = [refundRecord, ...chargeHistory]
      localStorage.setItem("chargeHistory", JSON.stringify(updatedChargeHistory))

      // 이벤트 발생
      window.dispatchEvent(new Event("userDataChanged"))
      window.dispatchEvent(new Event("investmentUpdate"))
      window.dispatchEvent(
        new CustomEvent("webtoonProgressUpdate", {
          detail: { webtoonId: selectedInvestment.id },
        }),
      )

      toast({
        title: "투자 취소 완료",
        description: `${selectedInvestment.title || selectedInvestment.webtoonTitle} 투자가 취소되었습니다. ${selectedInvestment.amount.toLocaleString()}원이 환불됩니다.`,
      })

      setIsCancelModalOpen(false)
      setSelectedInvestment(null)
    } catch (error) {
      toast({
        title: "취소 실패",
        description: "투자 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const totalAssets = (userBalance || 0) + (totalReturn || 0)
  const profitLoss = (totalReturn || 0) - (totalInvestment || 0)
  const profitRate = totalInvestment > 0 ? ((profitLoss || 0) / totalInvestment) * 100 : 0

  const getWebtoonImage = (id: string) => {
    const imageMap: { [key: string]: string } = {
      "bad-secretary": "/webtoons/나쁜-비서.png",
      "blood-sword-family-hunting-dog": "/images/철혈검가-사냥개의-회귀.png",
      // 기타 웹툰 맵 추가 가능
    }
    return imageMap[id] || "/placeholder.svg?height=60&width=60"
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F9F9F9] to-[#E5E4DC] dark:from-[#323233] dark:via-[#3F3F3F] dark:to-[#383B4B]">
      {/* ✅ 헤더 - 뒤로가기 버튼 제거됨 */}
      <div className="h-16 flex justify-between items-center px-4 bg-[#F9F9F9]/90 dark:bg-[#3F3F3F]/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#C2BDAD] dark:border-[#454858]">
        <div className="flex items-center">
          {/* 삭제된 뒤로가기 버튼 */}
          <Logo size="sm" showSubtitle={false} />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-10 w-10 bg-[#E5E4DC] dark:bg-[#454858] border border-[#C2BDAD] dark:border-[#989898] ring-2 ring-yellow/20 hover:ring-yellow/40 transition-all duration-200 shadow-sm">
            <AvatarImage src={getUserProfileImage(user) || "/placeholder.svg"} alt="프로필" className="object-cover" />
            <AvatarFallback className="text-[#323233] dark:text-[#F5D949]">
              <img
                src="/images/guest-profile.jpeg"
                alt="게스트 프로필"
                className="w-full h-full object-cover rounded-full"
              />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      <div className="flex-1 p-4 pb-24 space-y-6 overflow-y-auto">
        {/* 자산 카드 */}
        <Card className="bg-gradient-to-br from-[#5F859F] to-[#58678C] text-[#F9F9F9] border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#E5E4DC] text-sm font-medium">총 자산</p>
                <p className="text-3xl font-bold">{formatKoreanCurrency(totalAssets)}</p>
              </div>
              <div className="bg-[#F9F9F9]/20 p-3 rounded-full">
                <Wallet className="h-6 w-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#F9F9F9]/10 rounded-xl p-3">
                <p className="text-[#E5E4DC] text-xs font-medium">현금</p>
                <p className="text-lg font-bold">{formatKoreanCurrency(userBalance)}</p>
              </div>
              <div className="bg-[#F9F9F9]/10 rounded-xl p-3">
                <p className="text-[#E5E4DC] text-xs font-medium">투자자산</p>
                <p className="text-lg font-bold">{formatKoreanCurrency(totalReturn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 수익률 - 개선된 시각화 */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[#F9DF52]/20 to-[#F5C882]/20 dark:from-[#4F8F78]/20 dark:to-[#848954]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${profitLoss >= 0 ? "bg-[#4F8F78]/20" : "bg-[#D16561]/20"}`}>
                    {profitLoss >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-[#4F8F78]" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 text-[#D16561]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">투자 수익 현황</h3>
                    <p className="text-sm text-[#989898]">총 투자 대비 수익률</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${profitLoss >= 0 ? "bg-[#4F8F78]/10" : "bg-[#D16561]/10"}`}>
                  <span className={`text-lg font-bold ${profitLoss >= 0 ? "text-[#4F8F78]" : "text-[#D16561]"}`}>
                    {profitRate >= 0 ? "+" : ""}
                    {profitRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F9F9F9]/60 dark:bg-[#3F3F3F]/20 p-4 rounded-xl">
                    <p className="text-sm text-[#989898] mb-1">총 투자금액</p>
                    <p className="text-xl font-bold text-[#323233] dark:text-[#F5D949]">
                      {formatKoreanCurrency(totalInvestment)}
                    </p>
                  </div>
                  <div className="bg-[#F9F9F9]/60 dark:bg-[#3F3F3F]/20 p-4 rounded-xl">
                    <p className="text-sm text-[#989898] mb-1">예상 수익금</p>
                    <p className="text-xl font-bold text-[#323233] dark:text-[#F5D949]">
                      {formatKoreanCurrency(totalReturn)}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F9F9F9]/60 dark:bg-[#3F3F3F]/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#989898]">수익/손실</span>
                    <span className={`text-2xl font-bold ${profitLoss >= 0 ? "text-[#4F8F78]" : "text-[#D16561]"}`}>
                      {profitLoss >= 0 ? "+" : ""}
                      {formatKoreanCurrency(profitLoss)}
                    </span>
                  </div>

                  {/* 수익률 진행바 */}
                  <div className="mt-3">
                    <div className="h-3 bg-[#C2BDAD]/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${
                          profitRate >= 0
                            ? "bg-gradient-to-r from-[#4F8F78] to-[#848954]"
                            : "bg-gradient-to-r from-[#D16561] to-[#DD8369]"
                        }`}
                        style={{ width: `${Math.min(Math.abs(profitRate), 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[#989898] mt-1">
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
            className="h-16 flex-col gap-2 border-2 border-[#5F859F] text-[#5F859F] hover:bg-[#5F859F]/5 hover:border-[#5F859F]/30"
            onClick={() => router.push("/webtoons")}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">투자하기</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex-col gap-2 border-2 border-[#4F8F78] text-[#4F8F78] hover:bg-[#4F8F78]/5 hover:border-[#4F8F78]/30"
            onClick={() => router.push("/asset/visualization")}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium">분석</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 flex-col gap-2 border-2 border-[#706FB9] text-[#706FB9] hover:bg-[#706FB9]/5 hover:border-[#706FB9]/30"
            onClick={() => router.push("/mypage/payment")}
          >
            <Wallet className="h-5 w-5" />
            <span className="text-xs font-medium">충전</span>
          </Button>
        </div>

        {/* 투자 현황 */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] shadow-lg bg-[#F9F9F9] dark:bg-[#3F3F3F]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">투자 현황</h3>
              <Button variant="ghost" size="sm" onClick={() => router.push("/investments")}>
                <Eye className="h-4 w-4 mr-1 text-[#5F859F]" />
                <span className="text-[#5F859F]">전체보기</span>
              </Button>
            </div>

            {investments.length > 0 ? (
              <div className="space-y-4">
                {investments.slice(0, 2).map((investment, index) => {
                  const currentValue = Math.round((investment.amount || 0) * (1 + (investment.expectedROI || 0) / 100))
                  const profit = currentValue - (investment.amount || 0)
                  const isProfit = profit > 0
                  const canCancel = canCancelInvestment(investment)

                  return (
                    <div
                      key={investment.id || index}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#F9F9F9] to-[#E5E4DC] dark:from-[#3F3F3F]/20 dark:to-[#383B4B]/10 rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 border border-[#C2BDAD] dark:border-[#454858]"
                      onClick={() => router.push(`/webtoon/${investment.id}`)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            investment.thumbnail ||
                            investment.webtoonThumbnail ||
                            getWebtoonImage(investment.id) ||
                            "/placeholder.svg?height=60&width=60&query=webtoon cover" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={investment.title || investment.webtoonTitle}
                          className="w-16 h-16 rounded-xl object-cover shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=60&width=60"
                          }}
                        />
                        <div
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#F9F9F9] shadow-sm ${
                            investment.status === "진행중" || investment.status === "제작 중"
                              ? "bg-gradient-to-r from-[#4F8F78] to-[#848954]"
                              : "bg-gradient-to-r from-[#5F859F] to-[#58678C]"
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#323233] dark:text-[#F5D949] text-sm truncate mb-1">
                          {investment.title || investment.webtoonTitle}
                        </h4>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs text-[#989898]">투자금액</span>
                          <span className="text-sm font-medium text-[#323233] dark:text-[#F5D949]">
                            {formatKoreanCurrency(investment.amount)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              investment.status === "진행중" || investment.status === "제작 중"
                                ? "bg-[#4F8F78]/10 text-[#4F8F78] dark:bg-[#4F8F78]/30 dark:text-[#848954]"
                                : "bg-[#5F859F]/10 text-[#5F859F] dark:bg-[#5F859F]/30 dark:text-[#58678C]"
                            }`}
                          >
                            {investment.status}
                          </span>
                          <span className="text-xs text-[#989898]">{investment.date}</span>
                          {canCancel && <span className="text-xs text-orange-600 font-medium">취소가능</span>}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedInvestment(investment)
                                setIsCancelModalOpen(true)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg ${isProfit ? "bg-[#4F8F78]/10 dark:bg-[#4F8F78]/20" : "bg-[#D16561]/10 dark:bg-[#D16561]/20"}`}
                          >
                            <p
                              className={`text-sm font-bold ${isProfit ? "text-[#4F8F78] dark:text-[#848954]" : "text-[#D16561] dark:text-[#DD8369]"}`}
                            >
                              {isProfit ? "+" : ""}
                              {formatKoreanCurrency(profit)}
                            </p>
                            <p
                              className={`text-xs ${isProfit ? "text-[#4F8F78] dark:text-[#848954]" : "text-[#D16561] dark:text-[#DD8369]"}`}
                            >
                              {isProfit ? "+" : ""}
                              {investment.expectedROI}%
                            </p>
                          </div>
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
                      className="border-dashed border-2 border-[#5F859F] text-[#5F859F] hover:bg-[#5F859F]/5"
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
                <div className="w-16 h-16 bg-gradient-to-br from-[#5F859F]/20 to-[#706FB9]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-[#5F859F]" />
                </div>
                <h4 className="font-semibold text-[#323233] dark:text-[#F5D949] mb-2">투자를 시작해보세요</h4>
                <p className="text-[#989898] text-sm mb-4">
                  다양한 웹툰 프로젝트에 투자하고
                  <br />
                  수익을 창출해보세요
                </p>
                <Button
                  className="bg-gradient-to-r from-[#5F859F] to-[#706FB9] hover:from-[#58678C] hover:to-[#706FB9] text-[#F9F9F9]"
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

      {/* 투자 취소 확인 모달 */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white drop-shadow-sm" />
            </div>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">투자 취소</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              정말로 이 투자를 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedInvestment && (
            <div className="space-y-3 mb-4">
              <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-darkblue dark:text-light">웹툰</span>
                  <span className="text-lg font-bold text-blue-600">
                    {selectedInvestment.title || selectedInvestment.webtoonTitle}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red/10 to-red/5 p-3 rounded-xl border border-red/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-darkblue dark:text-light">환불 금액</span>
                  <span className="text-lg font-bold text-red-600">₩{selectedInvestment.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-3 rounded-xl border border-yellow/20">
                <div className="text-center">
                  <p className="text-sm text-yellow-600 font-medium">취소 후 환불 처리까지 1-2일 소요될 수 있습니다.</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={handleCancelInvestment}
              className="w-full h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              투자 취소하기
            </Button>
            <Button
              onClick={() => setIsCancelModalOpen(false)}
              variant="outline"
              className="w-full h-11 border-2 border-gray/30 text-gray-600 hover:bg-gray/10 font-semibold rounded-xl transition-all duration-200"
            >
              계속 투자하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
