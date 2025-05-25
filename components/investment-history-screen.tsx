"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, TrendingUp, X, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { getUserFromStorage } from "@/lib/auth"

// 투자 성장 데이터 타입
interface MonthlyInvestmentData {
  month: string
  invested: number
  expectedReturn: number
}

interface Investment {
  id: string
  title: string
  amount: number
  progress: number
  expectedROI: number
  status: string
  expectedEndDate: string
  date: string
  investmentTime?: string
}

export function InvestmentHistoryScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [activeChartTab, setActiveChartTab] = useState("line")
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  // 투자 내역 로드
  useEffect(() => {
    const loadInvestments = () => {
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        const userInvestments = JSON.parse(investmentsStr)
        // 최신순으로 정렬
        const sortedInvestments = userInvestments.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.investmentTime || "2024-01-01")
          const dateB = new Date(b.date || b.investmentTime || "2024-01-01")
          return dateB.getTime() - dateA.getTime()
        })
        setInvestments(sortedInvestments)
      }
    }

    loadInvestments()

    // 투자 데이터 변경 감지
    const handleInvestmentUpdate = () => loadInvestments()
    window.addEventListener("investmentUpdate", handleInvestmentUpdate)
    window.addEventListener("storage", handleInvestmentUpdate)

    return () => {
      window.removeEventListener("investmentUpdate", handleInvestmentUpdate)
      window.removeEventListener("storage", handleInvestmentUpdate)
    }
  }, [])

  // 24시간 이내 투자인지 확인
  const canCancelInvestment = (investment: Investment) => {
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
        webtoonTitle: selectedInvestment.title,
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
        description: `${selectedInvestment.title} 투자가 취소되었습니다. ${selectedInvestment.amount.toLocaleString()}원이 환불됩니다.`,
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

  // 월별 투자 데이터
  const monthlyData: MonthlyInvestmentData[] = [
    { month: "1월", invested: 300000, expectedReturn: 345000 },
    { month: "2월", invested: 600000, expectedReturn: 690000 },
    { month: "3월", invested: 900000, expectedReturn: 1035000 },
    { month: "4월", invested: 1200000, expectedReturn: 1380000 },
    { month: "5월", invested: 1500000, expectedReturn: 1725000 },
  ]

  // 투자 카드 렌더링 함수
  const renderInvestmentCard = (investment: Investment) => {
    const canCancel = canCancelInvestment(investment)

    return (
      <Card
        key={investment.id}
        className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30"
        onClick={() => router.push(`/webtoon/${investment.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-darkblue dark:text-light">{investment.title}</h3>
              <p className="text-xs text-gray">{investment.status}</p>
              {canCancel && <p className="text-xs text-orange-600 font-medium mt-1">24시간 내 취소 가능</p>}
            </div>
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
                  <X className="h-3 w-3 mr-1" />
                  취소
                </Button>
              )}
              <ChevronRight className="h-5 w-5 text-gray" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="text-xs text-gray">투자 금액</p>
              <p className="font-medium text-darkblue dark:text-light">₩{investment.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray">예상 수익률</p>
              <p className="font-medium text-profit">{investment.expectedROI}%</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray">제작 진행도</p>
              <p className="text-xs text-darkblue dark:text-light">{investment.progress}%</p>
            </div>
            <Progress value={investment.progress} className="h-2 bg-gray/20" indicatorClassName="bg-yellow" />
          </div>

          <div>
            <p className="text-xs text-gray">투자일: {investment.date}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 라인 차트 렌더링
  const renderLineChart = () => {
    return (
      <div className="relative h-60 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray py-6">
          <span>200만</span>
          <span>150만</span>
          <span>100만</span>
          <span>50만</span>
          <span>0</span>
        </div>

        {/* 그래프 영역 */}
        <div className="ml-12 h-full relative">
          {/* 가로 그리드 라인 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute w-full border-t border-gray/10" style={{ top: `${i * 25}%` }}></div>
          ))}

          {/* 투자금액 라인 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={monthlyData
                .map((d, i) => `${(i / (monthlyData.length - 1)) * 100}% ${100 - (d.invested / 2000000) * 100}%`)
                .join(" ")}
              fill="none"
              stroke="#45858C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {monthlyData.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (monthlyData.length - 1)) * 100}%`}
                cy={`${100 - (d.invested / 2000000) * 100}%`}
                r="4"
                fill="#45858C"
              />
            ))}
          </svg>

          {/* 예상수익 라인 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={monthlyData
                .map((d, i) => `${(i / (monthlyData.length - 1)) * 100}% ${100 - (d.expectedReturn / 2000000) * 100}%`)
                .join(" ")}
              fill="none"
              stroke="#F9DF52"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {monthlyData.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (monthlyData.length - 1)) * 100}%`}
                cy={`${100 - (d.expectedReturn / 2000000) * 100}%`}
                r="4"
                fill="#F9DF52"
              />
            ))}
          </svg>

          {/* X축 레이블 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            {monthlyData.map((d, i) => (
              <span key={i} className="text-xs text-gray">
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 bg-light/80 dark:bg-darkblue/80 p-2 rounded-md text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green rounded-sm"></div>
            <span className="text-darkblue dark:text-light">투자금액</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-profit rounded-sm"></div>
            <span className="text-darkblue dark:text-light">예상수익</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 차트 영역 */}
      <div className="p-4">
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 border-b border-gray/10 flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-profit" />
              <h2 className="font-bold text-darkblue dark:text-light">수익률 차트</h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-yellow/20"
                onClick={() => setActiveChartTab("line")}
              >
                <TrendingUp className="h-4 w-4 text-darkblue dark:text-light" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">{renderLineChart()}</CardContent>
        </Card>
      </div>

      {/* 투자 내역 */}
      <div className="p-4">
        <h2 className="font-bold mb-4 text-darkblue dark:text-light">내 투자 목록</h2>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
            <TabsTrigger
              value="all"
              className={`rounded-full transition-all ${
                activeTab === "all"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              전체
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={`rounded-full transition-all ${
                activeTab === "active"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              진행중
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className={`rounded-full transition-all ${
                activeTab === "completed"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              완료
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {investments.map(renderInvestmentCard)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {investments
              .filter((inv) => inv.status === "제작 중" || inv.status === "사전 제작" || inv.status === "진행중")
              .map(renderInvestmentCard)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {investments.filter((inv) => inv.status === "완료").length > 0 ? (
              investments.filter((inv) => inv.status === "완료").map(renderInvestmentCard)
            ) : (
              <div className="flex items-center justify-center h-32 bg-light dark:bg-darkblue/20 rounded-xl">
                <p className="text-gray">완료된 투자가 없습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
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
                  <span className="text-lg font-bold text-blue-600">{selectedInvestment.title}</span>
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
