"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3 } from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/logo"

// 투자 성장 데이터 타입
interface MonthlyInvestmentData {
  month: string
  invested: number
  expectedReturn: number
}

export function InvestmentHistoryScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [activeChartTab, setActiveChartTab] = useState("line")

  // 투자 내역 데이터
  const investments = [
    {
      id: "1",
      title: "이번 생은 가주가 되겠습니다",
      amount: 650000,
      progress: 90,
      expectedROI: 18,
      status: "제작 중",
      expectedEndDate: "2023-12-15",
    },
    {
      id: "3",
      title: "황녀, 반역자를 각인시키다",
      amount: 500000,
      progress: 75,
      expectedROI: 15,
      status: "제작 중",
      expectedEndDate: "2024-02-20",
    },
    {
      id: "5",
      title: "검술명가 막내아들",
      amount: 350000,
      progress: 60,
      expectedROI: 22,
      status: "사전 제작",
      expectedEndDate: "2024-05-10",
    },
  ]

  // 월별 투자 데이터
  const monthlyData: MonthlyInvestmentData[] = [
    { month: "1월", invested: 300000, expectedReturn: 345000 },
    { month: "2월", invested: 600000, expectedReturn: 690000 },
    { month: "3월", invested: 900000, expectedReturn: 1035000 },
    { month: "4월", invested: 1200000, expectedReturn: 1380000 },
    { month: "5월", invested: 1500000, expectedReturn: 1725000 },
  ]

  // 투자 카드 렌더링 함수
  const renderInvestmentCard = (investment: (typeof investments)[0]) => (
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

        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray">제작 진행도</p>
            <p className="text-xs text-darkblue dark:text-light">{investment.progress}%</p>
          </div>
          <Progress value={investment.progress} className="h-2 bg-gray/20" indicatorClassName="bg-yellow" />
        </div>

        <div>
          <p className="text-xs text-gray">예상 회수일: {investment.expectedEndDate}</p>
        </div>
      </CardContent>
    </Card>
  )

  // 라인 차트 렌더링
  const renderLineChart = () => {
    const maxValue = Math.max(...monthlyData.map((d) => d.expectedReturn))

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

  // 막대 차트 렌더링
  const renderBarChart = () => {
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
        <div className="ml-12 h-full flex items-end">
          {monthlyData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              {/* 투자금액 막대 */}
              <div className="relative w-full flex justify-center">
                <div
                  className="w-6 bg-green rounded-t-md"
                  style={{ height: `${(data.invested / 2000000) * 100}%` }}
                ></div>

                {/* 예상수익 막대 (투자금액 옆에 배치) */}
                <div
                  className="w-6 bg-profit rounded-t-md ml-1"
                  style={{ height: `${(data.expectedReturn / 2000000) * 100}%` }}
                ></div>
              </div>

              {/* X축 레이블 */}
              <span className="text-xs text-gray mt-2">{data.month}</span>
            </div>
          ))}
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
                className={`h-8 w-8 rounded-full ${activeChartTab === "line" ? "bg-yellow/20" : ""}`}
                onClick={() => setActiveChartTab("line")}
              >
                <TrendingUp className="h-4 w-4 text-darkblue dark:text-light" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${activeChartTab === "bar" ? "bg-yellow/20" : ""}`}
                onClick={() => setActiveChartTab("bar")}
              >
                <BarChart3 className="h-4 w-4 text-darkblue dark:text-light" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">{activeChartTab === "line" ? renderLineChart() : renderBarChart()}</CardContent>
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
              .filter((inv) => inv.status === "제작 중" || inv.status === "사전 제작")
              .map(renderInvestmentCard)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="flex items-center justify-center h-32 bg-light dark:bg-darkblue/20 rounded-xl">
              <p className="text-gray">완료된 투자가 없습니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
