"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, TrendingUp, Calendar } from "lucide-react"
import { Logo } from "@/components/logo"

interface Investment {
  id: string
  title: string
  thumbnail: string
  amount: number
  expectedROI: number
  status: string
  date: string
  progress?: number
}

export function InvestmentListScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [investments, setInvestments] = useState<Investment[]>([])

  useEffect(() => {
    const loadInvestments = () => {
      // 투자 내역 로드
      const investmentsStr = localStorage.getItem("userInvestments")
      let userInvestments: Investment[] = []

      if (investmentsStr) {
        userInvestments = JSON.parse(investmentsStr)
      } else {
        // 기본 투자 데이터 설정
        userInvestments = [
          {
            id: "bad-secretary",
            title: "나쁜 비서",
            thumbnail: "/webtoons/나쁜-비서.png",
            amount: 300000,
            expectedROI: 15,
            status: "완료",
            date: "2024-01-15",
            progress: 100,
          },
          {
            id: "blood-sword-family-hunting-dog",
            title: "철혈검가 사냥개의 회귀",
            thumbnail: "/images/철혈검가-사냥개의-회귀.png",
            amount: 500000,
            expectedROI: 20,
            status: "완료",
            date: "2024-01-10",
            progress: 100,
          },
          {
            id: "princess-imprinting-traitor",
            title: "황녀, 반역자를 각인시키다",
            thumbnail: "/placeholder.svg?height=80&width=80&query=princess fantasy webtoon",
            amount: 250000,
            expectedROI: 18,
            status: "진행중",
            date: "2024-02-01",
            progress: 65,
          },
          {
            id: "becoming-family-head-this-life",
            title: "이번 생은 가주가 되겠습니다",
            thumbnail: "/webtoons/이번생은-가주가-되겠습니다.png",
            amount: 400000,
            expectedROI: 22,
            status: "진행중",
            date: "2024-02-05",
            progress: 72,
          },
        ]
        localStorage.setItem("userInvestments", JSON.stringify(userInvestments))
      }

      setInvestments(userInvestments)
    }

    loadInvestments()

    // localStorage 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userInvestments") {
        loadInvestments()
      }
    }

    // 페이지 포커스 시 데이터 새로고침
    const handleFocus = () => {
      loadInvestments()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const renderInvestmentCard = (investment: Investment) => {
    const currentValue = Math.round(investment.amount * (1 + investment.expectedROI / 100))
    const profit = currentValue - investment.amount
    const isProfit = profit > 0

    return (
      <Card
        key={investment.id}
        className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-gray/20 bg-light dark:bg-darkblue/30"
        onClick={() => router.push(`/webtoon/${investment.id}`)}
      >
        <CardContent className="p-0">
          <div className="flex">
            <div className="relative w-20 h-24 flex-shrink-0">
              <img
                src={investment.thumbnail || "/placeholder.svg?height=80&width=80&query=webtoon cover"}
                alt={investment.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&query=webtoon cover"
                }}
              />
              <div
                className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  investment.status === "진행중"
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-blue-400 to-blue-500"
                }`}
              />
            </div>

            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-darkblue dark:text-light mb-1 text-sm leading-tight">
                    {investment.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>투자일: {investment.date}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    investment.status === "완료"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {investment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray">투자 금액</p>
                  <p className="font-medium text-darkblue dark:text-light text-sm">
                    {investment.amount.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray">현재 가치</p>
                  <p className="font-medium text-darkblue dark:text-light text-sm">{currentValue.toLocaleString()}원</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray">수익/손실</p>
                  <p className={`font-medium text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>
{profit.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray">수익률</p>
                  <p className={`font-medium text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>

                    {investment.expectedROI}%
                  </p>
                </div>
              </div>

              {investment.status === "진행중" && investment.progress && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray">제작 진행도</p>
                    <p className="text-xs text-darkblue dark:text-light">{investment.progress}%</p>
                  </div>
                  <div className="relative">
                    <Progress value={investment.progress} className="h-2 bg-gray/20" />
                    <div
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${investment.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredInvestments = investments.filter((investment) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return investment.status === "진행중"
    if (activeTab === "completed") return investment.status === "완료"
    return true
  })

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + Math.round(inv.amount * (1 + inv.expectedROI / 100)),
    0,
  )
  const totalProfit = totalCurrentValue - totalInvested
  const totalProfitRate = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10 bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 투자 요약 */}
      <div className="p-4">
        <Card className="rounded-xl mb-6 border-gray/20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <CardHeader className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="font-bold">투자 포트폴리오</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-xs font-medium">총 투자금액</p>
                <p className="text-xl font-bold">{totalInvested.toLocaleString()}원</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs font-medium">현재 가치</p>
                <p className="text-xl font-bold">{totalCurrentValue.toLocaleString()}원</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-blue-100 text-xs font-medium">총 수익</p>
                <p className={`text-lg font-bold ${totalProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
{totalProfit.toLocaleString()}원
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-xs font-medium">수익률</p>
                <p className={`text-lg font-bold ${totalProfitRate >= 0 ? "text-green-300" : "text-red-300"}`}>

                  {totalProfitRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 투자 목록 */}
      <div className="p-4">
        <h2 className="font-bold mb-4 text-darkblue dark:text-light">투자 내역</h2>

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
              전체 ({investments.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={`rounded-full transition-all ${
                activeTab === "active"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              진행중 ({investments.filter((inv) => inv.status === "진행중").length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className={`rounded-full transition-all ${
                activeTab === "completed"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              완료 ({investments.filter((inv) => inv.status === "완료").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredInvestments.map(renderInvestmentCard)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filteredInvestments.map(renderInvestmentCard)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredInvestments.map(renderInvestmentCard)}
          </TabsContent>
        </Tabs>

        {filteredInvestments.length === 0 && (
          <div className="flex items-center justify-center h-32 bg-light dark:bg-darkblue/20 rounded-xl">
            <p className="text-gray">해당 조건의 투자 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
