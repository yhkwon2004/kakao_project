"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronRight, TrendingUp } from "lucide-react"
import { getUserFromStorage } from "@/lib/auth"
import { Progress } from "@/components/ui/progress"
import { allWebtoons, getWebtoonById } from "@/data/webtoons"

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
  isCompleted?: boolean
  thumbnail?: string
  fundingPercentage?: number // 웹툰 모집 수치
  currentRaised?: number // 현재 모인 금액
  goalAmount?: number // 목표 금액
}

// 차트 데이터 타입
interface ChartData {
  id: string
  label: string
  value: number
  color: string
  thumbnail?: string
  slug?: string
}

export function InvestmentVisualizationScreen() {
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [totalInvested, setTotalInvested] = useState(0)
  const [userName, setUserName] = useState("사용자")
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)

  // 현재 날짜 가져오기
  const getCurrentDate = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  }

  // 색상 팔레트 - 더 생생하고 대비되는 색상으로 변경
  const colorPalette = [
    "#FF6B6B", // 밝은 빨강
    "#4ECDC4", // 청록색
    "#FFD166", // 노란색
    "#6A0572", // 보라색
    "#1A936F", // 녹색
    "#3D5A80", // 짙은 파랑
    "#F25F5C", // 연한 빨강
    "#247BA0", // 파랑
    "#70C1B3", // 민트
    "#E76F51", // 주황색
  ]

  // 웹툰 데이터에서 썸네일 가져오기
  const getWebtoonThumbnail = (title: string, slug?: string): string => {
    // 먼저 slug로 검색
    if (slug) {
      const webtoon = allWebtoons.find((w) => w.id === slug)
      if (webtoon && webtoon.thumbnail) {
        return webtoon.thumbnail
      }
    }

    // 제목으로 검색
    const webtoon = allWebtoons.find((w) => w.title === title)
    if (webtoon && webtoon.thumbnail) {
      return webtoon.thumbnail
    }

    // 기본 이미지 반환
    return "/webtoon-scene.png"
  }

  // 웹툰 제목 가져오기
  const getWebtoonTitle = (slug?: string, defaultTitle = "투자 프로젝트"): string => {
    if (slug) {
      const webtoon = getWebtoonById(slug)
      if (webtoon && webtoon.title) {
        return webtoon.title
      }
    }
    return defaultTitle
  }

  // 투자 데이터 로드
  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
    }

    // 투자 내역 가져오기
    const loadInvestments = () => {
      // 모든 투자 데이터를 저장할 맵 (ID를 키로 사용하여 중복 방지)
      const investmentMap = new Map<string, Investment>()

      // 1. 일반 투자 내역 가져오기
      const storedInvestments = localStorage.getItem("userInvestments")
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          // 날짜 정보가 없는 경우 현재 날짜 추가
          parsedInvestments.forEach((inv: any) => {
            // 웹툰 데이터에서 실제 제목 가져오기
            const webtoonTitle = getWebtoonTitle(inv.slug, inv.title || "투자 프로젝트")

            const investment: Investment = {
              id: inv.id || `inv-${Math.random().toString(36).substr(2, 9)}`,
              title: webtoonTitle,
              amount: inv.amount || 0,
              progress: inv.progress || 0,
              expectedROI: inv.expectedROI || 0,
              status: inv.status || "진행중",
              slug: inv.slug || "",
              date: inv.date || getCurrentDate(),
              isCompleted: inv.progress === 100,
              thumbnail: getWebtoonThumbnail(webtoonTitle, inv.slug),
            }

            // 웹툰 데이터 연동
            const webtoonData = getWebtoonById(inv.slug || inv.id)
            if (webtoonData) {
              investment.fundingPercentage = webtoonData.fundingPercentage
              investment.currentRaised = webtoonData.currentRaised
              investment.goalAmount = webtoonData.goalAmount
            }

            // 맵에 추가 (중복 방지)
            investmentMap.set(investment.id, investment)
          })
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
        }
      }

      // 2. 종료된 프로젝트 데이터 가져오기
      const completedProjects = localStorage.getItem("completedProjects")
      if (completedProjects) {
        try {
          const parsedCompletedProjects = JSON.parse(completedProjects)

          parsedCompletedProjects.forEach((project: any) => {
            const projectId = project.id || `completed-${Math.random().toString(36).substr(2, 9)}`

            // 이미 맵에 있는지 확인 (중복 방지)
            if (!investmentMap.has(projectId)) {
              // 웹툰 데이터에서 실제 제목 가져오기
              const webtoonTitle = getWebtoonTitle(project.slug, project.title || "완료된 프로젝트")

              const completedInvestment: Investment = {
                id: projectId,
                title: webtoonTitle,
                amount: project.investedAmount || 0,
                progress: 100, // 완료된 프로젝트는 100%
                expectedROI: project.roi || 15,
                status: "완료됨",
                slug: project.slug || "",
                date: project.investmentDate || "2023-04-01",
                isCompleted: true,
                thumbnail: getWebtoonThumbnail(webtoonTitle, project.slug),
              }

              // 웹툰 데이터 연동
              const webtoonData = getWebtoonById(project.slug || project.id)
              if (webtoonData) {
                completedInvestment.fundingPercentage = webtoonData.fundingPercentage
                completedInvestment.currentRaised = webtoonData.currentRaised
                completedInvestment.goalAmount = webtoonData.goalAmount
              }

              // 맵에 추가
              investmentMap.set(projectId, completedInvestment)
            }
          })
        } catch (error) {
          console.error("종료된 프로젝트 데이터 파싱 오류:", error)
        }
      }

      // 맵의 값들을 배열로 변환
      const mergedInvestments = Array.from(investmentMap.values())

      // 투자 날짜 기준으로 정렬 (최신순)
      mergedInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setInvestments(mergedInvestments)

      // 총 투자액 계산
      const total = mergedInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      setTotalInvested(total)

      // 차트 데이터 생성
      generateChartData(mergedInvestments)
    }

    loadInvestments()

    // 로컬 스토리지 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userInvestments" || e.key === "currentUser" || e.key === "completedProjects") {
        loadInvestments()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 커스텀 이벤트 리스너 추가 (다른 컴포넌트에서 발생시킨 이벤트 감지)
    const handleCustomEvent = () => {
      loadInvestments()
    }

    window.addEventListener("userDataChanged", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
    }
  }, [])

  // 차트 데이터 생성
  const generateChartData = (investmentData: Investment[]) => {
    if (investmentData.length === 0) {
      setChartData([])
      return
    }

    // 투자 금액 기준으로 데이터 생성
    const data: ChartData[] = investmentData.map((inv, index) => ({
      id: inv.id,
      label: inv.title,
      value: inv.amount,
      color: colorPalette[index % colorPalette.length],
      thumbnail: inv.thumbnail,
      slug: inv.slug,
    }))

    // 금액 기준 내림차순 정렬
    data.sort((a, b) => b.value - a.value)

    setChartData(data)
  }

  // 원형 차트 렌더링
  const renderPieChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-60 text-gray">
          <p>투자 데이터가 없습니다</p>
        </div>
      )
    }

    // 총 투자액
    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    // 원형 차트 생성
    return (
      <div className="relative h-96 flex items-center justify-center">
        <div className="relative w-[320px] h-[320px]">
          <svg width="320" height="320" viewBox="0 0 100 100">
            {/* 원형 차트 생성 */}
            {renderPieSlices(chartData, total)}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col bg-white/0 rounded-full w-[180px] h-[180px] m-auto">
            <p className="text-sm text-gray">총 투자액</p>
            <p className="text-xl font-bold text-darkblue dark:text-light">₩{totalInvested.toLocaleString()}</p>
          </div>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-1 rounded-md transition-all ${
                  hoveredSlice === index ? "bg-gray/10 scale-105" : ""
                }`}
                onMouseEnter={() => setHoveredSlice(index)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <p className="text-xs text-gray truncate max-w-[100px]" title={item.label}>
                  {item.label}
                </p>
                <p className="text-xs font-medium text-darkblue dark:text-light">
                  {Math.round((item.value / total) * 100)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 원형 차트 슬라이스 생성
  const renderPieSlices = (data: ChartData[], total: number) => {
    let startAngle = 0
    const radius = 40
    const cx = 50
    const cy = 50

    return data.map((item, index) => {
      // 각 항목의 비율 계산
      const percentage = item.value / total
      const angle = percentage * 360
      const endAngle = startAngle + angle

      // SVG 호 경로 계산
      const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180)
      const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180)
      const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180)
      const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180)

      // 큰 호인지 작은 호인지 결정 (180도 이상이면 큰 호)
      const largeArcFlag = angle > 180 ? 1 : 0

      // 경로 생성
      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

      // 다음 슬라이스의 시작 각도 업데이트
      const currentStartAngle = startAngle
      startAngle = endAngle

      // 호버 효과를 위한 스케일 계산
      const scale = hoveredSlice === index ? 1.05 : 1
      const scaleX = cx + radius * 0.1 * Math.cos(((currentStartAngle + angle / 2) * Math.PI) / 180)
      const scaleY = cy + radius * 0.1 * Math.sin(((currentStartAngle + angle / 2) * Math.PI) / 180)

      return (
        <g key={index} onMouseEnter={() => setHoveredSlice(index)} onMouseLeave={() => setHoveredSlice(null)}>
          <path
            d={path}
            fill={item.color}
            stroke="#fff"
            strokeWidth="1"
            transform={hoveredSlice === index ? `translate(${scaleX * 0.05}, ${scaleY * 0.05}) scale(${scale})` : ""}
            style={{ transition: "all 0.3s ease" }}
            opacity={hoveredSlice === null || hoveredSlice === index ? 1 : 0.7}
          />
        </g>
      )
    })
  }

  // 막대 차트 렌더링
  const renderBarChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-60 text-gray">
          <p>투자 데이터가 없습니다</p>
        </div>
      )
    }

    // 최대 투자액
    const maxValue = Math.max(...chartData.map((item) => item.value))

    // 표시할 최대 항목 수 제한
    const displayData = chartData.slice(0, 8)

    return (
      <div className="h-96 flex flex-col justify-end space-y-3 px-4 py-2">
        {displayData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
              hoveredSlice === index ? "bg-gray/10" : ""
            }`}
            onMouseEnter={() => setHoveredSlice(index)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.label}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full bg-gray/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gray" />
                </div>
              )}
            </div>
            <p className="text-sm text-darkblue dark:text-light w-24 truncate font-medium" title={item.label}>
              {item.label}
            </p>
            <div className="flex-1 h-10 relative">
              <div
                className="absolute top-0 left-0 h-full rounded-md transition-all"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                  opacity: hoveredSlice === index ? 1 : 0.8,
                  transform: hoveredSlice === index ? "scaleX(1.02)" : "scaleX(1)",
                }}
              ></div>
              <p
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold"
                style={{
                  color: (item.value / maxValue) * 100 < 30 ? "#000" : "#fff",
                }}
              >
                ₩{item.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 rounded-full" onClick={() => router.push("/asset")}>
            <ArrowLeft className="h-5 w-5 text-darkblue dark:text-light" />
          </Button>
          <h1 className="text-lg font-bold text-darkblue dark:text-light">투자 포트폴리오</h1>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 bg-gradient-to-r from-green/10 to-yellow/10">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-darkblue dark:text-light">투자 분포</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4">{renderPieChart()}</CardContent>
        </Card>
      </div>

      {/* 투자 목록 */}
      <div className="p-4">
        <h2 className="font-bold text-darkblue dark:text-light mb-4">투자 포트폴리오</h2>
        <div className="space-y-4">
          {investments.length > 0 ? (
            investments.map((investment) => (
              <Card
                key={investment.id}
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30"
                onClick={() => router.push(`/webtoon/${investment.slug || investment.id}`)}
              >
                <div className="flex">
                  {/* 썸네일 */}
                  <div className="w-24 h-24 relative flex-shrink-0">
                    {investment.thumbnail ? (
                      <Image
                        src={investment.thumbnail || "/placeholder.svg"}
                        alt={investment.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray/20 flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-gray" />
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-darkblue dark:text-light">{investment.title}</h3>
                        <div className="flex items-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              investment.isCompleted ? "bg-profit" : "bg-yellow"
                            }`}
                          ></span>
                          <p className="text-xs text-gray">{investment.status}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray">투자 금액</p>
                        <p className="font-bold text-darkblue dark:text-light text-base">
                          ₩{(investment.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray">예상 수익률</p>
                        <p className="font-bold text-profit text-base">{investment.expectedROI}%</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-gray">제작 진행도</p>
                        <p className="text-xs text-darkblue dark:text-light">
                          {investment.fundingPercentage || investment.progress}%
                        </p>
                      </div>
                      <Progress
                        value={investment.fundingPercentage || investment.progress}
                        className="h-2 bg-gray/20"
                        indicatorClassName={investment.isCompleted ? "bg-profit" : "bg-yellow"}
                      />
                      {investment.currentRaised && investment.goalAmount && (
                        <p className="text-xs text-gray mt-1">
                          ₩{investment.currentRaised.toLocaleString()} / ₩{investment.goalAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray">
              <p>투자 내역이 없습니다.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl border-green text-green hover:bg-green/10"
                onClick={() => router.push("/webtoons")}
              >
                웹툰 둘러보기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
