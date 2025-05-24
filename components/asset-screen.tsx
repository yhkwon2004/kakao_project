"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, TrendingUp, ChevronRight } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState, useEffect } from "react"
import { getUserFromStorage } from "@/lib/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { getWebtoonById } from "@/data/webtoons"

// 금액 포맷팅 함수
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`
  }
  return `${amount.toLocaleString()}원`
}

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
  date: string
  isCompleted?: boolean
  fundingPercentage?: number
  currentRaised?: number
  goalAmount?: number
  thumbnail?: string
}

// 완료된 프로젝트 데이터 타입
interface CompletedProject {
  id: string
  title: string
  genre: string
  investedAmount: number
  returnAmount: number
  roi: number
  completionDate: string
  investors: number
  hasFeedback: boolean
  thumbnail: string
  slug: string
  feedback: string
  adaptationInterest: string
  investmentDate: string
}

// 기본 종료된 프로젝트 데이터 (제거)
const defaultCompletedProjects: CompletedProject[] = []

// 웹툰 ID로 웹툰 제목 가져오기
const getWebtoonTitle = (id: string): string => {
  const webtoon = getWebtoonById(id)
  return webtoon ? webtoon.title : "투자 프로젝트"
}

// 웹툰 ID로 썸네일 URL 가져오기
const getWebtoonThumbnail = (id: string): string => {
  const webtoon = getWebtoonById(id)
  if (webtoon && webtoon.thumbnail) {
    return webtoon.thumbnail
  }
  return "/webtoon-scene.png"
}

// 종료된 프로젝트 데이터 초기화 함수 (더미데이터 제거)
const initializeCompletedProjects = () => {
  // 더미데이터 초기화 제거
  return
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
  const [dateRange, setDateRange] = useState<"week" | "month" | "3months" | "6months" | "year" | "all" | "custom">(
    "week",
  )
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [graphAnimated, setGraphAnimated] = useState(false)

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

  // 날짜 형식 변환
  const formatDateToKorean = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 날짜 범위 변경 처리
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as any)
  }

  // 로컬 스토리지에서 투자 데이터 로드
  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name || "사용자")
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
      if (user.balance !== undefined) {
        setUserBalance(user.balance)
      }
    }

    // 투자 내역 가져오기
    const loadInvestments = () => {
      const investmentMap = new Map<string, Investment>()

      // 일반 투자 내역 가져오기
      const storedInvestments = localStorage.getItem("userInvestments")
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          parsedInvestments.forEach((inv: any) => {
            const webtoonData = getWebtoonById(inv.id)

            const investment: Investment = {
              id: inv.id || `inv-${Math.random().toString(36).substr(2, 9)}`,
              title: webtoonData ? webtoonData.title : inv.title || "투자 프로젝트",
              amount: inv.amount || 0,
              progress: inv.progress || 0,
              expectedROI: inv.expectedROI || 0,
              status: inv.status || "진행중",
              slug: inv.slug || inv.id,
              date: inv.date || getCurrentDate(),
              isCompleted: inv.status === "완료됨" || inv.progress >= 100,
              thumbnail: webtoonData?.thumbnail || "/webtoon-scene.png",
            }

            investmentMap.set(investment.id, investment)
          })
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
        }
      }

      // 맵의 값들을 배열로 변환
      const mergedInvestments = Array.from(investmentMap.values())

      // 투자 날짜 기준으로 정렬 (최신순)
      mergedInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setInvestments(mergedInvestments)

      // 투자 요약 계산
      calculateAssetSummary(mergedInvestments)

      // 투자 성장 데이터 생성
      generateGrowthData(mergedInvestments)
    }

    loadInvestments()

    // 이벤트 리스너
    const handleStorageChange = () => {
      loadInvestments()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("userDataChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleStorageChange)
    }
  }, [])

  // 투자 요약 계산
  const calculateAssetSummary = (investmentData: Investment[]) => {
    const totalInvested = investmentData.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const totalROI = investmentData.reduce((sum, inv) => sum + (inv.expectedROI || 0), 0)
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

  // 투자 성장 데이터 생성
  const generateGrowthData = (investmentData: Investment[]) => {
    // 간단한 성장 데이터 생성
    const growthData: InvestmentGrowthData[] = []
    const months = 6

    for (let i = 0; i < months; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - 1 - i))
      const monthStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`

      const totalAmount = investmentData.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      const profit = Math.round(totalAmount * (i * 0.01))

      growthData.push({
        date: monthStr,
        amount: totalAmount,
        profit: profit,
      })
    }

    setInvestmentGrowthData(growthData)
  }

  // 투자 성장 그래프 렌더링 (차트 라이브러리 없이)
  const renderInvestmentGrowthGraph = () => {
    if (investmentGrowthData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-gray">
          <p>투자 데이터가 없습니다</p>
        </div>
      )
    }

    return (
      <div className="w-full">
        <div className="h-60 flex items-end justify-between p-4 bg-gradient-to-t from-gray-50 to-transparent rounded-lg">
          {investmentGrowthData.map((data, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs text-gray mb-2">{data.date.slice(5)}월</div>
              <div
                className="bg-green w-8 rounded-t"
                style={{ height: `${Math.max(20, (data.amount / 1000000) * 100)}px` }}
              />
              <div className="text-xs text-center mt-2">{formatCurrency(data.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 필터링된 투자 내역 가져오기
  const getFilteredInvestments = () => {
    if (activeTab === "all") return investments
    if (activeTab === "active") return investments.filter((inv) => inv.progress < 100)
    if (activeTab === "completed") return investments.filter((inv) => inv.progress === 100 || inv.isCompleted)
    return investments
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="text-darkblue dark:text-light bg-yellow/20">{userName.charAt(0)}</AvatarFallback>
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
                  {formatCurrency(assetSummary.totalInvested || 0)}
                </p>
              </div>
              <div
                className="cursor-pointer hover:bg-gray/5 p-2 -m-2 rounded-lg transition-colors"
                onClick={() => router.push("/asset/visualization")}
              >
                <p className="text-sm text-gray">총 프로젝트</p>
                <div className="flex items-center">
                  <p className="text-xl font-bold text-darkblue dark:text-light">{assetSummary.totalProjects}</p>
                  <ChevronRight className="h-4 w-4 ml-1 text-gray" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray">예상 수익</p>
                <p className="text-xl font-bold text-profit">
                  {formatCurrency(Math.round(assetSummary.expectedReturns || 0))}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-profit" />
                <h3 className="font-bold text-darkblue dark:text-light">투자 성장 추이</h3>
              </div>

              {/* 기간 필터 */}
              <div className="flex items-center gap-2">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-[140px] h-8 text-xs border-gray/20 bg-light dark:bg-darkblue/50">
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-light dark:bg-darkblue">
                    <SelectItem value="week">최근 1주일</SelectItem>
                    <SelectItem value="month">최근 1개월</SelectItem>
                    <SelectItem value="3months">최근 3개월</SelectItem>
                    <SelectItem value="6months">최근 6개월</SelectItem>
                    <SelectItem value="year">최근 1년</SelectItem>
                    <SelectItem value="all">전체 기간</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30 p-4"
                onClick={() => router.push(`/webtoon/${investment.slug || investment.id}`)}
              >
                <div className="flex gap-4">
                  {/* 썸네일 이미지 */}
                  <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 bg-gray/10 border border-gray/20">
                    {investment.thumbnail ? (
                      <Image
                        src={investment.thumbnail || "/placeholder.svg"}
                        alt={investment.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray/20 text-gray">
                        <span className="text-xs">이미지 없음</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-darkblue dark:text-light text-sm">{investment.title}</h3>
                        <p className="text-xs text-gray mt-0.5">{investment.status}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray">투자 금액</p>
                        <p className="font-medium text-darkblue dark:text-light">
                          {formatCurrency(investment.amount || 0)}
                        </p>
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
