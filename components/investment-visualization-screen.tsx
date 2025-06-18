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

// 차트 색상 팔레트 - 지정된 색상만 사용
const CHART_COLORS = [
  "#4F8F78", // green
  "#F9DF52", // yellow
  "#5F859F", // blue
  "#D16561", // red
  "#706FB9", // purple
  "#DD8369", // orange
  "#6CB9B1", // cyan
  "#848954", // lime
  "#DF9F8F", // pink
  "#989898", // gray
]

export function InvestmentVisualizationScreen() {
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [showAllInvestments, setShowAllInvestments] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 로컬 스토리지에서 투자 데이터 로드
  const loadInvestments = () => {
    console.log("투자 데이터 로드 시작...")
    setIsLoading(true)

    try {
      // 모든 관련 키 확인
      const allKeys = Object.keys(localStorage)
      console.log("현재 로컬스토리지 키들:", allKeys)

      const storedInvestments = localStorage.getItem("userInvestments")
      const completedProjects = localStorage.getItem("completedProjects")

      console.log("userInvestments:", storedInvestments)
      console.log("completedProjects:", completedProjects)

      let allInvestments: Investment[] = []

      // 일반 투자 내역
      if (storedInvestments && storedInvestments !== "null" && storedInvestments !== "undefined") {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          if (Array.isArray(parsedInvestments) && parsedInvestments.length > 0) {
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
          }
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
          allInvestments = []
        }
      } else {
        // 베타버전 초기 투자 데이터 설정
        allInvestments = [
          {
            id: "blood-sword-family-hunting-dog",
            title: "철혈검가 사냥개의 회귀",
            amount: 750000,
            progress: 85,
            expectedROI: 14.9,
            status: "진행중",
            slug: "blood-sword-family-hunting-dog",
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            thumbnail: "/images/철혈검가-사냥개의-회귀.png",
            color: CHART_COLORS[0],
          },
          {
            id: "bad-secretary",
            title: "나쁜 비서",
            amount: 500000,
            progress: 72,
            expectedROI: 18.5,
            status: "진행중",
            slug: "bad-secretary",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            thumbnail: "/webtoons/나쁜-비서.png",
            color: CHART_COLORS[1],
          },
        ]
        localStorage.setItem("userInvestments", JSON.stringify(allInvestments))
      }

      // 완료된 프로젝트는 제거 (베타버전에서는 진행중인 투자만)
      // completedProjects 관련 코드 제거

      // 투자 금액 기준으로 정렬
      allInvestments.sort((a, b) => b.amount - a.amount)

      // 색상 재할당
      allInvestments = allInvestments.map((inv, index) => ({
        ...inv,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))

      console.log("최종 로드된 투자 데이터:", allInvestments)
      setInvestments(allInvestments)

      // 차트 데이터 생성
      const chartData = allInvestments.map((inv) => ({
        name: inv.title,
        value: inv.amount, // 원본 값 유지 (차트 계산용)
        color: inv.color,
      }))

      setChartData(chartData)
    } catch (error) {
      console.error("투자 데이터 로드 오류:", error)
      setInvestments([])
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 초기 데이터 로드
    loadInvestments()

    // 데이터 변경 감지를 위한 이벤트 리스너들
    const handleDataChange = (event?: any) => {
      console.log("데이터 변경 감지됨:", event?.type || "unknown")
      // 즉시 로드하지 말고 약간의 지연을 두어 삭제가 완료된 후 로드
      setTimeout(() => {
        loadInvestments()
      }, 200)
    }

    const handleStorageChange = (e: StorageEvent) => {
      console.log("스토리지 변경 감지:", e.key, "->", e.newValue)
      // 투자 관련 키가 변경되었거나 전체 스토리지가 변경된 경우
      if (
        e.key === "userInvestments" ||
        e.key === "completedProjects" ||
        e.key === "investmentHistory" ||
        e.key === "portfolioData" ||
        e.key === null // 전체 스토리지 변경
      ) {
        handleDataChange(e)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("페이지 포커스 복귀, 데이터 새로고침")
        loadInvestments()
      }
    }

    const handleFocus = () => {
      console.log("윈도우 포커스 복귀, 데이터 새로고침")
      loadInvestments()
    }

    // 이벤트 리스너 등록
    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("investmentUpdate", handleDataChange)
    window.addEventListener("mileageUpdated", handleDataChange)
    window.addEventListener("investmentDataDeleted", handleDataChange) // 새로운 이벤트 추가
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    // 주기적 데이터 새로고침 (10초마다)
    const intervalId = setInterval(() => {
      console.log("주기적 데이터 새로고침")
      loadInvestments()
    }, 10000)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("investmentUpdate", handleDataChange)
      window.removeEventListener("mileageUpdated", handleDataChange)
      window.removeEventListener("investmentDataDeleted", handleDataChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      clearInterval(intervalId)
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
      const percentage = totalInvestment > 0 ? ((data.value / totalInvestment) * 100).toFixed(1) : "0"
      return (
        <div className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border border-[#C2BDAD] dark:border-[#454858] rounded-lg p-3 shadow-lg">
          <p className="font-medium text-[#323233] dark:text-[#F5D949]">{data.name}</p>
          <span className="text-sm text-[#989898]">
            {formatCurrency(data.value)} ({percentage}%)
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col pb-20 bg-[#FAFAFA] dark:bg-[#323233]">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] h-16">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Logo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* 제목 */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#323233] dark:text-[#F5D949] mb-2">투자 분포</h1>
        <p className="text-[#989898]">포트폴리오별 투자 비중을 확인하세요</p>
      </div>

      {/* 투자 분포 차트와 목록 */}
      <div className="p-4">
        <Card className="rounded-xl border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]/30">
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-[#323233] dark:text-[#F5D949]">투자 포트폴리오</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadInvestments}
                className="text-[#989898] hover:text-[#323233] dark:hover:text-[#F5D949]"
              >
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F8F78] mx-auto mb-4"></div>
                <p className="text-[#989898]">투자 데이터를 불러오는 중...</p>
              </div>
            ) : investments.length > 0 ? (
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
                      <p className="text-sm text-[#989898] mb-1">총 투자액</p>
                      <p className="text-xl font-bold text-[#4F8F78]">{formatCurrency(totalInvestment)}</p>
                    </div>
                  </div>
                </div>

                {/* 투자 목록 (하단) */}
                <div className="space-y-3">
                  <h3 className="font-medium text-[#323233] dark:text-[#F5D949] mb-3">투자 목록</h3>

                  {displayedInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center gap-3 p-3 bg-[#E5E4DC] dark:bg-[#383B4B]/20 rounded-lg border border-[#C2BDAD] dark:border-[#454858] cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => router.push(`/webtoon/${investment.slug || investment.id}`)}
                    >
                      {/* 색상 인디케이터 */}
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: investment.color }}
                      />

                      {/* 썸네일 */}
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-[#C2BDAD]/10">
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
                        <p className="font-medium text-[#323233] dark:text-[#F5D949] text-sm truncate">
                          {investment.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold text-[#323233] dark:text-[#F5D949]">
                            {formatCurrency(investment.amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="text-xs bg-[#4F8F78]/10 text-[#4F8F78] px-2 py-1 rounded-full">
                              {totalInvestment > 0 ? ((investment.amount / totalInvestment) * 100).toFixed(1) : "0"}%
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
                      className="w-full mt-2 text-[#989898] hover:text-[#323233] dark:hover:text-[#F5D949]"
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
              <div className="text-center py-12 text-[#989898]">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">투자 내역이 없습니다</p>
                <p className="text-sm">첫 번째 투자를 시작해보세요</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl border-[#4F8F78] text-[#4F8F78] hover:bg-[#4F8F78]/10"
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
