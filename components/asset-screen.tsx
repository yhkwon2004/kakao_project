"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, TrendingUp, ChevronRight, Calendar } from "lucide-react"
import { Logo } from "@/components/logo"
import { useState, useEffect } from "react"
import { getUserFromStorage } from "@/lib/auth"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import Image from "next/image"
// 파일 상단에 webtoons 데이터를 import 합니다.
import { getWebtoonById, allWebtoons } from "@/data/webtoons"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"

// 투자 성장 데이터 타입
interface InvestmentGrowthData {
  date: string
  amount: number
  profit: number
}

// 투자 데이터 타입에 웹툰 정보 관련 필드를 추가합니다.
interface Investment {
  id: string
  title: string
  amount: number
  progress: number
  expectedROI: number
  status: string
  slug?: string
  date: string // 투자 날짜 추가
  isCompleted?: boolean // 완료된 프로젝트 여부
  fundingPercentage?: number // 웹툰 모집 수치
  currentRaised?: number // 현재 모인 금액
  goalAmount?: number // 목표 금액
  thumbnail?: string // 썸네일 이미지 URL
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

// 기본 종료된 프로젝트 데이터
const defaultCompletedProjects: CompletedProject[] = [
  {
    id: "bad-secretary",
    title: "나쁜 비서 [19세 완전판]",
    genre: "로맨스, 드라마",
    investedAmount: 3400000,
    returnAmount: 3910000,
    roi: 15,
    completionDate: "2023-04-15",
    investors: 342,
    hasFeedback: false,
    thumbnail: "/webtoons/나쁜-비서.png",
    slug: "bad-secretary",
    feedback: "",
    adaptationInterest: "",
    investmentDate: "2023-04-01",
  },
  {
    id: "blood-sword-family-hunting-dog",
    title: "철혈검가 사냥개의 회귀",
    genre: "액션, 판타지",
    investedAmount: 2800000,
    returnAmount: 3360000,
    roi: 20,
    completionDate: "2023-06-22",
    investors: 256,
    hasFeedback: true,
    thumbnail: "/webtoons/검술명가-막내아들.png",
    slug: "blood-sword-family-hunting-dog",
    feedback:
      "캐릭터의 성장 과정과 액션 장면이 인상적이었습니다. 특히 주인공의 복수 스토리가 드라마틱하게 전개되어 몰입감이 뛰어났습니다. 드라마화된다면 액션 장면에 중점을 두면 좋을 것 같습니다.",
    adaptationInterest: "high",
    investmentDate: "2023-05-20",
  },
]

// 웹툰 ID로 웹툰 제목 가져오기
const getWebtoonTitle = (id: string): string => {
  const webtoon = getWebtoonById(id)
  return webtoon ? webtoon.title : "투자 프로젝트"
}

// 웹툰 ID로 썸네일 URL 가져오기
const getWebtoonThumbnail = (id: string): string => {
  // 특정 웹툰 ID에 대한 하드코딩된 썸네일 경로
  if (id === "bad-secretary") {
    return "/images/나쁜-비서.jpg"
  }

  // 철혈검가 사냥개의 회귀 썸네일 추가
  if (id === "blood-sword-family-hunting-dog") {
    return "/images/철혈검가-사냥개의-회귀.png"
  }

  // 웹툰 데이터에서 찾기
  const webtoon = getWebtoonById(id)
  if (webtoon && webtoon.thumbnail) {
    return webtoon.thumbnail
  }

  // ID로 찾지 못한 경우 제목으로 검색
  const webtoonByTitle = allWebtoons.find((w) => w.title.includes(id) || (w.id && w.id.includes(id)))
  if (webtoonByTitle && webtoonByTitle.thumbnail) {
    return webtoonByTitle.thumbnail
  }

  // 기본 썸네일 반환
  return "/webtoon-scene.png"
}

// 종료된 프로젝트 데이터 초기화 함수를 수정하여 게스트 계정만 종료된 프로젝트를 가지도록 변경
const initializeCompletedProjects = () => {
  // 현재 로그인한 사용자 정보 가져오기
  const user = getUserFromStorage()

  // 게스트 계정인지 확인
  const isGuest = user?.email === "guest_social@guest.fake"

  // 로컬 스토리지에 종료된 프로젝트 데이터가 없으면 기본 데이터 저장 (게스트 계정만)
  const storedProjects = localStorage.getItem("completedProjects")
  if (!storedProjects && isGuest) {
    localStorage.setItem("completedProjects", JSON.stringify(defaultCompletedProjects))
    console.log("게스트 계정용 종료된 프로젝트 데이터 초기화 완료")

    // 자산 관리와 연결을 위해 완료된 투자 데이터도 저장
    const completedInvestments = defaultCompletedProjects.map((project) => ({
      id: project.id,
      title: project.title,
      amount: project.investedAmount,
      progress: 100, // 완료됨
      expectedROI: project.roi,
      status: "완료됨",
      slug: project.slug,
      date: project.investmentDate,
      thumbnail: project.thumbnail,
    }))

    // 기존 투자 데이터와 병합
    const existingInvestments = JSON.parse(localStorage.getItem("userInvestments") || "[]")
    const updatedInvestments = [...existingInvestments]

    // 중복 방지를 위해 ID 체크 후 추가
    completedInvestments.forEach((newInv) => {
      if (!updatedInvestments.some((inv) => inv.id === newInv.id)) {
        updatedInvestments.push(newInv)
      }
    })

    localStorage.setItem("userInvestments", JSON.stringify(updatedInvestments))

    // 데이터 변경 이벤트 발생
    window.dispatchEvent(new Event("userDataChanged"))
  } else if (!isGuest && storedProjects) {
    // 일반 계정인데 종료된 프로젝트 데이터가 있는 경우 (이전에 게스트 계정으로 로그인했던 경우)
    // 종료된 프로젝트 데이터 초기화
    localStorage.removeItem("completedProjects")

    // 투자 데이터에서 종료된 프로젝트 관련 데이터 제거
    const existingInvestments = JSON.parse(localStorage.getItem("userInvestments") || "[]")
    const filteredInvestments = existingInvestments.filter(
      (inv) => !defaultCompletedProjects.some((project) => project.id === inv.id),
    )

    localStorage.setItem("userInvestments", JSON.stringify(filteredInvestments))

    // 데이터 변경 이벤트 발생
    window.dispatchEvent(new Event("userDataChanged"))
  }
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

  // 날짜 형식 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDateToKorean = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 그래프용 날짜 형식 변환
  const formatDateForGraph = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
  }

  // 날짜 범위에 따른 시작일 계산
  const getStartDateByRange = (range: string): Date => {
    const today = new Date()
    const startDate = new Date(today)

    switch (range) {
      case "week":
        startDate.setDate(today.getDate() - 7)
        break
      case "month":
        startDate.setMonth(today.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(today.getMonth() - 3)
        break
      case "6months":
        startDate.setMonth(today.getMonth() - 6)
        break
      case "year":
        startDate.setFullYear(today.getFullYear() - 1)
        break
      case "all":
      default:
        startDate.setFullYear(2022, 0, 1) // 2022년 1월 1일부터
        break
    }

    return startDate
  }

  // 날짜 범위에 따른 데이터 포인트 수 계산
  const getDataPointsByRange = (range: string): number => {
    switch (range) {
      case "week":
        return 7 // 일별 데이터
      case "month":
        return 30 // 일별 데이터
      case "3months":
        return 12 // 주별 데이터
      case "6months":
        return 12 // 2주별 데이터
      case "year":
        return 12 // 월별 데이터
      case "all":
      default:
        return 12 // 월별 또는 분기별 데이터
    }
  }

  // 날짜 범위 변경 처리
  const handleDateRangeChange = (value: string) => {
    setDateRange(value as any)

    if (value === "custom") {
      // 커스텀 범위는 별도 처리
      return
    }

    // 선택된 범위에 따라 데이터 다시 생성
    const filteredInvestments = investments.filter((inv) => {
      if (value === "all") return true

      const invDate = new Date(inv.date)
      const startDate = getStartDateByRange(value)
      return invDate >= startDate
    })

    generateGrowthData(filteredInvestments, value)
  }

  // 커스텀 날짜 범위 적용
  const applyCustomDateRange = () => {
    if (!startDate || !endDate) return

    const filteredInvestments = investments.filter((inv) => {
      const invDate = new Date(inv.date)
      return invDate >= startDate && invDate <= endDate
    })

    generateGrowthData(filteredInvestments, "custom")
  }

  // 최근 날짜 배열 생성
  const getDatePoints = (range: string, count: number): { full: string; display: string }[] => {
    const dates = []
    const today = new Date()
    const startDate = getStartDateByRange(range)

    // 커스텀 범위인 경우
    if (range === "custom" && startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const interval = Math.max(1, Math.floor(diffDays / (count - 1)))

      for (let i = 0; i < count; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i * interval)
        if (date > endDate) break

        const fullDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
        dates.push({
          full: fullDate,
          display: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`,
        })
      }

      return dates
    }

    // 일반 범위
    let interval = 1 // 기본 간격 (일)

    switch (range) {
      case "week":
        interval = 1 // 일별
        break
      case "month":
        interval = 3 // 3일 간격
        break
      case "3months":
        interval = 7 // 주별
        break
      case "6months":
        interval = 15 // 2주별
        break
      case "year":
        interval = 30 // 월별
        break
      case "all":
        // 전체 기간은 월별로 표시
        const months = []
        const startYear = 2022
        const endYear = today.getFullYear()

        for (let year = startYear; year <= endYear; year++) {
          const monthStart = year === startYear ? 0 : 0
          const monthEnd = year === endYear ? today.getMonth() : 11

          for (let month = monthStart; month <= monthEnd; month++) {
            const date = new Date(year, month, 1)
            months.push({
              full: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`,
              display: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`,
            })
          }
        }

        // 최대 12개 포인트만 표시
        const step = Math.max(1, Math.floor(months.length / 12))
        const filteredMonths = []
        for (let i = 0; i < months.length; i += step) {
          filteredMonths.push(months[i])
        }

        return filteredMonths.slice(0, 12)
    }

    // 지정된 간격으로 날짜 생성
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i * interval)

      // 시작일보다 이전 날짜는 제외
      if (date < startDate) continue

      const fullDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      dates.push({
        full: fullDate,
        display: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`,
      })
    }

    return dates
  }

  // 로컬 스토리지에서 투자 데이터 로드 및 실시간 업데이트
  useEffect(() => {
    // 종료된 프로젝트 데이터 초기화 (없는 경우에만)
    initializeCompletedProjects()

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
      // 모든 투자 데이터를 저장할 맵 (ID를 키로 사용하여 중복 방지)
      const investmentMap = new Map<string, Investment>()

      // 1. 일반 투자 내역 가져오기
      const storedInvestments = localStorage.getItem("userInvestments")
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          // 날짜 정보가 없는 경우 현재 날짜 추가
          parsedInvestments.forEach((inv: any) => {
            // 웹툰 데이터 가져오기
            const webtoonData = getWebtoonById(inv.id)

            // 썸네일 설정 (ID 기반 하드코딩된 썸네일 우선)
            let thumbnailUrl = ""
            if (inv.id === "bad-secretary") {
              thumbnailUrl = "/images/나쁜-비서.png"
            } else if (inv.id === "blood-sword-family-hunting-dog") {
              thumbnailUrl = "/images/철혈검가-사냥개의-회귀.webp"
            } else if (webtoonData && webtoonData.thumbnail) {
              thumbnailUrl = webtoonData.thumbnail
            } else if (inv.thumbnail) {
              thumbnailUrl = inv.thumbnail
            } else {
              thumbnailUrl = "/webtoon-scene.png"
            }

            const investment: Investment = {
              id: inv.id || `inv-${Math.random().toString(36).substr(2, 9)}`,
              title: webtoonData ? webtoonData.title : inv.title || "투자 프로젝트",
              amount: inv.amount || 0,
              progress: inv.progress || 0,
              expectedROI: inv.expectedROI || 0,
              status: inv.status || "진행중",
              slug: inv.slug || inv.id,
              date: inv.date || getCurrentDate(),
              isCompleted: inv.progress === 100,
              thumbnail: thumbnailUrl,
            }

            // 웹툰 데이터 연동
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
              // 웹툰 데이터 가져오기
              const webtoonData = getWebtoonById(projectId)

              // 썸네일 설정 (ID 기반 하드코딩된 썸네일 우선)
              let thumbnailUrl = ""
              if (projectId === "bad-secretary") {
                thumbnailUrl = "/images/나쁜-비서.png"
              } else if (projectId === "blood-sword-family-hunting-dog") {
                thumbnailUrl = "/images/철혈검가-사냥개의-회귀.webp"
              } else if (project.thumbnail) {
                thumbnailUrl = project.thumbnail
              } else if (webtoonData && webtoonData.thumbnail) {
                thumbnailUrl = webtoonData.thumbnail
              } else {
                thumbnailUrl = "/webtoon-scene.png"
              }

              const completedInvestment: Investment = {
                id: projectId,
                title: webtoonData ? webtoonData.title : project.title || "완료된 프로젝트",
                amount: project.investedAmount || 0,
                progress: 100, // 완료된 프로젝트는 100%
                expectedROI: project.roi || 15,
                status: "완료됨",
                slug: project.slug || projectId,
                date: project.investmentDate || "2023-04-01",
                isCompleted: true,
                thumbnail: thumbnailUrl,
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

      // 투자 요약 계산
      calculateAssetSummary(mergedInvestments)

      // 투자 성장 데이터 생성
      generateGrowthData(mergedInvestments, dateRange)
    }

    // 초기 로드
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

    // 1분마다 데이터 새로고침 (실시간 업데이트 시뮬레이션)
    const intervalId = setInterval(loadInvestments, 60000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
      clearInterval(intervalId)
    }
  }, [dateRange])

  // 그래프 데이터가 변경될 때마다 애니메이션 재설정
  useEffect(() => {
    if (investmentGrowthData.length > 0) {
      setGraphAnimated(false)
      const timer = setTimeout(() => {
        setGraphAnimated(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [investmentGrowthData])

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

  // 투자 성장 데이터 생성 (날짜 기반)
  const generateGrowthData = (investmentData: Investment[], range: string) => {
    // 데이터 포인트 수 결정
    const pointCount = getDataPointsByRange(range)

    // 날짜 포인트 생성
    const datePoints = getDatePoints(range, pointCount)
    const growthData: InvestmentGrowthData[] = []

    // 각 날짜별 투자 금액 계산
    datePoints.forEach((dateObj) => {
      // 해당 날짜 이전 또는 당일 투자 필터링
      const relevantInvestments = investmentData.filter((inv) => inv.date <= dateObj.full)

      // 해당 날짜까지의 총 투자 금액
      const totalAmount = relevantInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0)

      // 수익 계산 (날짜가 지날수록 수익률 증가 시뮬레이션)
      const daysFromStart = datePoints.findIndex((d) => d.full === dateObj.full)
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

  // 투자 성장 그래프 렌더링을 누적 영역 그래프로 변경
  const renderInvestmentGrowthGraph = () => {
    if (investmentGrowthData.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-gray">
          <p>투자 데이터가 없습니다</p>
        </div>
      )
    }

    // 누적 영역 그래프용 데이터 변환
    const areaChartData = investmentGrowthData.map((d) => ({
      month: d.date,
      amount: d.amount,
      profit: d.profit,
      total: d.amount + d.profit,
    }))

    // Y축 최대값 계산 (총합의 110%로 여유 공간 확보)
    const maxValue = Math.max(...areaChartData.map((d) => d.total))
    const yAxisMax = Math.ceil(maxValue * 1.1)

    // 기간에 따른 날짜 포맷 결정
    const getDateFormat = () => {
      switch (dateRange) {
        case "week":
        case "month":
          return "MM/dd" // 일 단위
        case "3months":
        case "6months":
        case "year":
        case "all":
        default:
          return "MM월" // 월 단위
      }
    }

    const chartConfig = {
      amount: {
        label: "투자금",
        color: "hsl(var(--chart-1))",
      },
      profit: {
        label: "수익금",
        color: "hsl(var(--chart-2))",
      },
    }

    return (
      <div className="w-full">
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <AreaChart
            accessibilityLayer
            data={areaChartData}
            width="100%"
            height={240}
            margin={{
              top: 20,
              right: 30,
              left: 30,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const format = getDateFormat()
                if (format === "MM/dd") {
                  return value.slice(5).replace(".", "/")
                } else {
                  return value.slice(5, 7) + "월"
                }
              }}
              interval={0}
            />
            <YAxis
              domain={[0, yAxisMax]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)}M`
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white dark:bg-darkblue border border-gray/20 rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-darkblue dark:text-light mb-2">
                        {getDateFormat() === "MM/dd"
                          ? `${label.slice(0, 4)}년 ${label.slice(5).replace(".", "월 ")}일`
                          : `${label.slice(0, 4)}년 ${label.slice(5, 7)}월`}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[hsl(var(--chart-1))] rounded-sm"></div>
                            <span className="text-xs text-gray">투자금</span>
                          </div>
                          <span className="text-sm font-medium text-darkblue dark:text-light">
                            ₩{data.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[hsl(var(--chart-2))] rounded-sm"></div>
                            <span className="text-xs text-gray">수익금</span>
                          </div>
                          <span className="text-sm font-medium text-profit">₩{data.profit.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-gray/20 pt-1 mt-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-xs font-medium text-gray">총액</span>
                            <span className="text-sm font-bold text-darkblue dark:text-light">
                              ₩{data.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              dataKey="amount"
              type="natural"
              fill="var(--color-amount)"
              fillOpacity={0.4}
              stroke="var(--color-amount)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="profit"
              type="natural"
              fill="var(--color-profit)"
              fillOpacity={0.4}
              stroke="var(--color-profit)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
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
      {/* Header - 로고 일관성을 위해 수정 */}
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
                  ₩{(assetSummary.totalInvested || 0).toLocaleString()}
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
                  ₩{Math.round(assetSummary.expectedReturns || 0).toLocaleString()}
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
                    <SelectItem value="custom">기간 직접 설정</SelectItem>
                  </SelectContent>
                </Select>

                {dateRange === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-gray/20 bg-light dark:bg-darkblue/50"
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {startDate && endDate
                          ? `${format(startDate, "yy.MM.dd")} - ${format(endDate, "yy.MM.dd")}`
                          : "기간 설정"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-light dark:bg-darkblue" align="end">
                      <div className="p-3 border-b border-gray/10">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-darkblue dark:text-light">기간 설정</h4>
                          <p className="text-xs text-gray">시작일과 종료일을 선택하세요</p>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        <div>
                          <p className="text-xs text-gray mb-1">시작일</p>
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            className="border rounded-md p-2"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray mb-1">종료일</p>
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => date < (startDate || new Date(2022, 0, 1))}
                            className="border rounded-md p-2"
                          />
                        </div>
                        <Button
                          onClick={applyCustomDateRange}
                          className="mt-2 bg-yellow hover:bg-yellow/90 text-dark"
                          disabled={!startDate || !endDate}
                        >
                          적용하기
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
            {renderInvestmentGrowthGraph()}
            {/* 범례 - 그래프 밖으로 이동 */}
            <div
              className="mt-4 flex justify-center items-center gap-6 bg-light/80 dark:bg-darkblue/20 p-2 rounded-md text-sm"
              style={{
                opacity: graphAnimated ? "1" : "0",
                transform: graphAnimated ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease-in-out 1.5s, transform 0.5s ease-in-out 1.5s",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green rounded-sm"></div>
                <span className="text-darkblue dark:text-light">투자금액</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-profit rounded-sm"></div>
                <span className="text-darkblue dark:text-light">수익금액</span>
              </div>
            </div>
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
                    {investment.id === "bad-secretary" ? (
                      <img src="/images/나쁜-비서.jpg" alt={investment.title} className="w-full h-full object-cover" />
                    ) : investment.id === "blood-sword-family-hunting-dog" ? (
                      <img
                        src="/images/철혈검가-사냥개의-회귀.png"
                        alt={investment.title}
                        className="w-full h-full object-cover"
                      />
                    ) : investment.thumbnail ? (
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
                          ₩{(investment.amount || 0).toLocaleString()}
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
                        <p className="text-xs text-darkblue dark:text-light">
                          {investment.fundingPercentage || investment.progress}%
                        </p>
                      </div>
                      <Progress
                        value={investment.fundingPercentage || investment.progress}
                        className="h-2 bg-gray/20"
                      />
                      {investment.currentRaised && investment.goalAmount && (
                        <p className="text-xs text-gray mt-1">
                          ₩{investment.currentRaised.toLocaleString()} / ₩{investment.goalAmount.toLocaleString()}
                        </p>
                      )}
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
