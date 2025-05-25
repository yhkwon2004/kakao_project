"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, TrendingUp, Calendar, Target, CheckCircle, Clock, Zap } from "lucide-react"
import { Logo } from "@/components/logo"
import { formatKoreanCurrency } from "@/lib/format-currency"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage, isGuestAccount } from "@/lib/auth"
import { getInvestments } from "@/lib/db"

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
    const loadInvestments = async () => {
      const user = getUserFromStorage()
      if (!user) {
        setInvestments([])
        return
      }

      try {
        // DB에서 투자 내역 로드
        const dbInvestments = await getInvestments(user.id || user.email)

        if (dbInvestments && dbInvestments.length > 0) {
          // DB 데이터를 Investment 형태로 변환
          const formattedInvestments = dbInvestments.map((inv: any) => ({
            id: inv.webtoon_id,
            title: getWebtoonById(inv.webtoon_id)?.title || "알 수 없는 웹툰",
            thumbnail: getWebtoonById(inv.webtoon_id)?.thumbnail || "/placeholder.svg",
            amount: inv.amount,
            expectedROI: inv.roi || getWebtoonById(inv.webtoon_id)?.expectedROI || 15,
            status: inv.status === "completed" ? "완료" : "진행중",
            date: new Date(inv.created_at).toISOString().split("T")[0],
            progress: inv.status === "completed" ? 100 : 75,
          }))

          // 최신순으로 정렬
          formattedInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setInvestments(formattedInvestments)
          return
        }

        // localStorage에서 투자 내역 로드 (fallback)
        const investmentsStr = localStorage.getItem("userInvestments")
        let userInvestments: Investment[] = []

        if (investmentsStr) {
          userInvestments = JSON.parse(investmentsStr)
        } else {
          // 게스트 계정인 경우에만 기본 투자 데이터 설정
          if (isGuestAccount(user.email)) {
            userInvestments = [
              {
                id: "bad-secretary",
                title: "나쁜 비서",
                thumbnail: "/webtoons/나쁜-비서.png",
                amount: 300000,
                expectedROI: 25,
                status: "완료",
                date: "2024-01-15",
                progress: 100,
              },
              {
                id: "blood-sword-family-hunting-dog",
                title: "철혈검가 사냥개의 회귀",
                thumbnail: "/images/철혈검가-사냥개의-회귀.png",
                amount: 500000,
                expectedROI: 30,
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
          } else {
            // 일반 유저는 빈 배열로 시작
            userInvestments = []
          }
        }

        // 웹툰 데이터와 병합하여 썸네일과 제목 업데이트
        userInvestments = userInvestments.map((investment) => {
          const webtoonData = getWebtoonById(investment.id)
          return {
            ...investment,
            title: webtoonData?.title || investment.title,
            thumbnail: webtoonData?.thumbnail || investment.thumbnail,
            expectedROI: investment.expectedROI || webtoonData?.expectedROI || 15,
            status: investment.status || "진행중",
            progress: investment.progress || 0,
          }
        })

        // 최신순으로 정렬 (날짜 기준 내림차순)
        userInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setInvestments(userInvestments)
      } catch (error) {
        console.error("Error loading investments:", error)
        setInvestments([])
      }
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

    // 투자 업데이트 이벤트 처리
    const handleInvestmentUpdate = () => {
      loadInvestments()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("investmentUpdate", handleInvestmentUpdate)
    window.addEventListener("userDataChanged", handleFocus)
    window.addEventListener("userDataChanged", handleFocus)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("investmentUpdate", handleInvestmentUpdate)
      window.removeEventListener("userDataChanged", handleFocus)
    }
  }, [])

  const renderInvestmentCard = (investment: Investment) => {
    const currentValue = Math.round(
      (Number(investment.amount) || 0) * (1 + (Number(investment.expectedROI) || 0) / 100),
    )
    const profit = currentValue - (Number(investment.amount) || 0)
    const isProfit = profit > 0
    const isCompleted = investment.status === "완료"

    return (
      <Card
        key={investment.id}
        className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-darkblue/30 dark:to-darkblue/10 shadow-lg"
        onClick={() => router.push(`/webtoon/${investment.id}`)}
      >
        <CardContent className="p-0">
          <div className="flex">
            <div className="relative w-24 h-28 flex-shrink-0">
              <img
                src={
                  investment.thumbnail?.startsWith("http")
                    ? investment.thumbnail
                    : investment.thumbnail || "/placeholder.svg?height=80&width=80&query=webtoon cover"
                }
                alt={investment.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80&query=webtoon cover"
                }}
              />

              {/* 상태 뱃지 */}
              <div className="absolute top-2 right-2">
                {isCompleted ? (
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-1.5 rounded-full shadow-lg">
                    <Clock className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* 수익률 뱃지 */}
              <div className="absolute bottom-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-dark px-2 py-1 rounded-full shadow-lg">
                <span className="text-xs font-bold">+{investment.expectedROI}%</span>
              </div>
            </div>

            <div className="flex-1 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-darkblue dark:text-light mb-1 text-base leading-tight">
                    {investment.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>투자일: {investment.date}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ml-2 shadow-sm ${
                    isCompleted
                      ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {investment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
                  <p className="text-xs text-gray mb-1">투자 금액</p>
                  <p className="font-bold text-darkblue dark:text-light text-sm">
                    {formatKoreanCurrency(investment.amount || 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple/10 to-purple/5 p-3 rounded-xl border border-purple/20">
                  <p className="text-xs text-gray mb-1">현재 가치</p>
                  <p className="font-bold text-darkblue dark:text-light text-sm">
                    {formatKoreanCurrency(currentValue)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-3">
                <div
                  className={`p-3 rounded-xl border ${
                    isProfit
                      ? "bg-gradient-to-r from-green/10 to-green/5 border-green/20"
                      : "bg-gradient-to-r from-red/10 to-red/5 border-red/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${isProfit ? "bg-green/20" : "bg-red/20"}`}>
                        {isProfit ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                        )}
                      </div>
                      <span className="text-xs text-gray">수익/손실</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isProfit ? "text-green-600" : "text-red-500"}`}>
                        {isProfit ? "+" : ""}
                        {formatKoreanCurrency(profit)}
                      </p>
                      <p className={`text-xs ${isProfit ? "text-green-600" : "text-red-500"}`}>
                        {isProfit ? "+" : ""}
                        {investment.expectedROI}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {investment.status === "진행중" && investment.progress && (
                <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-3 rounded-xl border border-yellow/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-yellow-600" />
                      <p className="text-xs text-gray">제작 진행도</p>
                    </div>
                    <p className="text-xs font-bold text-darkblue dark:text-light">{investment.progress}%</p>
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

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + Math.round((inv.amount || 0) * (1 + (inv.expectedROI || 0) / 100)),
    0,
  )
  const totalProfit = totalCurrentValue - totalInvested
  const totalProfitRate = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

  return (
    <div className="flex flex-col pb-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10 bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm sticky top-0 z-40">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 투자 요약 - 개선된 시각화 */}
      <div className="p-4">
        <Card className="rounded-2xl mb-6 border-0 bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">투자 포트폴리오</h2>
                <p className="text-blue-100 text-sm">전체 투자 현황</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">총 투자금액</p>
                <p className="text-xl font-bold">{formatKoreanCurrency(totalInvested)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-100 text-xs font-medium">현재 가치</p>
                <p className="text-xl font-bold">{formatKoreanCurrency(totalCurrentValue)}</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-blue-100 text-xs font-medium">총 수익</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {totalProfit >= 0 ? "+" : ""}
                    {formatKoreanCurrency(totalProfit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs font-medium">수익률</p>
                  <p className={`text-2xl font-bold ${totalProfitRate >= 0 ? "text-green-300" : "text-red-300"}`}>
                    {totalProfitRate >= 0 ? "+" : ""}
                    {totalProfitRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* 수익률 진행바 */}
              <div className="mt-3">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      totalProfitRate >= 0
                        ? "bg-gradient-to-r from-green-300 to-green-400"
                        : "bg-gradient-to-r from-red-300 to-red-400"
                    }`}
                    style={{ width: `${Math.min(Math.abs(totalProfitRate), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-100 mt-1">
                  <span>0%</span>
                  <span>{Math.abs(totalProfitRate).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 투자 목록 */}
      <div className="p-4">
        <h2 className="font-bold mb-4 text-darkblue dark:text-light">투자 내역</h2>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-white/60 dark:bg-darkblue/20 p-1 rounded-2xl shadow-lg">
            <TabsTrigger
              value="all"
              className={`rounded-xl transition-all font-medium ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              전체 ({investments.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={`rounded-xl transition-all font-medium ${
                activeTab === "active"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              진행중 ({investments.filter((inv) => inv.status === "진행중").length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className={`rounded-xl transition-all font-medium ${
                activeTab === "completed"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
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
          <div className="flex flex-col items-center justify-center h-32 bg-gradient-to-br from-white to-gray-50 dark:bg-darkblue/20 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-gray font-medium">해당 조건의 투자 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
