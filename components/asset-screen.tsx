"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, TrendingUp, ChevronRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState } from "react"

// 투자 성장 데이터 타입
interface InvestmentGrowthData {
  month: string
  amount: number
  profit: number
}

export function AssetScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  // 자산 요약 데이터
  const assetSummary = {
    totalInvested: 1500000,
    totalProjects: 5,
    expectedReturns: 1875000,
    averageROI: 25,
  }

  // 투자 데이터
  const investments = [
    {
      id: "3",
      title: "황녀, 반역자를 각인시키다",
      amount: 500000,
      progress: 75,
      expectedROI: 15,
      status: "제작 중",
    },
    {
      id: "5",
      title: "검술명가 막내아들",
      amount: 350000,
      progress: 60,
      expectedROI: 22,
      status: "사전 제작",
    },
    {
      id: "1",
      title: "이번 생은 가주가 되겠습니다",
      amount: 650000,
      progress: 90,
      expectedROI: 18,
      status: "제작 중",
    },
  ]

  // 투자 성장 데이터
  const investmentGrowthData: InvestmentGrowthData[] = [
    { month: "1월", amount: 300000, profit: 0 },
    { month: "2월", amount: 600000, profit: 15000 },
    { month: "3월", amount: 900000, profit: 45000 },
    { month: "4월", amount: 1200000, profit: 90000 },
    { month: "5월", amount: 1500000, profit: 150000 },
  ]

  // 투자 성장 그래프 렌더링
  const renderInvestmentGrowthGraph = () => {
    const maxAmount = Math.max(...investmentGrowthData.map((d) => d.amount))
    const maxProfit = Math.max(...investmentGrowthData.map((d) => d.profit))

    return (
      <div className="relative h-60 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray py-6">
          <span>150만</span>
          <span>100만</span>
          <span>50만</span>
          <span>0</span>
        </div>

        {/* 그래프 영역 */}
        <div className="ml-10 h-full relative">
          {/* 가로 그리드 라인 */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="absolute w-full border-t border-gray/10" style={{ top: `${i * 33.33}%` }}></div>
          ))}

          {/* 투자금액 라인 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={investmentGrowthData
                .map((d, i) => `${(i / (investmentGrowthData.length - 1)) * 100}% ${100 - (d.amount / 1500000) * 100}%`)
                .join(" ")}
              fill="none"
              stroke="#45858C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {investmentGrowthData.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (investmentGrowthData.length - 1)) * 100}%`}
                cy={`${100 - (d.amount / 1500000) * 100}%`}
                r="4"
                fill="#45858C"
              />
            ))}
          </svg>

          {/* 수익금액 라인 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={investmentGrowthData
                .map((d, i) => {
                  const totalHeight = d.amount + d.profit
                  return `${(i / (investmentGrowthData.length - 1)) * 100}% ${100 - (totalHeight / 1500000) * 100}%`
                })
                .join(" ")}
              fill="none"
              stroke="#F9DF52"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {investmentGrowthData.map((d, i) => {
              const totalHeight = d.amount + d.profit
              return (
                <circle
                  key={i}
                  cx={`${(i / (investmentGrowthData.length - 1)) * 100}%`}
                  cy={`${100 - (totalHeight / 1500000) * 100}%`}
                  r="4"
                  fill="#F9DF52"
                />
              )
            })}
          </svg>

          {/* X축 레이블 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            {investmentGrowthData.map((data, index) => (
              <span key={index} className="text-xs text-gray">
                {data.month}
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
            <span className="text-darkblue dark:text-light">수익금액</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header - 로고 일관성을 위해 수정 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarFallback className="text-darkblue">권</AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* 자산 요약 */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 bg-gradient-to-r from-green/10 to-yellow/10">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-darkblue dark:text-light">자산 요약</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <PieChart className="h-4 w-4 text-darkblue dark:text-light" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray">총 투자액</p>
                <p className="text-xl font-bold text-darkblue dark:text-light">
                  ₩{assetSummary.totalInvested.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray">총 프로젝트</p>
                <p className="text-xl font-bold text-darkblue dark:text-light">{assetSummary.totalProjects}</p>
              </div>
              <div>
                <p className="text-sm text-gray">예상 수익</p>
                <p className="text-xl font-bold text-profit">₩{assetSummary.expectedReturns.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray">평균 수익률</p>
                <p className="text-xl font-bold text-profit">{assetSummary.averageROI}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 투자 성장 그래프 */}
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-profit" />
              <h3 className="font-bold text-darkblue dark:text-light">투자 성장 추이</h3>
            </div>
            {renderInvestmentGrowthGraph()}
          </CardContent>
        </Card>
      </div>

      {/* 투자 내역 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-darkblue dark:text-light">내 투자</h2>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-light dark:bg-darkblue/20 p-1 rounded-full">
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
          </Tabs>
        </div>

        <div className="space-y-4">
          {investments.map((investment) => (
            <Card
              key={investment.id}
              className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30"
              onClick={() => router.push(`/webtoon/${investment.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-darkblue dark:text-light">{investment.title}</h3>
                    <p className="text-xs text-gray">{investment.status}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray" />
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

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-gray">제작 진행도</p>
                    <p className="text-xs text-darkblue dark:text-light">{investment.progress}%</p>
                  </div>
                  <Progress value={investment.progress} className="h-2 bg-gray/20" indicatorClassName="bg-yellow" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
