"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
  Users,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Award,
  CheckCircle,
  Plus,
  CreditCard,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage } from "@/lib/auth"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 투자자 증가 추이 데이터 타입
interface InvestmentGrowthData {
  date: string
  investors: number
  amount: number
}

type WebtoonDetailProps = {
  id: string // We'll keep this for backward compatibility
}

export function WebtoonDetail({ id }: WebtoonDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState(10000)
  const [isValidAmount, setIsValidAmount] = useState(true)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")
  const [userBalance, setUserBalance] = useState(150000) // 기본 잔액 설정
  const [hasInvested, setHasInvested] = useState(false) // 투자 여부 상태 추가
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [keypadInput, setKeypadInput] = useState("0")
  const [inputError, setInputError] = useState("")
  const [investmentGrowthData, setInvestmentGrowthData] = useState<InvestmentGrowthData[]>([])
  const [isInsufficientBalanceDialogOpen, setIsInsufficientBalanceDialogOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [investmentResult, setInvestmentResult] = useState<{
    amount: number
    expectedReturn: number
    mileage: number
    isCompleted: boolean
    isAdditionalInvestment?: boolean
  } | null>(null)
  const [isChargeConfirmDialogOpen, setIsChargeConfirmDialogOpen] = useState(false)
  const webtoonData = getWebtoonById(id)

  // 웹툰 상세 정보 데이터 부분을 수정합니다.
  // 이제 ID를 기반으로 웹툰 정보를 가져오고, 필요한 속성에 기본값을 제공합니다.

  // 웹툰 데이터가 없는 경우 기본값 설정
  const webtoon = {
    id,
    title: webtoonData?.title || "웹툰 정보를 찾을 수 없습니다",
    ageRating: webtoonData?.ageRating || "15",
    genre: webtoonData?.genre || "정보 없음",
    director: webtoonData?.director || "정보 없음",
    productionCompany: webtoonData?.productionCompany || "정보 없음",
    distributor: webtoonData?.distributor || "정보 없음",
    currentRaised: webtoonData?.currentRaised || 0,
    goalAmount: webtoonData?.goalAmount || 100000000,
    expectedROI: webtoonData?.expectedROI ? Number.parseFloat(webtoonData.expectedROI) : 15,
    daysLeft: webtoonData?.daysLeft || 0,
    totalInvestors: webtoonData?.totalInvestors || 0,
    summary: webtoonData?.description || "웹툰 정보를 찾을 수 없습니다.",
    updateLog: webtoonData?.updateLog || "정보 없음",
    isDramatized: webtoonData?.isDramatized || false,
    status: webtoonData?.status || "ongoing",
  }

  // 진행률 계산 부분도 안전하게 수정
  const progress = webtoon.goalAmount > 0 ? (webtoon.currentRaised / webtoon.goalAmount) * 100 : 0

  const [dynamicProgress, setDynamicProgress] = useState(progress)
  const [dynamicCurrentRaised, setDynamicCurrentRaised] = useState(webtoon.currentRaised)
  const [dynamicTotalInvestors, setDynamicTotalInvestors] = useState(webtoon.totalInvestors)

  // 초기 동적 상태 설정
  useEffect(() => {
    setDynamicProgress(progress)
    setDynamicCurrentRaised(webtoon.currentRaised)
    setDynamicTotalInvestors(webtoon.totalInvestors)
  }, [progress, webtoon.currentRaised, webtoon.totalInvestors])

  // 상태 메시지를 얻기 위한 함수
  const getStatusMessage = () => {
    if (webtoon.isDramatized) return "이미 드라마화가 완료된 작품입니다"
    if (webtoon.status === "completed") return "이미 투자가 마감된 작품입니다"
    return ""
  }

  // 최소, 최대 투자 금액 설정
  const MIN_INVESTMENT = 10000
  const MAX_INVESTMENT = 2000000000 // 20억원으로 변경
  const STEP_SIZE = 10000

  // 투자 금액 범위 배열 생성 (선택 버튼용)
  const investmentRanges = [
    { label: "1만원", value: 10000 },
    { label: "5만원", value: 50000 },
    { label: "10만원", value: 100000 },
    { label: "50만원", value: 500000 },
    { label: "100만원", value: 1000000 },
  ]

  // 사용자 정보 및 잔액 로드
  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user) {
      // balance가 undefined인 경우에만 기본값 설정
      if (user.balance === undefined) {
        user.balance = 150000
        localStorage.setItem("currentUser", JSON.stringify(user))
      }
      setUserBalance(user.balance)
    }
  }, [])

  // 투자자 증가 추이와 투자금액 추이 데이터 동적 생성
  useEffect(() => {
    if (webtoonData) {
      // 현재 투자자 수와 모금액을 기준으로 과거 데이터 생성
      const totalInvestors = webtoonData.totalInvestors || 0
      const currentRaised = webtoonData.currentRaised || 0

      // 최근 6개월 데이터 생성
      const months = 6
      const newGrowthData = []

      for (let i = 0; i < months; i++) {
        // 날짜 계산 (현재로부터 i개월 전)
        const date = new Date()
        date.setMonth(date.getMonth() - (months - 1 - i))
        const monthStr = date.toISOString().slice(0, 7) // YYYY-MM 형식

        // 투자자 수와 금액은 시간에 따라 증가하는 패턴으로 생성
        // 초기값은 전체의 10~20% 정도에서 시작하여 점진적으로 증가
        const growthFactor = 0.1 + 0.9 * (i / (months - 1)) // 0.1에서 1.0까지 증가

        // 약간의 랜덤성 추가 (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2

        const investors = Math.round(totalInvestors * growthFactor * randomFactor)
        const amount = Math.round(currentRaised * growthFactor * randomFactor)

        newGrowthData.push({
          date: monthStr,
          investors,
          amount,
        })
      }

      setInvestmentGrowthData(newGrowthData)
    }
  }, [webtoonData])

  useEffect(() => {
    const handleStorageChange = () => {
      const storedWebtoons = localStorage.getItem("webtoonsData")
      if (storedWebtoons) {
        const webtoonsData = JSON.parse(storedWebtoons)
        if (webtoonsData[id]) {
          const updatedData = webtoonsData[id]
          const newCurrentRaised = updatedData.currentRaised || webtoon.currentRaised
          const newProgress = webtoon.goalAmount > 0 ? (newCurrentRaised / webtoon.goalAmount) * 100 : 0
          const newTotalInvestors = updatedData.totalInvestors || webtoon.totalInvestors

          setDynamicCurrentRaised(newCurrentRaised)
          setDynamicProgress(newProgress)
          setDynamicTotalInvestors(newTotalInvestors)
        }
      }
    }

    // 초기 로드
    handleStorageChange()

    // 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("webtoonDataChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("webtoonDataChanged", handleStorageChange)
    }
  }, [id, webtoon.currentRaised, webtoon.goalAmount, webtoon.totalInvestors])

  useEffect(() => {
    // 로컬 스토리지에서 업데이트된 웹툰 데이터 로드
    const storedWebtoons = localStorage.getItem("webtoonsData")
    if (storedWebtoons) {
      const webtoonsData = JSON.parse(storedWebtoons)
      if (webtoonsData[id]) {
        const updatedData = webtoonsData[id]
        webtoon.currentRaised = updatedData.currentRaised || webtoon.currentRaised
        webtoon.totalInvestors = updatedData.totalInvestors || webtoon.totalInvestors
        webtoon.status = updatedData.status || webtoon.status
      }
    }

    // 웹툰 데이터 변경 이벤트 리스너
    const handleWebtoonDataChange = () => {
      window.location.reload()
    }

    window.addEventListener("webtoonDataChanged", handleWebtoonDataChange)

    return () => {
      window.removeEventListener("webtoonDataChanged", handleWebtoonDataChange)
    }
  }, [id])

  useEffect(() => {
    // 로컬 스토리지에서 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      // 현재 웹툰에 투자했는지 확인
      const hasInvestedInThisWebtoon = investments.some((inv: any) => inv.webtoonId === id)
      setHasInvested(hasInvestedInThisWebtoon)
    }

    // URL 파라미터 또는 localStorage에서 초기 favorite 상태를 가져옴
    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites)
      // 현재 웹툰이 즐겨찾기에 있는지 확인
      const isFav = favorites.some((fav: any) => fav.slug === id)
      setIsFavorite(isFav)
    } else {
      setIsFavorite(false)
    }
  }, [id])

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)

    // 로컬 스토리지에서 현재 즐겨찾기 목록 가져오기
    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : []

    if (!isFavorite) {
      // 즐겨찾기 추가
      const newFavorite = {
        id: webtoon.id,
        title: webtoon.title,
        genre: webtoon.genre || "판타지, 로맨스",
        status: webtoon.status === "completed" ? "투자 완료" : "투자 가능",
        notification: true,
        slug: id, // URL 파라미터로 받은 slug 사용
        invested: hasInvested, // 투자 여부 추가
      }

      favorites.push(newFavorite)
    } else {
      // 즐겨찾기 제거
      favorites = favorites.filter((fav: any) => fav.slug !== id)
    }

    // 변경된 즐겨찾기 목록 저장
    localStorage.setItem("favoriteWebtoons", JSON.stringify(favorites))

    toast({
      title: isFavorite ? "관심 목록에서 제거되었습니다" : "관심 웹툰에 추가되었습니다",
      description: isFavorite
        ? `${webtoon.title}이(가) 관심 목록에서 제거되었습니다.`
        : `${webtoon.title}이(가) 관심 웹툰에 추가되었습니다.`,
      duration: 300, // 0.3초로 변경
    })
  }

  // 투자 가능 여부 확인 (잔액 체크 추가)
  const canInvest = () => {
    const remainingAmount = webtoon.goalAmount - webtoon.currentRaised
    const maxInvestAmount = Math.min(investmentAmount, remainingAmount)
    return maxInvestAmount > 0 && maxInvestAmount <= userBalance
  }

  const handleInvest = () => {
    const remainingAmount = webtoon.goalAmount - webtoon.currentRaised

    if (investmentAmount > userBalance) {
      setIsInsufficientBalanceDialogOpen(true)
      return
    }

    if (investmentAmount > remainingAmount) {
      // 남은 모금액만큼만 투자하도록 조정
      setInvestmentAmount(remainingAmount)
      setKeypadInput(remainingAmount.toString())
    }

    if (canInvest()) {
      openInvestModal()
    }
  }

  const confirmInvestment = () => {
    setIsConfirmDialogOpen(false)

    const remainingAmount = webtoon.goalAmount - webtoon.currentRaised
    const actualInvestAmount = Math.min(investmentAmount, remainingAmount)

    // 투자 후 잔액 계산
    const newBalance = userBalance - actualInvestAmount
    setUserBalance(newBalance)

    // 웹툰 데이터 업데이트
    const updatedCurrentRaised = webtoon.currentRaised + actualInvestAmount
    const updatedProgress = (updatedCurrentRaised / webtoon.goalAmount) * 100
    const isCompleted = updatedProgress >= 100

    // 즉시 UI 상태 업데이트
    setDynamicCurrentRaised(updatedCurrentRaised)
    setDynamicProgress(updatedProgress)
    setDynamicTotalInvestors((webtoon.totalInvestors || 0) + 1)

    // 사용자 정보 업데이트
    const user = getUserFromStorage()
    if (user) {
      user.balance = newBalance
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    // 로컬 스토리지의 웹툰 데이터 업데이트
    const storedWebtoons = localStorage.getItem("webtoonsData")
    const webtoonsData = storedWebtoons ? JSON.parse(storedWebtoons) : {}

    webtoonsData[id] = {
      currentRaised: updatedCurrentRaised,
      progress: updatedProgress,
      status: isCompleted ? "completed" : "ongoing",
      totalInvestors: (webtoon.totalInvestors || 0) + 1,
    }

    localStorage.setItem("webtoonsData", JSON.stringify(webtoonsData))

    // 현재 날짜 가져오기
    const currentDate = new Date().toISOString().split("T")[0]

    // 투자 내역 저장 - 기존 투자가 있으면 금액 누적, 없으면 새로 생성
    const investmentsStr = localStorage.getItem("userInvestments")
    const investments = investmentsStr ? JSON.parse(investmentsStr) : []

    // 기존 투자 찾기
    const existingInvestmentIndex = investments.findIndex((inv: any) => inv.webtoonId === id)

    if (existingInvestmentIndex !== -1) {
      // 기존 투자가 있으면 금액 누적하고 날짜 업데이트
      investments[existingInvestmentIndex].amount += actualInvestAmount
      investments[existingInvestmentIndex].date = currentDate
      investments[existingInvestmentIndex].progress = updatedProgress
      investments[existingInvestmentIndex].status = isCompleted ? "완료됨" : "제작 중"
    } else {
      // 새로운 투자 추가
      const newInvestment = {
        webtoonId: id,
        webtoonTitle: webtoon.title,
        amount: actualInvestAmount,
        date: currentDate,
        expectedROI: webtoon.expectedROI,
        progress: updatedProgress,
        status: isCompleted ? "완료됨" : "제작 중",
        slug: id,
        id: id,
      }
      investments.push(newInvestment)
    }

    localStorage.setItem("userInvestments", JSON.stringify(investments))

    // 완료된 프로젝트인 경우 completedProjects에도 추가/업데이트
    if (isCompleted) {
      const completedProjectsStr = localStorage.getItem("completedProjects")
      const completedProjects = completedProjectsStr ? JSON.parse(completedProjectsStr) : []

      const existingCompletedIndex = completedProjects.findIndex((proj: any) => proj.id === id)
      const totalInvestedAmount = investments.find((inv: any) => inv.webtoonId === id)?.amount || actualInvestAmount

      const completedProject = {
        id: id,
        title: webtoon.title,
        genre: webtoon.genre || "판타지, 로맨스",
        investedAmount: totalInvestedAmount,
        returnAmount: Math.round(totalInvestedAmount * (1 + expectedROIValue / 100)),
        roi: expectedROIValue,
        completionDate: currentDate,
        investors: webtoonsData[id].totalInvestors,
        hasFeedback: false,
        thumbnail: webtoonData?.thumbnail || "/webtoon-scene.png",
        slug: id,
        feedback: "",
        adaptationInterest: "",
        investmentDate: currentDate,
      }

      if (existingCompletedIndex !== -1) {
        completedProjects[existingCompletedIndex] = completedProject
      } else {
        completedProjects.push(completedProject)
      }

      localStorage.setItem("completedProjects", JSON.stringify(completedProjects))
    }

    // 투자 상태 업데이트
    setHasInvested(true)

    // 마일리지 적립
    const mileageToAdd = Math.floor(actualInvestAmount / 1000) * 10
    if (mileageToAdd > 0) {
      const mileageDataStr = localStorage.getItem("userMileage")
      const mileageData = mileageDataStr
        ? JSON.parse(mileageDataStr)
        : { totalMileage: 0, history: [], lastAttendanceDate: null }

      const updatedMileageData = {
        ...mileageData,
        totalMileage: (mileageData.totalMileage || 0) + mileageToAdd,
        history: [
          {
            date: currentDate,
            amount: mileageToAdd,
            type: "적립",
            reason: `웹툰 투자: ${webtoon.title} (${actualInvestAmount.toLocaleString()}원)`,
          },
          ...(mileageData.history || []),
        ],
      }

      localStorage.setItem("userMileage", JSON.stringify(updatedMileageData))
    }

    // 이벤트 발생
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("userDataChanged"))
    window.dispatchEvent(new Event("webtoonDataChanged"))

    const expectedReturn = Math.round(actualInvestAmount * (1 + expectedROIValue / 100))

    // 투자 결과 설정 및 성공 모달 표시
    setInvestmentResult({
      amount: actualInvestAmount,
      expectedReturn,
      mileage: mileageToAdd,
      isCompleted,
      isAdditionalInvestment: hasInvested, // 추가 투자 여부 추가
    })

    // 성공 모달 표시
    setTimeout(() => {
      setIsSuccessModalOpen(true)
    }, 500)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록 처리
    const value = e.target.value.replace(/[^0-9]/g, "")
    const numValue = Number.parseInt(value, 10) || 0

    // 범위 내의 값으로 제한
    const limitedValue = Math.min(Math.max(numValue, 0), MAX_INVESTMENT)

    setInvestmentAmount(limitedValue)
    setIsValidAmount(limitedValue >= MIN_INVESTMENT)
  }

  // 직접 입력 필드 핸들러
  const handleDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자와 쉼표만 허용
    const rawValue = e.target.value.replace(/[^0-9,]/g, "")
    // 쉼표 제거 후 숫자로 변환
    const numericValue = rawValue.replace(/,/g, "")

    if (numericValue === "") {
      setKeypadInput("0")
      setInputError("")
      return
    }

    const numValue = Number.parseInt(numericValue, 10)

    // 유효성 검사
    if (numValue < MIN_INVESTMENT) {
      setInputError(`최소 ${MIN_INVESTMENT.toLocaleString()}원 이상 입력해주세요.`)
    } else if (numValue > MAX_INVESTMENT) {
      setInputError(`최대 ${MAX_INVESTMENT.toLocaleString()}원까지 입력 가능합니다.`)
    } else if (numValue > userBalance) {
      setInputError("잔액이 부족합니다.")
    } else {
      setInputError("")
    }

    setKeypadInput(numericValue)

    // 입력 필드에 천 단위 구분자 적용
    const formattedValue = numValue.toLocaleString()
    e.target.value = formattedValue
  }

  // 예상 수익률 계산 부분도 안전하게 수정
  // 예상 수익금 계산
  const expectedROIValue =
    typeof webtoon.expectedROI === "string"
      ? Number.parseFloat(webtoon.expectedROI.split("-")[0] || "15")
      : webtoon.expectedROI || 15
  const expectedReturn = Math.round(investmentAmount * (1 + expectedROIValue / 100))

  // 슬라이더 값 변경 핸들러
  const handleSliderChange = (value: number[]) => {
    setInvestmentAmount(value[0])
    setIsValidAmount(value[0] >= MIN_INVESTMENT)
  }

  // 숫자 키패드 입력 처리
  const handleKeypadInput = (value: string) => {
    if (value === "delete") {
      // 마지막 숫자 삭제
      setKeypadInput((prev) => prev.slice(0, -1) || "0")
    } else if (value === "clear") {
      // 입력값 초기화
      setKeypadInput("0")
    } else {
      // 숫자를 직접 금액으로 설정 (1을 누르면 1만원)
      const amount = Number.parseInt(value) * 10000
      setKeypadInput(amount.toString())
    }

    // 에러 메시지 초기화
    setInputError("")
  }

  // 투자 모달 열기 함수
  const openInvestModal = () => {
    if (canInvest()) {
      setKeypadInput("0")
      setInputError("")
      setIsInvestModalOpen(true)
    } else if (investmentAmount > userBalance) {
      toast({
        title: "잔액 부족",
        description: "투자 금액이 현재 잔액보다 많습니다.",
        variant: "destructive",
        duration: 500,
      })
    }
  }

  // 투자 모달에서 확인 버튼 클릭 시 처리
  const confirmKeypadInput = () => {
    const amount = Number.parseInt(keypadInput, 10)
    const remainingAmount = webtoon.goalAmount - webtoon.currentRaised

    if (amount < MIN_INVESTMENT) {
      toast({
        title: "최소 투자 금액 미달",
        description: `최소 ${MIN_INVESTMENT.toLocaleString()}원 이상 투자해야 합니다.`,
        variant: "destructive",
        duration: 500,
      })
      return
    }

    if (amount > MAX_INVESTMENT) {
      toast({
        title: "최대 투자 금액 초과",
        description: `최대 ${MAX_INVESTMENT.toLocaleString()}원까지 투자할 수 있습니다.`,
        variant: "destructive",
        duration: 500,
      })
      return
    }

    if (amount > remainingAmount) {
      toast({
        title: "모금 한도 초과",
        description: `남은 모금액 ${remainingAmount.toLocaleString()}원까지만 투자 가능합니다.`,
        variant: "destructive",
        duration: 500,
      })
      setKeypadInput(remainingAmount.toString())
      return
    }

    if (amount > userBalance) {
      setIsInvestModalOpen(false)
      setIsInsufficientBalanceDialogOpen(true)
      return
    }

    setInvestmentAmount(amount)
    setIsInvestModalOpen(false)
    setIsConfirmDialogOpen(true)
  }

  // 잔액 부족 시 충전 페이지로 이동
  const handleGoToPayment = () => {
    setIsInsufficientBalanceDialogOpen(false)
    router.push("/mypage/payment")
  }

  // 충전 후 투자하러 가기 확인
  const handleChargeAndInvest = () => {
    setIsInsufficientBalanceDialogOpen(false)
    setIsChargeConfirmDialogOpen(true)
  }

  // 충전 확인 후 페이지 이동
  const confirmChargeAndInvest = () => {
    setIsChargeConfirmDialogOpen(false)
    router.push("/mypage/payment?returnTo=" + encodeURIComponent(`/webtoon/${id}`))
  }

  // 투자자 증가 그래프 렌더링 함수를 다음과 같이 수정:

  const renderInvestorGrowthGraph = () => {
    // 6개월간의 월별 데이터 생성
    const months = []
    const currentDate = new Date()

    // 로컬 스토리지에서 현재 웹툰의 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    const investments = investmentsStr ? JSON.parse(investmentsStr) : []
    const currentWebtoonInvestments = investments.filter((inv: any) => inv.webtoonId === id)

    let cumulativeExisting = 0 // 누적 기존 투자자

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`

      // 해당 월의 신규 투자자 수 (랜덤 + 실제 투자 반영)
      let newInvestors = Math.floor(Math.random() * 15) + 5 // 기본 5-20명

      // 현재 월이고 사용자가 투자했다면 +1
      if (i === 0 && hasInvested) {
        newInvestors += 1
      }

      // 다음 달에는 이번 달 신규 투자자가 기존 투자자로 전환
      if (i < 5) {
        cumulativeExisting += months[months.length - 1]?.new || 0
      }

      months.push({
        month: monthStr,
        existing: cumulativeExisting,
        new: newInvestors,
        total: cumulativeExisting + newInvestors,
      })
    }

    // Y축 최대값 계산
    const maxValue = Math.max(...months.map((d) => d.total))
    const yAxisMax = Math.max(Math.ceil(maxValue * 1.2), 10) // 최소 10명

    const chartConfig = {
      existing: {
        label: "기존 투자자",
        color: "#10B981", // 초록색 (고정값)
      },
      new: {
        label: "신규 투자자",
        color: "#EF4444", // 빨간색 (고정값)
      },
    }

    return (
      <div className="mt-4 w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-darkblue dark:text-light">투자자 증가 추이</h3>
          <span className="text-xs text-gray">단위: 명</span>
        </div>
        <div className="w-full flex justify-center">
          <ChartContainer config={chartConfig} className="h-60 w-full max-w-full">
            <AreaChart
              accessibilityLayer
              data={months}
              width="100%"
              height={240}
              margin={{
                top: 20,
                right: 30,
                left: 30,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(5) + "월"}
                interval={0}
                stroke="#6b7280"
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}명`}
                stroke="#6b7280"
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-darkblue border border-gray/20 rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-darkblue dark:text-light mb-2">
                          {label.slice(0, 4)}년 {label.slice(5)}월
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                              <span className="text-xs text-gray">기존 투자자</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">{data.existing}명</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                              <span className="text-xs text-gray">신규 투자자</span>
                            </div>
                            <span className="text-sm font-medium text-red-500">{data.new}명</span>
                          </div>
                          <div className="border-t border-gray/20 pt-1 mt-2">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium text-gray">총 투자자</span>
                              <span className="text-sm font-bold text-darkblue dark:text-light">{data.total}명</span>
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
                dataKey="existing"
                type="monotone"
                fill="#10B981"
                fillOpacity={0.4}
                stroke="#10B981"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="new"
                type="monotone"
                fill="#EF4444"
                fillOpacity={0.4}
                stroke="#EF4444"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    )
  }

  // 투자금액 증가 그래프 렌더링 함수를 다음과 같이 수정:

  const renderAmountGrowthGraph = () => {
    // 6개월간의 월별 데이터 생성
    const months = []
    const currentDate = new Date()

    // 로컬 스토리지에서 현재 웹툰의 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    const investments = investmentsStr ? JSON.parse(investmentsStr) : []
    const currentWebtoonInvestments = investments.filter((inv: any) => inv.webtoonId === id)

    let cumulativeAmount = 0 // 누적 투자금 (단위: 만원)

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`

      // 해당 월의 신규 투자금 (단위: 만원)
      let newAmount = Math.floor(Math.random() * 3000) + 1000 // 기본 1000-4000만원

      // 현재 월이고 사용자가 투자했다면 투자금액 추가
      if (i === 0 && hasInvested) {
        newAmount += Math.floor(investmentAmount / 10000) // 만원 단위로 변환
      }

      // 누적 투자금에 신규 투자금 추가
      cumulativeAmount += newAmount

      months.push({
        month: monthStr,
        cumulative: cumulativeAmount - newAmount, // 이전까지의 누적
        new: newAmount, // 이번 달 신규
        total: cumulativeAmount,
      })
    }

    // Y축 최대값 계산
    const maxValue = Math.max(...months.map((d) => d.total))
    const yAxisMax = Math.max(Math.ceil(maxValue * 1.2), 1000) // 최소 1000만원

    const chartConfig = {
      cumulative: {
        label: "누적 투자금",
        color: "#3B82F6", // 파란색 (고정값)
      },
      new: {
        label: "신규 투자금",
        color: "#10B981", // 초록색 (고정값)
      },
    }

    return (
      <div className="mt-4 w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-darkblue dark:text-light">투자금액 증가 추이</h3>
          <span className="text-xs text-gray">단위: 만원</span>
        </div>
        <div className="w-full flex justify-center">
          <ChartContainer config={chartConfig} className="h-60 w-full max-w-full">
            <AreaChart
              accessibilityLayer
              data={months}
              width="100%"
              height={240}
              margin={{
                top: 20,
                right: 30,
                left: 30,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(5) + "월"}
                interval={0}
                stroke="#6b7280"
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  if (value >= 10000) {
                    return `${(value / 10000).toFixed(0)}억`
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}천만`
                  }
                  return `${value}만`
                }}
                stroke="#6b7280"
              />
              <ChartTooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-darkblue border border-gray/20 rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium text-darkblue dark:text-light mb-2">
                          {label.slice(0, 4)}년 {label.slice(5)}월
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                              <span className="text-xs text-gray">누적 투자금</span>
                            </div>
                            <span className="text-sm font-medium text-blue-500">
                              ₩{(data.cumulative * 10000).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                              <span className="text-xs text-gray">신규 투자금</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              ₩{(data.new * 10000).toLocaleString()}
                            </span>
                          </div>
                          <div className="border-t border-gray/20 pt-1 mt-2">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-medium text-gray">총 투자금</span>\
                              <span className="text-sm font-bold text-darkblue dark:text-light">
                                ₩{(data.total * 10000).toLocaleString()}
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
                dataKey="cumulative"
                type="monotone"
                fill="#3B82F6"
                fillOpacity={0.4}
                stroke="#3B82F6"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="new"
                type="monotone"
                fill="#10B981"
                fillOpacity={0.4}
                stroke="#10B981"
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-32 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10 bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Logo size="sm" showSubtitle={false} />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarFallback className="text-darkblue">권</AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* 웹툰 이미지 */}
      <div className="relative h-80 w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Image
          src={webtoonData?.thumbnail || "/gray-placeholder.png"}
          alt={webtoon.title}
          fill
          className="object-cover"
        />

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* 상태 뱃지들 */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {webtoon.isDramatized && (
            <div className="bg-green/90 backdrop-blur-sm text-light text-xs font-medium px-3 py-1.5 rounded-full flex items-center shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              드라마화 완료
            </div>
          )}

          {!webtoon.isDramatized && webtoon.status === "ongoing" && (
            <div className="bg-yellow/90 backdrop-blur-sm text-dark text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              <Clock className="h-3 w-3 mr-1 inline" />
              {webtoon.daysLeft}일 남음
            </div>
          )}

          {!webtoon.isDramatized && webtoon.status === "completed" && (
            <div className="bg-gray/90 backdrop-blur-sm text-light text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              투자 마감
            </div>
          )}
        </div>

        {/* 진행률 표시 */}
        <div className="absolute top-4 right-4 bg-darkblue/90 backdrop-blur-sm text-light text-xs font-medium px-3 py-1.5 rounded-full z-10 shadow-lg">
          <Target className="h-3 w-3 mr-1 inline" />
          {dynamicProgress.toFixed(0)}% 모집됨
        </div>

        {/* 제목 및 장르 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h1 className="text-2xl font-bold text-white mb-1">{webtoon.title}</h1>
          <p className="text-gray-200 text-sm">{webtoon.genre}</p>
        </div>
      </div>

      <p className="text-xs text-gray text-center mt-2 px-4">
        ※ 현재는 임시 이미지입니다. 추후 실제 이미지로 교체될 수 있습니다.
      </p>

      {/* 사용자 잔액 표시 */}
      <div className="p-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-green/10 to-emerald/10 rounded-xl p-4 border border-green/20 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green/20 p-2 rounded-lg mr-3">
              <Wallet className="h-5 w-5 text-green" />
            </div>
            <span className="text-sm font-medium text-darkblue dark:text-light">내 잔액</span>
          </div>
          <span className="font-bold text-green text-lg">₩{userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* 웹툰 상세 정보 */}
      <div className="p-4 pt-0">
        {/* 주요 정보 카드 */}
        <Card className="rounded-2xl mb-6 border-gray/20 bg-white dark:bg-darkblue/30 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* 헤더 섹션 */}
            <div className="bg-gradient-to-r from-blue/5 to-purple/5 p-6 border-b border-gray/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray font-medium">현재 모금액</p>
                  <p className="font-bold text-2xl text-darkblue dark:text-light">
                    ₩{typeof dynamicCurrentRaised === "number" ? dynamicCurrentRaised.toLocaleString() : "0"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray font-medium">목표 금액</p>
                  <p className="font-semibold text-lg text-darkblue dark:text-light">
                    ₩{typeof webtoon.goalAmount === "number" ? webtoon.goalAmount.toLocaleString() : "0"}
                  </p>
                </div>
              </div>

              <Progress
                value={dynamicProgress}
                className="h-4 mb-4 bg-gray/20 transition-all duration-1000 ease-out"
                indicatorClassName="bg-gradient-to-r from-yellow to-green transition-all duration-1000"
              />

              <div className="flex justify-between items-center">
                <p className="text-sm text-darkblue dark:text-light font-medium">{dynamicProgress.toFixed(1)}% 완료</p>
                <div className="flex items-center bg-green/10 px-3 py-1 rounded-full">
                  <Award className="h-3 w-3 text-green mr-1" />
                  <p className="text-sm font-medium text-green">예상 수익률: {webtoon.expectedROI}%</p>
                </div>
              </div>
            </div>

            {/* 투자 현황 정보 카드 */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 남은 기간 */}
                <div className="bg-gradient-to-br from-orange/10 to-red/10 rounded-xl p-4 border border-orange/20">
                  <div className="flex items-center mb-2">
                    <div className="bg-orange/20 p-1.5 rounded-lg mr-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-gray">남은 기간</span>
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    {webtoon.status === "completed" ? "마감" : `${webtoon.daysLeft}일`}
                  </p>
                </div>

                {/* 투자자 수 */}
                <div className="bg-gradient-to-br from-green/10 to-emerald/10 rounded-xl p-4 border border-green/20">
                  <div className="flex items-center mb-2">
                    <div className="bg-green/20 p-1.5 rounded-lg mr-2">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-gray">투자자 수</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{dynamicTotalInvestors.toLocaleString()}명</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* 남은 투자금액 */}
                <div className="bg-gradient-to-br from-blue/10 to-purple/10 rounded-xl p-4 border border-blue/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue/20 p-1.5 rounded-lg mr-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-darkblue dark:text-light">남은 투자금액</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.max(0, webtoon.goalAmount - dynamicCurrentRaised) >= 1000000
                        ? `${Math.floor(Math.max(0, webtoon.goalAmount - dynamicCurrentRaised) / 10000).toLocaleString()}만원`
                        : `${Math.max(0, webtoon.goalAmount - dynamicCurrentRaised).toLocaleString()}원`}
                    </p>
                  </div>
                </div>

                {/* 진행률 요약 */}
                <div className="bg-gradient-to-r from-purple/10 to-indigo/10 rounded-xl p-4 border border-purple/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-purple/20 p-1.5 rounded-lg mr-2">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-darkblue dark:text-light">목표까지</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {Math.max(0, 100 - dynamicProgress).toFixed(1)}% 남음
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="summary" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6 bg-white dark:bg-darkblue/20 p-1 rounded-xl shadow-sm border border-gray/10">
            <TabsTrigger
              value="summary"
              className={`rounded-lg transition-all font-medium ${
                activeTab === "summary"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              작품 소개
            </TabsTrigger>
            <TabsTrigger
              value="investors"
              className={`rounded-lg transition-all font-medium ${
                activeTab === "investors"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              투자자 추이
            </TabsTrigger>
            <TabsTrigger
              value="amount"
              className={`rounded-lg transition-all font-medium ${
                activeTab === "amount"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              투자금액 추이
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card className="rounded-2xl mb-6 border-gray/20 bg-white dark:bg-darkblue/30 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 text-darkblue dark:text-light text-lg">작품 소개</h3>
                <p className="text-sm text-darkblue/80 dark:text-light/80 whitespace-pre-line leading-relaxed mb-6">
                  {webtoon.summary}
                </p>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray/5 p-3 rounded-lg">
                      <p className="text-xs text-gray font-medium mb-1">감독</p>
                      <p className="font-medium text-darkblue dark:text-light">{webtoon.director}</p>
                    </div>
                    <div className="bg-gray/5 p-3 rounded-lg">
                      <p className="text-xs text-gray font-medium mb-1">제작사</p>
                      <p className="font-medium text-darkblue dark:text-light">{webtoon.productionCompany}</p>
                    </div>
                  </div>
                  <div className="bg-gray/5 p-3 rounded-lg">
                    <p className="text-xs text-gray font-medium mb-1">배급사</p>
                    <p className="font-medium text-darkblue dark:text-light">{webtoon.distributor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl mb-6 border-gray/20 bg-white dark:bg-darkblue/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-darkblue dark:text-light text-lg">최신 제작 업데이트</h3>
                </div>
                <p className="text-sm text-darkblue/80 dark:text-light/80 leading-relaxed">{webtoon.updateLog}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card className="rounded-2xl mb-6 border-gray/20 bg-white dark:bg-darkblue/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-yellow" />
                  <h3 className="font-bold text-darkblue dark:text-light text-lg">투자자 증가 추이</h3>
                </div>
                {renderInvestorGrowthGraph()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amount">
            <Card className="rounded-2xl mb-6 border-gray/20 bg-white dark:bg-darkblue/30 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green" />
                  <h3 className="font-bold text-darkblue dark:text-light text-lg">투자금액 증가 추이</h3>
                </div>
                {renderAmountGrowthGraph()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 고정 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-dark/95 backdrop-blur-sm border-t border-gray/10 shadow-2xl z-50">
          <div className="flex gap-3 p-4">
            <Button
              className={`flex-1 rounded-xl h-14 text-white font-semibold shadow-lg transition-all duration-200 ${
                hasInvested
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105"
              }`}
              onClick={handleInvest}
            >
              <div className="flex items-center justify-center">
                {hasInvested ? (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    추가 투자
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    투자하기
                  </>
                )}
              </div>
            </Button>
            <Button
              variant="outline"
              className={`rounded-xl w-14 h-14 border-2 transition-all duration-200 ${
                isFavorite
                  ? "bg-yellow/10 border-yellow text-yellow hover:bg-yellow/20 shadow-lg"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50 dark:hover:bg-darkblue/30"
              }`}
              onClick={handleFavorite}
            >
              <Star className={`h-6 w-6 ${isFavorite ? "fill-yellow" : ""}`} />
            </Button>
          </div>

          {/* 상태 메시지 */}
          {getStatusMessage() && (
            <div className="px-4 pb-2">
              <p className="text-xs text-center text-gray-500 bg-gray-100 dark:bg-gray-800 py-2 px-3 rounded-lg">
                {getStatusMessage()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 투자 성공 모달 */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl z-[100]">
          <div className="text-center py-6">
            {/* 성공 아이콘 */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            {/* 제목 */}
            <h2 className="text-2xl font-bold text-darkblue dark:text-light mb-2">
              🎉 {investmentResult?.isAdditionalInvestment ? "추가 투자" : "투자"} 완료!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              성공적으로 {investmentResult?.isAdditionalInvestment ? "추가 투자가" : "투자가"} 완료되었습니다
            </p>

            {/* 투자 결과 정보 */}
            {investmentResult && (
              <div className="space-y-4 mb-6">
                {/* 투자 금액 */}
                <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-4 rounded-xl border border-blue/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-darkblue dark:text-light">투자 금액</span>
                    <span className="text-xl font-bold text-blue-600">₩{investmentResult.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* 예상 수익금 */}
                <div className="bg-gradient-to-r from-green/10 to-green/5 p-4 rounded-xl border border-green/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-darkblue dark:text-light">예상 수익금</span>
                    <span className="text-xl font-bold text-green-600">
                      ₩{investmentResult.expectedReturn.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs text-green-600 font-medium">+{expectedROIValue}% 수익률</span>
                  </div>
                </div>

                {/* 마일리지 적립 */}
                {investmentResult.mileage > 0 && (
                  <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-4 rounded-xl border border-yellow/20">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-darkblue dark:text-light">마일리지 적립</span>
                      <span className="text-xl font-bold text-yellow-600">+{investmentResult.mileage}P</span>
                    </div>
                  </div>
                )}

                {/* 프로젝트 완료 메시지 */}
                {investmentResult.isCompleted && (
                  <div className="bg-gradient-to-r from-purple/10 to-purple/5 p-4 rounded-xl border border-purple/20">
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600 mb-1">🎊 프로젝트 완료!</p>
                      <p className="text-sm text-purple-600">목표 금액이 달성되었습니다</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 확인 버튼 */}
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false)
                window.location.reload()
              }}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 투자 모달 */}
      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto rounded-xl bg-light dark:bg-darkblue border-gray/20 z-[100] p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-darkblue dark:text-light">
              투자 금액 입력
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* 투자 금액 표시 */}
            <div
              className={`p-4 rounded-2xl text-center border transition-all duration-300 ${
                Number.parseInt(keypadInput, 10) > userBalance
                  ? "bg-gradient-to-br from-red/20 to-red/10 border-red/40 animate-pulse"
                  : "bg-gradient-to-br from-green/10 to-yellow/10 border-green/20"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray font-medium">투자 금액</p>
                <p className="text-xs text-gray font-medium">잔액: {userBalance.toLocaleString()}원</p>
              </div>
              <p
                className={`text-3xl md:text-4xl font-bold tracking-tight ${
                  Number.parseInt(keypadInput, 10) > userBalance ? "text-red-500" : "text-darkblue dark:text-light"
                }`}
              >
                {keypadInput === "0" ? "0원" : `${Number.parseInt(keypadInput, 10).toLocaleString()}원`}
              </p>
              {Number.parseInt(keypadInput, 10) > userBalance && (
                <p className="text-sm text-red-500 font-medium mt-2 animate-bounce">⚠️ 잔액이 부족합니다</p>
              )}
            </div>

            {/* 빠른 선택 버튼 - 상단에 1줄로 배치 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                onClick={() => {
                  setKeypadInput("10000")
                  setInputError("")
                }}
                className="rounded-full h-10 px-4 font-semibold border-2 border-gray/20 hover:bg-green/10 hover:border-green/30 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                만원
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKeypadInput("100000")
                  setInputError("")
                }}
                className="rounded-full h-10 px-4 font-semibold border-2 border-gray/20 hover:bg-green/10 hover:border-green/30 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                10만원
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKeypadInput("1000000")
                  setInputError("")
                }}
                className="rounded-full h-10 px-4 font-semibold border-2 border-gray/20 hover:bg-green/10 hover:border-green/30 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                100만원
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setKeypadInput("10000000")
                  setInputError("")
                }}
                className="rounded-full h-10 px-4 font-semibold border-2 border-gray/20 hover:bg-green/10 hover:border-green/30 transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                1000만원
              </Button>
            </div>

            {/* 전화번호 다이얼 스타일 숫자 키패드 */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-14 text-xl font-bold rounded-full border-2 border-gray/20 text-darkblue dark:text-light hover:bg-green/10 hover:border-green/30 transition-all duration-200 shadow-sm"
                  onClick={() => {
                    if (keypadInput === "0") {
                      setKeypadInput(num.toString())
                    } else {
                      setKeypadInput((prev) => prev + num.toString())
                    }
                    setInputError("")
                  }}
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="outline"
                className="h-14 text-sm font-bold rounded-full border-2 border-gray/20 text-darkblue dark:text-light hover:bg-red/10 hover:border-red/30 transition-all duration-200 shadow-sm"
                onClick={() => setKeypadInput("0")}
              >
                초기화
              </Button>
              <Button
                variant="outline"
                className="h-14 text-xl font-bold rounded-full border-2 border-gray/20 text-darkblue dark:text-light hover:bg-blue/10 hover:border-blue/30 transition-all duration-200 shadow-sm"
                onClick={() => {
                  if (keypadInput === "0") {
                    setKeypadInput("0")
                  } else {
                    setKeypadInput((prev) => prev + "0")
                  }
                  setInputError("")
                }}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-14 text-sm font-bold rounded-full border-2 border-gray/20 text-darkblue dark:text-light hover:bg-orange/10 hover:border-orange/30 transition-all duration-200 shadow-sm"
                onClick={() => {
                  if (keypadInput.length > 1) {
                    setKeypadInput((prev) => prev.slice(0, -1))
                  } else {
                    setKeypadInput("0")
                  }
                  setInputError("")
                }}
              >
                ⌫
              </Button>
            </div>

            {/* 예상 수익 및 잔액 정보 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-green/10 to-green/5 p-3 rounded-xl border border-green/20">
                <p className="text-xs text-gray font-medium mb-1">예상 수익금</p>
                <p className="text-base font-bold text-green">
                  {Math.round(Number.parseInt(keypadInput, 10) * (1 + expectedROIValue / 100)).toLocaleString()}원
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow/10 to-yellow/5 p-3 rounded-xl border border-yellow/20">
                <p className="text-xs text-gray font-medium mb-1">투자 후 잔액</p>
                <p className="text-base font-bold text-darkblue dark:text-light">
                  {Math.max(0, userBalance - Number.parseInt(keypadInput, 10)).toLocaleString()}원
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-center pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl h-12 border-2 border-gray/20 text-gray font-semibold hover:bg-gray/10 transition-all duration-200"
              onClick={() => setIsInvestModalOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl h-12 bg-gradient-to-r from-green to-green/90 hover:from-green/90 hover:to-green/80 text-white font-semibold shadow-lg transition-all duration-200"
              onClick={confirmKeypadInput}
              disabled={!!inputError}
            >
              투자 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 잔액 부족 다이얼로그 */}
      <Dialog open={isInsufficientBalanceDialogOpen} onOpenChange={setIsInsufficientBalanceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20 z-[100]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-red-500">⚠️ 잔액 부족</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-gray mb-4">
              현재 잔액이 부족합니다.
              <br />
              어떻게 하시겠습니까?
            </p>
            <div className="bg-blue/10 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-darkblue dark:text-light">현재 잔액:</span>
                <span className="font-bold text-darkblue dark:text-light">{userBalance.toLocaleString()}원</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-3 sm:justify-center">
            <Button
              type="button"
              className="w-full rounded-xl bg-green hover:bg-green/90 text-light h-12 font-semibold"
              onClick={handleChargeAndInvest}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              충전하고 투자하러 가기
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl border-gray/20 text-gray h-12"
              onClick={() => setIsInsufficientBalanceDialogOpen(false)}
            >
              취소하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 충전 확인 다이얼로그 */}
      <Dialog open={isChargeConfirmDialogOpen} onOpenChange={setIsChargeConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20 z-[100]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-darkblue dark:text-light">
              💳 충전 페이지 이동
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green/20 to-blue/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-green" />
            </div>
            <p className="text-sm text-gray mb-4">
              충전 페이지로 이동하여 잔액을 충전한 후
              <br />
              다시 돌아와서 투자를 진행하시겠습니까?
            </p>
            <div className="bg-blue/10 p-3 rounded-lg">
              <p className="text-sm text-darkblue dark:text-light">충전 완료 후 이 페이지로 자동으로 돌아옵니다</p>
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray"
              onClick={() => setIsChargeConfirmDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-green hover:bg-green/90 text-light"
              onClick={confirmChargeAndInvest}
            >
              충전하러 가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 투자 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20 z-[100]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-darkblue dark:text-light">투자 확인</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center mb-6">
              <p className="text-lg font-bold text-darkblue dark:text-light mb-2">{webtoon.title}</p>
              <p className="text-sm text-gray">위 작품에 투자하시겠습니까?</p>
            </div>

            {/* 투자 정보 카드들 */}
            <div className="space-y-3 mb-6">
              {/* 투자 금액 */}
              <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-4 rounded-xl border border-blue/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-darkblue dark:text-light">투자 금액</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {typeof investmentAmount === "number" ? investmentAmount.toLocaleString() : "0"}원
                  </span>
                </div>
              </div>

              {/* 예상 수익금 */}
              <div className="bg-gradient-to-r from-green/10 to-green/5 p-4 rounded-xl border border-green/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-darkblue dark:text-light">예상 수익금</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {typeof expectedReturn === "number" ? expectedReturn.toLocaleString() : "0"}원
                  </span>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-xs text-green-600 font-medium">+{expectedROIValue}% 수익률</span>
                </div>
              </div>

              {/* 잔액 정보 */}
              <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-4 rounded-xl border border-yellow/20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-darkblue dark:text-light">현재 잔액</span>
                    <span className="font-bold text-darkblue dark:text-light">{userBalance.toLocaleString()}원</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-darkblue dark:text-light">투자 후 잔액</span>
                    <span className="font-bold text-yellow-600">
                      {Math.max(0, userBalance - investmentAmount).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 투자 요약 */}
            <div className="bg-gradient-to-r from-purple/10 to-purple/5 p-4 rounded-xl border border-purple/20">
              <div className="text-center">
                <p className="text-sm text-gray mb-2">투자 완료 시 예상 총 자산</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(Math.max(0, userBalance - investmentAmount) + expectedReturn).toLocaleString()}원
                </p>
                <p className="text-xs text-purple-600 mt-1">(잔액 + 예상 수익금)</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-green hover:bg-green/90 text-light"
              onClick={confirmInvestment}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WebtoonDetail
