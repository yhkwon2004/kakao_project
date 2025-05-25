"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronLeft, PieChart, ChevronDown, ChevronUp } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState, useEffect } from "react"
import { getWebtoonById } from "@/data/webtoons"
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Tooltip, Pie } from "recharts"
import Image from "next/image"

// 금액 포맷팅 함수 수정 (파일 상단에)
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}

// 투자 데이터 타입
interface Investment {
  id: string
  title: string
  amount: number
  progress: number
  expectedROI: number
  status: string
  slug?: string
  date: string
  thumbnail?: string
  color?: string
}

// 차트 색상 팔레트
const CHART_COLORS = [
  "#10B981", // green
  "#F59E0B", // yellow
  "#3B82F6", // blue
  "#EF4444", // red
  "#8B5CF6", // purple
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#EC4899", // pink
  "#6B7280", // gray
]

export function InvestmentVisualizationScreen() {
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [showAllInvestments, setShowAllInvestments] = useState(false)

  // 로컬 스토리지에서 투자 데이터 로드
  useEffect(() => {
    const loadInvestments = () => {
      const storedInvestments = localStorage.getItem("userInvestments")
      const completedProjects = localStorage.getItem("completedProjects")

      let allInvestments: Investment[] = []

      // 일반 투자 내역
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          allInvestments = parsedInvestments.map((inv: any, index: number) => {
            const webtoonData = getWebtoonById(inv.id)
            return {
              id: inv.id || `inv-${Math.random().toString(36).substr(2, 9)}`,
              title: webtoonData ? webtoonData.title : inv.title || "투자 프로젝트",
              amount: Number(inv.amount) || 0,
              progress: Number(inv.progress) || 0,
              expectedROI: Number(inv.expectedROI) || 0,
              status: inv.status || "진행중",
              slug: inv.slug || inv.id,
              date: inv.date || new Date().toISOString().split("T")[0],
              thumbnail: webtoonData?.thumbnail || inv.thumbnail || "/webtoon-scene.png",
              color: CHART_COLORS[index % CHART_COLORS.length],
            }
          })
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
        }
      }

      // 완료된 프로젝트 추가
      if (completedProjects) {
        try {
          const parsedCompletedProjects = JSON.parse(completedProjects)
          const completedInvestments = parsedCompletedProjects.map((project: any, index: number) => {
            const webtoonData = getWebtoonById(project.id)
            return {
              id: project.id,
              title: webtoonData ? webtoonData.title : project.title,
              amount: Number(project.investedAmount) || 0,
              progress: 100,
              expectedROI: Number(project.roi) || 15,
              status: "완료됨",
              slug: project.slug || project.id,
              date: project.investmentDate || "2023-04-01",
              thumbnail: project.thumbnail || webtoonData?.thumbnail || "/webtoon-scene.png",
              color: CHART_COLORS[(allInvestments.length + index) % CHART_COLORS.length],
            }
          })

          // 중복 방지
          completedInvestments.forEach((newInv) => {
            if (!allInvestments.some((inv) => inv.id === newInv.id)) {
              allInvestments.push(newInv)
            }
          })
        } catch (error) {
          console.error("완료된 프로젝트 데이터 파싱 오류:", error)
        }
      }

      // 투자 금액 기준으로 정렬
      allInvestments.sort((a, b) => b.amount - a.amount)

      // 색상 재할당
      allInvestments = allInvestments.map((inv, index) => ({
        ...inv,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))

      setInvestments(allInvestments)

      // 차트 데이터 생성
      const chartData = allInvestments.map((inv) => ({
        name: inv.title,
        value: inv.amount, // 원본 값 유지 (차트 계산용)
        color: inv.color,
      }))

      setChartData(chartData)
    }

    loadInvestments()

    // 데이터 변경 감지
    const handleDataChange = () => {
      loadInvestments()
    }

    const handleInvestmentUpdate = () => {
      loadInvestments()
    }

    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("storage", handleDataChange)
    window.addEventListener("investmentUpdate", handleInvestmentUpdate)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("storage", handleDataChange)
      window.removeEventListener("investmentUpdate", handleInvestmentUpdate)
    }
  }, [])

  // 총 투자 금액 계산
  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0)

  // 표시할 투자 목록 결정
  const displayedInvestments = showAllInvestments ? investments : investments.slice(0, 4)
  const hasMoreInvestments = investments.length > 4

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage = ((data.value / totalInvestment) * 100).toFixed(1)
      return (
        <div className="bg-white dark:bg-darkblue border border-gray/20 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-darkblue dark:text-light">{data.name}</p>
          <span className="text-sm text-gray">
            {formatCurrency(data.value)} ({percentage}%)
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-profit" />
          <Logo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* 제목 */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-darkblue dark:text-light mb-2">투자 분포</h1>
        <p className="text-gray">포트폴리오별 투자 비중을 확인하세요</p>
      </div>

      {/* 투자 분포 차트와 목록 */}
      <div className="p-4">
        <Card className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4">
            <h2 className="font-bold text-darkblue dark:text-light">투자 포트폴리오</h2>
          </CardHeader>
          <CardContent className="p-4">
            {investments.length > 0 ? (
              <div className="flex flex-col gap-6">
                {/* 도넛 차트 (상단) */}
                <div className="flex items-center justify-center relative">
                  <div className="w-full max-w-md aspect-square">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* 중앙 총 투자액 표시 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-gray mb-1">총 투자액</p>
                      <p className="text-xl font-bold text-profit">{formatCurrency(totalInvestment)}</p>
                    </div>
                  </div>
                </div>

                {/* 투자 목록 (하단) */}
                <div className="space-y-3">
                  <h3 className="font-medium text-darkblue dark:text-light mb-3">투자 목록</h3>

                  {displayedInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center gap-3 p-3 bg-light dark:bg-darkblue/20 rounded-lg border border-gray/10 cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => router.push(`/webtoon/${investment.slug || investment.id}`)}
                    >
                      {/* 색상 인디케이터 */}
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: investment.color }}
                      />

                      {/* 썸네일 */}
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray/10">
                        <Image
                          src={investment.thumbnail || "/placeholder.svg"}
                          alt={investment.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 투자 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-darkblue dark:text-light text-sm truncate">{investment.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-darkblue dark:text-light">
                            {formatCurrency(investment.amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="text-xs bg-profit/10 text-profit px-2 py-1 rounded-full">
                              {((investment.amount / totalInvestment) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 더보기/접기 버튼 */}
                  {hasMoreInvestments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-gray hover:text-darkblue dark:hover:text-light"
                      onClick={() => setShowAllInvestments(!showAllInvestments)}
                    >
                      {showAllInvestments ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          더보기 ({investments.length - 4}개)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">투자 내역이 없습니다</p>
                <p className="text-sm">첫 번째 투자를 시작해보세요</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl border-green text-green hover:bg-green/10"
                  onClick={() => router.push("/webtoons")}
                >
                  웹툰 둘러보기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
