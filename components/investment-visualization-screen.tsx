"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, TrendingUp, PieChart, BarChart3, Calendar, Target, Clock, Star } from "lucide-react"
import { Logo } from "@/components/logo"
import { formatKoreanCurrency } from "@/lib/format-currency"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage } from "@/lib/auth"

interface InvestmentData {
  id: string
  title: string
  amount: number
  percentage: number
  expectedROI: number
  currentROI: number
  status: string
  date: string
  color: string
}

export function InvestmentVisualizationScreen() {
  const router = useRouter()
  const [investments, setInvestments] = useState<InvestmentData[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalCurrentValue, setTotalCurrentValue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [averageROI, setAverageROI] = useState(0)

  const getFontSizeForAmount = (amount: number) => {
    const amountStr = formatKoreanCurrency(amount)
    if (amountStr.length > 12) return "text-sm"
    if (amountStr.length > 10) return "text-base"
    if (amountStr.length > 8) return "text-lg"
    return "text-xl"
  }

  const colors = [
    "#F9DF52", // 노란색
    "#4F8F78", // 초록색
    "#5F859F", // 파란색
    "#706FB9", // 보라색
    "#D16561", // 빨간색
    "#F5C882", // 주황색
    "#6CB9B1", // 청록색
    "#B19CD9", // 연보라색
  ]

  useEffect(() => {
    const loadInvestmentData = () => {
      const user = getUserFromStorage()
      if (!user) return

      // localStorage에서 투자 데이터 로드
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        const userInvestments = JSON.parse(investmentsStr)

        // 투자 데이터 처리
        const processedInvestments = userInvestments.map((inv: any, index: number) => {
          const webtoonData = getWebtoonById(inv.id)
          const currentROI = inv.currentROI || webtoonData?.currentROI || Math.floor(Math.random() * 20) + 5

          return {
            id: inv.id,
            title: webtoonData?.title || inv.title,
            amount: inv.amount,
            percentage: 0, // 아래에서 계산
            expectedROI: inv.expectedROI || webtoonData?.expectedROI || 15,
            currentROI,
            status: inv.status || "진행중",
            date: inv.date || inv.investmentTime || new Date().toISOString().split("T")[0],
            color: colors[index % colors.length],
          }
        })

        // 총 투자 금액 계산
        const total = processedInvestments.reduce((sum: number, inv: InvestmentData) => sum + inv.amount, 0)

        // 각 투자의 비율 계산
        const investmentsWithPercentage = processedInvestments.map((inv: InvestmentData) => ({
          ...inv,
          percentage: total > 0 ? (inv.amount / total) * 100 : 0,
        }))

        setInvestments(investmentsWithPercentage)
        setTotalInvestment(total)

        // 현재 가치 및 수익 계산
        const currentValue = investmentsWithPercentage.reduce(
          (sum: number, inv: InvestmentData) => sum + Math.round(inv.amount * (1 + inv.currentROI / 100)),
          0,
        )
        const profit = currentValue - total
        const avgROI =
          investmentsWithPercentage.length > 0
            ? investmentsWithPercentage.reduce((sum: number, inv: InvestmentData) => sum + inv.currentROI, 0) /
              investmentsWithPercentage.length
            : 0

        setTotalCurrentValue(currentValue)
        setTotalProfit(profit)
        setAverageROI(avgROI)
      } else {
        // 투자 데이터가 없는 경우 초기화
        setInvestments([])
        setTotalInvestment(0)
        setTotalCurrentValue(0)
        setTotalProfit(0)
        setAverageROI(0)
      }
    }

    loadInvestmentData()

    // 데이터 변경 감지
    const handleDataChange = () => {
      loadInvestmentData()
    }

    window.addEventListener("storage", handleDataChange)
    window.addEventListener("investmentUpdate", handleDataChange)
    window.addEventListener("userDataChanged", handleDataChange)

    return () => {
      window.removeEventListener("storage", handleDataChange)
      window.removeEventListener("investmentUpdate", handleDataChange)
      window.removeEventListener("userDataChanged", handleDataChange)
    }
  }, [])

  // 파이 차트 SVG 생성
  const generatePieChart = () => {
    if (investments.length === 0) return null

    const radius = 80
    const centerX = 100
    const centerY = 100
    let currentAngle = 0

    return (
      <svg width="200" height="200" className="mx-auto">
        {investments.map((investment, index) => {
          const angle = (investment.percentage / 100) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle

          const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
          const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
          const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
          const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

          const largeArcFlag = angle > 180 ? 1 : 0

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ")

          currentAngle += angle

          return (
            <path
              key={investment.id}
              d={pathData}
              fill={investment.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => router.push(`/webtoon/${investment.id}`)}
            />
          )
        })}

        {/* 중앙 원 */}
        <circle cx={centerX} cy={centerY} r="30" fill="white" stroke="#E5E4DC" strokeWidth="2" />
        <text x={centerX} y={centerY - 5} textAnchor="middle" className="text-xs font-bold fill-[#323233]">
          총 투자
        </text>
        <text x={centerX} y={centerY + 8} textAnchor="middle" className="text-xs fill-[#989898]">
          {investments.length}개
        </text>
      </svg>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-gradient-to-br from-[#FAFAFA] to-[#F0F0F0] dark:from-[#323233] dark:to-[#2A2A2B]">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-[#C2BDAD]/20 bg-[#FAFAFA]/80 dark:bg-[#3F3F3F]/80 backdrop-blur-sm sticky top-0 z-40 h-16">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 text-[#58678C]" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      <div className="p-4 space-y-6">
        {/* 투자 요약 카드 */}
        <Card className="bg-gradient-to-br from-[#5F859F] to-[#706FB9] text-white border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <PieChart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">투자 포트폴리오</h2>
                <p className="text-white/80 text-sm">시각화된 투자 현황</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/80 text-xs font-medium">총 투자금액</p>
                <p className={`${getFontSizeForAmount(totalInvestment)} font-bold truncate`}>
                  {formatKoreanCurrency(totalInvestment)}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/80 text-xs font-medium">현재 가치</p>
                <p className={`${getFontSizeForAmount(totalCurrentValue)} font-bold truncate`}>
                  {formatKoreanCurrency(totalCurrentValue)}
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-white/80 text-xs font-medium">총 수익</p>
                  <p
                    className={`${getFontSizeForAmount(Math.abs(totalProfit))} font-bold ${totalProfit >= 0 ? "text-[#F9DF52]" : "text-[#D16561]"} truncate`}
                  >
                    {totalProfit >= 0 ? "+" : ""}
                    {formatKoreanCurrency(totalProfit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs font-medium">평균 수익률</p>
                  <p className={`text-2xl font-bold ${averageROI >= 0 ? "text-[#F9DF52]" : "text-[#D16561]"}`}>
                    {averageROI >= 0 ? "+" : ""}
                    {averageROI.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    totalProfit >= 0
                      ? "bg-gradient-to-r from-[#F9DF52] to-[#F5C882]"
                      : "bg-gradient-to-r from-[#D16561] to-[#E57373]"
                  }`}
                  style={{ width: `${Math.min(Math.abs(averageROI), 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 시각화 탭 */}
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#E5E4DC] dark:bg-[#383B4B] p-1 rounded-xl">
            <TabsTrigger
              value="pie"
              className="rounded-lg data-[state=active]:bg-[#F9DF52] data-[state=active]:text-[#323233] text-[#989898]"
            >
              <PieChart className="h-4 w-4 mr-2" />
              파이 차트
            </TabsTrigger>
            <TabsTrigger
              value="bar"
              className="rounded-lg data-[state=active]:bg-[#F9DF52] data-[state=active]:text-[#323233] text-[#989898]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              막대 차트
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-4">
            {investments.length > 0 ? (
              <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F] shadow-lg">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">투자 비율 분포</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 파이 차트 */}
                  <div className="flex justify-center">{generatePieChart()}</div>

                  {/* 범례 */}
                  <div className="space-y-3">
                    {investments.map((investment) => (
                      <div
                        key={investment.id}
                        className="flex items-center justify-between p-3 bg-[#F9F9F9] dark:bg-[#383B4B] rounded-lg cursor-pointer hover:bg-[#E5E4DC] dark:hover:bg-[#454858] transition-colors"
                        onClick={() => router.push(`/webtoon/${investment.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: investment.color }} />
                          <div>
                            <p className="font-medium text-[#323233] dark:text-[#F5D949] text-sm">{investment.title}</p>
                            <p className="text-xs text-[#989898]">
                              {investment.date} • {investment.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`${getFontSizeForAmount(investment.amount)} font-bold text-[#323233] dark:text-[#F5D949] truncate`}
                          >
                            {formatKoreanCurrency(investment.amount)}
                          </p>
                          <p className="text-xs text-[#989898]">{investment.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-[#E5E4DC] dark:bg-[#454858] rounded-full flex items-center justify-center mb-4">
                    <PieChart className="h-8 w-8 text-[#989898]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#323233] dark:text-[#F5D949] mb-2">투자 데이터가 없습니다</h3>
                  <p className="text-[#989898] text-center mb-4">투자를 시작하면 여기에 차트가 표시됩니다.</p>
                  <Button
                    onClick={() => router.push("/webtoons")}
                    className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233]"
                  >
                    투자하러 가기
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            {investments.length > 0 ? (
              <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F] shadow-lg">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">투자 금액 비교</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investments
                    .sort((a, b) => b.amount - a.amount)
                    .map((investment, index) => {
                      const maxAmount = Math.max(...investments.map((inv) => inv.amount))
                      const barWidth = (investment.amount / maxAmount) * 100

                      return (
                        <div
                          key={investment.id}
                          className="space-y-2 cursor-pointer hover:bg-[#F9F9F9] dark:hover:bg-[#383B4B] p-3 rounded-lg transition-colors"
                          onClick={() => router.push(`/webtoon/${investment.id}`)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#989898] w-6">#{index + 1}</span>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: investment.color }} />
                              </div>
                              <div>
                                <p className="font-medium text-[#323233] dark:text-[#F5D949] text-sm">
                                  {investment.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#989898]">
                                  <Calendar className="h-3 w-3" />
                                  <span>{investment.date}</span>
                                  <Badge
                                    className={`text-xs ${
                                      investment.status === "완료"
                                        ? "bg-[#4F8F78]/10 text-[#4F8F78]"
                                        : "bg-[#5F859F]/10 text-[#5F859F]"
                                    }`}
                                  >
                                    {investment.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`${getFontSizeForAmount(investment.amount)} font-bold text-[#323233] dark:text-[#F5D949] truncate`}
                              >
                                {formatKoreanCurrency(investment.amount)}
                              </p>
                              <div className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-[#4F8F78]" />
                                <span className="text-[#4F8F78]">+{investment.currentROI}%</span>
                              </div>
                            </div>
                          </div>

                          {/* 막대 그래프 */}
                          <div className="relative">
                            <div className="h-3 bg-[#E5E4DC] dark:bg-[#454858] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${barWidth}%`,
                                  backgroundColor: investment.color,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-[#989898] mt-1">
                              <span>{investment.percentage.toFixed(1)}%</span>
                              <span>현재 ROI: +{investment.currentROI}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-[#E5E4DC] dark:bg-[#454858] rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-[#989898]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#323233] dark:text-[#F5D949] mb-2">투자 데이터가 없습니다</h3>
                  <p className="text-[#989898] text-center mb-4">투자를 시작하면 여기에 차트가 표시됩니다.</p>
                  <Button
                    onClick={() => router.push("/webtoons")}
                    className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233]"
                  >
                    투자하러 가기
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 투자 성과 분석 */}
        {investments.length > 0 && (
          <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F] shadow-lg">
            <CardHeader>
              <h3 className="font-bold text-[#323233] dark:text-[#F5D949] flex items-center gap-2">
                <Star className="h-5 w-5 text-[#F9DF52]" />
                투자 성과 분석
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#4F8F78]/10 dark:bg-[#4F8F78]/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-[#4F8F78]" />
                    <span className="text-sm font-medium text-[#989898]">최고 수익률</span>
                  </div>
                  <p className="text-xl font-bold text-[#4F8F78]">
                    +{Math.max(...investments.map((inv) => inv.currentROI)).toFixed(1)}%
                  </p>
                  <p className="text-xs text-[#989898] mt-1">
                    {
                      investments.find((inv) => inv.currentROI === Math.max(...investments.map((i) => i.currentROI)))
                        ?.title
                    }
                  </p>
                </div>

                <div className="bg-[#5F859F]/10 dark:bg-[#5F859F]/20 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-[#5F859F]" />
                    <span className="text-sm font-medium text-[#989898]">최대 투자</span>
                  </div>
                  <p
                    className={`${getFontSizeForAmount(Math.max(...investments.map((inv) => inv.amount)))} font-bold text-[#5F859F] truncate`}
                  >
                    {formatKoreanCurrency(Math.max(...investments.map((inv) => inv.amount)))}
                  </p>
                  <p className="text-xs text-[#989898] mt-1">
                    {investments.find((inv) => inv.amount === Math.max(...investments.map((i) => i.amount)))?.title}
                  </p>
                </div>
              </div>

              <div className="bg-[#F9DF52]/10 dark:bg-[#F9DF52]/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-[#F9DF52]" />
                  <span className="text-sm font-medium text-[#989898]">투자 기간</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-[#F9DF52]">{investments.length}개 프로젝트</p>
                    <p className="text-xs text-[#989898]">
                      평균{" "}
                      {Math.round(
                        investments.reduce((sum, inv) => {
                          const daysDiff = Math.floor(
                            (new Date().getTime() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24),
                          )
                          return sum + daysDiff
                        }, 0) / investments.length,
                      )}
                      일 경과
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#989898]">진행중</p>
                    <p className="text-lg font-bold text-[#F9DF52]">
                      {investments.filter((inv) => inv.status === "진행중").length}개
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
