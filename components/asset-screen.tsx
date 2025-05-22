"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, TrendingUp, ChevronRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState, useEffect } from "react"
import { getUserFromStorage } from "@/lib/auth"

// 투자 성장 데이터 타입
interface InvestmentGrowthData {
  date: string
  amount: number
  profit: number
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
  date: string // 투자 날짜 추가
}

export function AssetScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvested, setTotalInvested] = useState(0)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [investmentGrowthData, setInvestmentGrowthData] = useState<InvestmentGrowthData[]>([])
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // 자산 요약 데이터
  const [assetSummary, setAssetSummary] = useState({
    totalInvested: 0,
    totalProjects: 0,
    expectedReturns: 0,
    averageROI: 0,
  })

  // 현재 날짜 가져오기
  const getCurrentDate = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  }

  // 날짜 형식 변환 (YYYY-MM-DD -> MM월 DD일)
  const formatDateToKorean = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 최근 5개의 날짜 배열 생성 (오늘 포함)
  const getRecentDates = (days = 5) => {
    const dates = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push({
        full: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
        display: `${date.getMonth() + 1}/${date.getDate()}`,
      })
    }

    return dates
  }

  // 로컬 스토리지에서 투자 데이터 로드 및 실시간 업데이트
  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
      if (user.balance) {
        setUserBalance(user.balance)
      }
    }

    // 투자 내역 가져오기
    const loadInvestments = () => {
      const storedInvestments = localStorage.getItem("userInvestments")
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)

          // 날짜 정보가 없는 경우 현재 날짜 추가
          const formattedInvestments = parsedInvestments.map((inv: any) => ({
            ...inv,
            date: inv.date || getCurrentDate(),
          }))

          setInvestments(formattedInvestments)

          // 투자 요약 계산
          calculateAssetSummary(formattedInvestments)

          // 투자 성장 데이터 생성
          generateGrowthData(formattedInvestments)
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
          setInvestments([])
        }
      } else {
        setInvestments([])
        setAssetSummary({
          totalInvested: 0,
          totalProjects: 0,
          expectedReturns: 0,
          averageROI: 0,
        })
        generateGrowthData([])
      }
    }

    // 초기 로드
    loadInvestments()

    // 로컬 스토리지 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userInvestments" || e.key === "currentUser") {
        loadInvestments()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 커스텀 이벤트 리스너 추가 (다른 컴포넌트에서 발생시킨 이벤트 감지)
    const handleCustomEvent = () => {
      loadInvestments()
    }

    window.addEventListener("userDataChanged", handleCustomEvent)

    // 1분마다 데이터 새로고침 (실시간 업데이트 시뮬레이션)
    const intervalId = setInterval(loadInvestments, 60000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
      clearInterval(intervalId)
    }
  }, [])

  // 투자 요약 계산
  const calculateAssetSummary = (investmentData: Investment[]) => {
    const totalInvested = investmentData.reduce((sum, inv) => sum + inv.amount, 0)
    const totalROI = investmentData.reduce((sum, inv) => sum + inv.expectedROI, 0)
    const avgROI = investmentData.length > 0 ? totalROI / investmentData.length : 0
    const expectedReturns = totalInvested * (1 + avgROI / 100)

    setTotalInvested(totalInvested)
    setAssetSummary({
      totalInvested,
      totalProjects: investmentData.length,
      expectedReturns,
      averageROI: Math.round(avgROI),
    })
  }

  // 투자 성장 데이터 생성 (날짜 기반)
  const generateGrowthData = (investmentData: Investment[]) => {
    // 최근 5일 날짜 가져오기
    const recentDates = getRecentDates(5)
    const growthData: InvestmentGrowthData[] = []

    // 각 날짜별 투자 금액 계산
    recentDates.forEach((dateObj) => {
      // 해당 날짜 이전 또는 당일 투자 필터링
      const relevantInvestments = investmentData.filter((inv) => inv.date <= dateObj.full)

      // 해당 날짜까지의 총 투자 금액
      const totalAmount = relevantInvestments.reduce((sum, inv) => sum + inv.amount, 0)

      // 수익 계산 (날짜가 지날수록 수익률 증가 시뮬레이션)
      const daysFromStart = recentDates.findIndex((d) => d.full === dateObj.full)
      const profitRate = daysFromStart * 0.01 // 날짜가 지날수록 1%씩 수익률 증가
      const profit = Math.round(totalAmount * profitRate)

      growthData.push({
        date: dateObj.display,
        amount: totalAmount,
        profit: profit,
      })
    })

    setInvestmentGrowthData(growthData)
  }

  // 투자 성장 그래프 렌더링
  const renderInvestmentGrowthGraph = () => {
    if (investmentGrowthData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-gray">
          <p>투자 데이터가 없습니다</p>
        </div>
      )
    }

    // 최대값 계산
    const maxAmount = Math.max(...investmentGrowthData.map((d) => d.amount + d.profit))
    // 그래프 높이를 위한 스케일 계산 (최대값의 20% 추가)
    const graphScale = maxAmount > 0 ? maxAmount * 1.2 : 1000000

    return (
      <div className="relative h-60 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray py-6">
          <span>{Math.round(graphScale / 10000) / 10}백만</span>
          <span>{Math.round((graphScale * 0.75) / 10000) / 10}백만</span>
          <span>{Math.round((graphScale * 0.5) / 10000) / 10}백만</span>
          <span>{Math.round((graphScale * 0.25) / 10000) / 10}백만</span>
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
              points={investmentGrowthData
                .map(
                  (d, i) => `${(i / (investmentGrowthData.length - 1)) * 100}% ${100 - (d.amount / graphScale) * 100}%`,
                )
                .join(" ")}
              fill="none"
              stroke="#45858C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {investmentGrowthData.map((d, i) => (
              <circle
                key={`amount-${i}`}
                cx={`${(i / (investmentGrowthData.length - 1)) * 100}%`}
                cy={`${100 - (d.amount / graphScale) * 100}%`}
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
                  return `${(i / (investmentGrowthData.length - 1)) * 100}% ${100 - (totalHeight / graphScale) * 100}%`
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
                  key={`total-${i}`}
                  cx={`${(i / (investmentGrowthData.length - 1)) * 100}%`}
                  cy={`${100 - (totalHeight / graphScale) * 100}%`}
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
                {data.date}
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

        {/* 현재 날짜 표시 */}
        <div className="absolute top-2 left-14 bg-green/10 text-green px-2 py-1 rounded-full text-xs">
          {new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} 기준
        </div>
      </div>
    )
  }

  // 필터링된 투자 내역 가져오기
  const getFilteredInvestments = () => {
    if (activeTab === "all") return investments
    if (activeTab === "active") return investments.filter((inv) => inv.progress < 100)
    if (activeTab === "completed") return investments.filter((inv) => inv.progress === 100)
    return investments
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header - 로고 일관성을 위해 수정 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarFallback className="text-darkblue">{userName.charAt(0)}</AvatarFallback>
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
                <p className="text-xl font-bold text-profit">
                  ₩{Math.round(assetSummary.expectedReturns).toLocaleString()}
                </p>
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
          {getFilteredInvestments().length > 0 ? (
            getFilteredInvestments().map((investment) => (
              <Card
                key={investment.id}
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30"
                onClick={() => router.push(`/webtoon/${investment.slug || investment.id}`)}
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
                    <Progress value={investment.progress} className="h-2 bg-gray/20" />
                  </div>

                  {/* 투자 날짜 표시 */}
                  <div className="mt-2">
                    <p className="text-xs text-gray">투자일: {formatDateToKorean(investment.date)}</p>
                  </div>
                </CardContent>
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
