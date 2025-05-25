"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Sparkles,
  Star,
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
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type WebtoonDetailProps = {
  id: string
}

export function WebtoonDetail({ id }: WebtoonDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState(10000)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")
  const [userBalance, setUserBalance] = useState(150000)
  const [hasInvested, setHasInvested] = useState(false)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [keypadInput, setKeypadInput] = useState("0")
  const [inputError, setInputError] = useState("")
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
    expectedROI: webtoonData?.expectedROI ? Number.parseFloat(webtoonData.expectedROI.toString()) : 15,
    daysLeft: webtoonData?.daysLeft || 0,
    totalInvestors: webtoonData?.totalInvestors || 0,
    summary: webtoonData?.summary || webtoonData?.description || "웹툰 정보를 찾을 수 없습니다.",
    updateLog: webtoonData?.updateLog || "정보 없음",
    isDramatized: webtoonData?.isDramatized || false,
    status: webtoonData?.status || "ongoing",
    thumbnail: webtoonData?.thumbnail || "/placeholder.svg",
  }

  // 동적 상태 관리 - localStorage에서 실시간 데이터 로드
  const [dynamicProgress, setDynamicProgress] = useState(0)
  const [dynamicCurrentRaised, setDynamicCurrentRaised] = useState(0)
  const [dynamicTotalInvestors, setDynamicTotalInvestors] = useState(0)

  // 웹툰 진행 상황을 localStorage에서 로드
  const loadWebtoonProgress = () => {
    const progressData = localStorage.getItem(`webtoon_progress_${id}`)
    if (progressData) {
      const data = JSON.parse(progressData)
      setDynamicCurrentRaised(data.currentRaised)
      setDynamicTotalInvestors(data.totalInvestors)
      setDynamicProgress((data.currentRaised / webtoon.goalAmount) * 100)
    } else {
      // 기본값 설정
      setDynamicCurrentRaised(webtoon.currentRaised)
      setDynamicTotalInvestors(webtoon.totalInvestors)
      setDynamicProgress((webtoon.currentRaised / webtoon.goalAmount) * 100)
    }
  }

  // 웹툰 진행 상황을 localStorage에 저장
  const saveWebtoonProgress = (currentRaised: number, totalInvestors: number) => {
    const progressData = {
      currentRaised,
      totalInvestors,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(`webtoon_progress_${id}`, JSON.stringify(progressData))

    // 전역 이벤트 발생으로 다른 컴포넌트들에 알림
    window.dispatchEvent(
      new CustomEvent("webtoonProgressUpdate", {
        detail: { webtoonId: id, ...progressData },
      }),
    )
  }

  useEffect(() => {
    loadWebtoonProgress()

    // 다른 컴포넌트에서 발생한 진행 상황 업데이트 감지
    const handleProgressUpdate = (event: CustomEvent) => {
      if (event.detail.webtoonId === id) {
        setDynamicCurrentRaised(event.detail.currentRaised)
        setDynamicTotalInvestors(event.detail.totalInvestors)
        setDynamicProgress((event.detail.currentRaised / webtoon.goalAmount) * 100)
      }
    }

    window.addEventListener("webtoonProgressUpdate", handleProgressUpdate as EventListener)

    return () => {
      window.removeEventListener("webtoonProgressUpdate", handleProgressUpdate as EventListener)
    }
  }, [id, webtoon.goalAmount])

  // 상태 메시지를 얻기 위한 함수
  const getStatusMessage = () => {
    if (webtoon.isDramatized) return "이미 드라마화가 완료된 작품입니다"
    if (webtoon.status === "completed") return "이미 투자가 마감된 작품입니다"
    return ""
  }

  // 최소, 최대 투자 금액 설정
  const MIN_INVESTMENT = 10000
  const MAX_INVESTMENT = 2000000000

  // 사용자 정보 및 잔액 로드
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      if (user.balance === undefined) {
        user.balance = 150000
        localStorage.setItem("currentUser", JSON.stringify(user))
      }
      setUserBalance(user.balance)
    }
  }, [])

  useEffect(() => {
    // 로컬 스토리지에서 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      const hasInvestedInThisWebtoon = investments.some((inv: any) => inv.webtoonId === id)
      setHasInvested(hasInvestedInThisWebtoon)
    }

    // 즐겨찾기 상태 확인
    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites)
      const isFav = favorites.some((fav: any) => fav.slug === id)
      setIsFavorite(isFav)
    } else {
      setIsFavorite(false)
    }
  }, [id])

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)

    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    let favorites = storedFavorites ? JSON.parse(storedFavorites) : []

    if (!isFavorite) {
      const newFavorite = {
        id: webtoon.id,
        title: webtoon.title,
        genre: webtoon.genre || "판타지, 로맨스",
        status: webtoon.status === "completed" ? "투자 완료" : "투자 가능",
        notification: true,
        slug: id,
        invested: hasInvested,
      }
      favorites.push(newFavorite)
    } else {
      favorites = favorites.filter((fav: any) => fav.slug !== id)
    }

    localStorage.setItem("favoriteWebtoons", JSON.stringify(favorites))

    toast({
      title: isFavorite ? "관심 목록에서 제거되었습니다" : "관심 웹툰에 추가되었습니다",
      description: isFavorite
        ? `${webtoon.title}이(가) 관심 목록에서 제거되었습니다.`
        : `${webtoon.title}이(가) 관심 웹툰에 추가되었습니다.`,
      duration: 300,
    })
  }

  // 투자 가능 여부 확인
  const canInvest = () => {
    const remainingAmount = webtoon.goalAmount - dynamicCurrentRaised
    const maxInvestAmount = Math.min(investmentAmount, remainingAmount)
    return maxInvestAmount > 0 && maxInvestAmount <= userBalance
  }

  const handleInvest = () => {
    const remainingAmount = webtoon.goalAmount - dynamicCurrentRaised

    if (investmentAmount > userBalance) {
      setIsInsufficientBalanceDialogOpen(true)
      return
    }

    if (investmentAmount > remainingAmount) {
      setInvestmentAmount(remainingAmount)
      setKeypadInput(remainingAmount.toString())
    }

    if (canInvest()) {
      openInvestModal()
    }
  }

  const confirmInvestment = () => {
    setIsConfirmDialogOpen(false)

    const remainingAmount = webtoon.goalAmount - dynamicCurrentRaised
    const actualInvestAmount = Math.min(investmentAmount, remainingAmount)

    // 투자 후 잔액 계산
    const newBalance = userBalance - actualInvestAmount
    setUserBalance(newBalance)

    // 웹툰 데이터 업데이트
    const updatedCurrentRaised = dynamicCurrentRaised + actualInvestAmount
    const updatedProgress = (updatedCurrentRaised / webtoon.goalAmount) * 100
    const isCompleted = updatedProgress >= 100

    // 즉시 UI 상태 업데이트
    setDynamicCurrentRaised(updatedCurrentRaised)
    setDynamicProgress(updatedProgress)
    // 기존 투자자인지 확인 (추가 투자는 카운트하지 않음)
    const isNewInvestor = !hasInvested
    const updatedTotalInvestors = isNewInvestor ? dynamicTotalInvestors + 1 : dynamicTotalInvestors
    setDynamicTotalInvestors(updatedTotalInvestors)

    // 웹툰 진행 상황 저장 (다른 페이지에서도 반영되도록)
    saveWebtoonProgress(updatedCurrentRaised, updatedTotalInvestors)

    // 사용자 정보 업데이트
    const user = getUserFromStorage()
    if (user) {
      user.balance = newBalance
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    // 현재 날짜 가져오기
    const currentDate = new Date().toISOString().split("T")[0]

    // 투자 내역 저장 (웹툰 정보 포함)
    const investmentsStr = localStorage.getItem("userInvestments")
    const investments = investmentsStr ? JSON.parse(investmentsStr) : []

    const existingInvestmentIndex = investments.findIndex((inv: any) => inv.webtoonId === id)

    if (existingInvestmentIndex !== -1) {
      investments[existingInvestmentIndex].amount += actualInvestAmount
      investments[existingInvestmentIndex].date = currentDate
      investments[existingInvestmentIndex].progress = updatedProgress
      investments[existingInvestmentIndex].status = isCompleted ? "완료됨" : "제작 중"
    } else {
      const newInvestment = {
        webtoonId: id,
        webtoonTitle: webtoon.title,
        webtoonThumbnail: webtoon.thumbnail,
        amount: actualInvestAmount,
        date: currentDate,
        expectedROI: webtoon.expectedROI,
        progress: updatedProgress,
        status: isCompleted ? "완료됨" : "제작 중",
        slug: id,
        id: id,
        title: webtoon.title,
        thumbnail: webtoon.thumbnail,
      }
      investments.push(newInvestment)
    }

    localStorage.setItem("userInvestments", JSON.stringify(investments))

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

    const expectedROIValue =
      typeof webtoon.expectedROI === "string"
        ? Number.parseFloat(webtoon.expectedROI.split("-")[0] || "15")
        : webtoon.expectedROI || 15
    const expectedReturn = Math.round(actualInvestAmount * (1 + expectedROIValue / 100))

    // 투자 결과 설정 및 성공 모달 표시
    setInvestmentResult({
      amount: actualInvestAmount,
      expectedReturn,
      mileage: mileageToAdd,
      isCompleted,
      isAdditionalInvestment: hasInvested,
    })

    // 성공 모달 표시
    setTimeout(() => {
      setIsSuccessModalOpen(true)
    }, 500)
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
    const remainingAmount = webtoon.goalAmount - dynamicCurrentRaised

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

  // 예상 수익률 계산
  const expectedROIValue =
    typeof webtoon.expectedROI === "string"
      ? Number.parseFloat(webtoon.expectedROI.split("-")[0] || "15")
      : webtoon.expectedROI || 15
  const expectedReturn = Math.round(investmentAmount * (1 + expectedROIValue / 100))

  // 투자자 증가 그래프 데이터를 동적으로 생성
  const generateInvestorGrowthData = () => {
    const baseData = [45, 67, 89, 112, 134, 156]
    const currentInvestors = dynamicTotalInvestors
    return [...baseData, currentInvestors]
  }

  const investorGrowthData = generateInvestorGrowthData()
  const maxInvestors = Math.max(...investorGrowthData)

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
        <Image src={webtoon.thumbnail || "/gray-placeholder.png"} alt={webtoon.title} fill className="object-cover" />

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
          <h1 className="text-2xl font-bold text-white mb-3">{webtoon.title}</h1>
          <div className="flex flex-wrap gap-2">
            {webtoon.genre.split(",").map((genre, index) => (
              <span
                key={index}
                className="bg-yellow/90 text-dark text-xs font-semibold px-3 py-1 rounded-full shadow-lg"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

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
        {/* 모집 완료 안내 카드 - 100% 달성 시 표시 */}
        {dynamicProgress >= 100 && (
          <Card className="rounded-2xl mb-6 border-green/30 bg-gradient-to-r from-green/10 to-emerald/10 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">🎉 모집 완료!</h3>
                <p className="text-sm text-green-700 mb-4">
                  목표 금액 {webtoon.goalAmount.toLocaleString()}원이 모두 모집되었습니다.
                </p>
                <div className="bg-white/50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">
                    총 {dynamicTotalInvestors}명의 투자자가 참여했습니다
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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

              <div className="relative">
                <div className="h-4 bg-gray/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow to-green transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(dynamicProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
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
              className={`rounded-lg transition-all font-medium text-xs ${
                activeTab === "summary"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              작품 소개
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className={`rounded-lg transition-all font-medium text-xs ${
                activeTab === "details"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              제작 정보
            </TabsTrigger>
            <TabsTrigger
              value="investors"
              className={`rounded-lg transition-all font-medium text-xs ${
                activeTab === "investors"
                  ? "bg-yellow text-dark shadow-sm"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              투자자 그래프
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
          </TabsContent>

          <TabsContent value="details">
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
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-darkblue dark:text-light text-lg">투자자 수 증가 추이</h3>
                </div>

                {/* 투자자 증가 그래프 */}
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray">최근 6개월</span>
                    <span className="text-sm text-gray">단위: 명</span>
                  </div>

                  {/* 선형 그래프 */}
                  <div className="relative h-48 bg-gradient-to-t from-blue/5 to-transparent rounded-lg p-4 border border-blue/10 overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="none">
                      {/* 그리드 라인 */}
                      <defs>
                        <pattern id="grid" width="50" height="32" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 32" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                      </defs>
                      <rect x="20" y="20" width="280" height="140" fill="url(#grid)" />

                      {/* 투자자 수 증가 라인 */}
                      <polyline
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={investorGrowthData
                          .map(
                            (value, index) =>
                              `${20 + (index / (investorGrowthData.length - 1)) * 280},${160 - (value / maxInvestors) * 120}`,
                          )
                          .join(" ")}
                      />

                      {/* 데이터 포인트 */}
                      {investorGrowthData.map((value, index) => {
                        const x = 20 + (index / (investorGrowthData.length - 1)) * 280
                        const y = 160 - (value / maxInvestors) * 120
                        return (
                          <g key={index}>
                            <circle cx={x} cy={y} r="3" fill="#3B82F6" stroke="white" strokeWidth="2" />
                            <text
                              x={x}
                              y={y - 8}
                              textAnchor="middle"
                              className="text-xs fill-blue-600 font-medium"
                              style={{ fontSize: "10px" }}
                            >
                              {value}
                            </text>
                          </g>
                        )
                      })}

                      {/* 영역 채우기 */}
                      <polygon
                        fill="url(#gradient)"
                        points={`${investorGrowthData
                          .map(
                            (value, index) =>
                              `${20 + (index / (investorGrowthData.length - 1)) * 280},${160 - (value / maxInvestors) * 120}`,
                          )
                          .join(" ")} 300,160 20,160`}
                        opacity="0.2"
                      />

                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* X축 라벨 - 모바일 최적화 */}
                    <div className="flex justify-between mt-2 text-xs text-gray px-1">
                      <span className="text-[10px] sm:text-xs">6개월전</span>
                      <span className="text-[10px] sm:text-xs">5개월전</span>
                      <span className="text-[10px] sm:text-xs">4개월전</span>
                      <span className="text-[10px] sm:text-xs">3개월전</span>
                      <span className="text-[10px] sm:text-xs">2개월전</span>
                      <span className="text-[10px] sm:text-xs">1개월전</span>
                      <span className="text-[10px] sm:text-xs">현재</span>
                    </div>
                  </div>

                  {/* 투자자 통계 - 모바일 최적화 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <div className="bg-gradient-to-br from-blue/10 to-blue/5 p-3 sm:p-4 rounded-xl border border-blue/20">
                      <div className="flex items-center mb-2">
                        <div className="bg-blue/20 p-1 sm:p-1.5 rounded-lg mr-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray">총 투자자</span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{dynamicTotalInvestors}명</p>
                      <p className="text-xs text-green-600 mt-1">
                        +{Math.floor(dynamicTotalInvestors * 0.15)}명 (이번 달)
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green/10 to-green/5 p-3 sm:p-4 rounded-xl border border-green/20">
                      <div className="flex items-center mb-2">
                        <div className="bg-green/20 p-1 sm:p-1.5 rounded-lg mr-2">
                          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-gray">증가율</span>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-green-600">+247%</p>
                      <p className="text-xs text-green-600 mt-1">지난 6개월 대비</p>
                    </div>
                  </div>

                  {/* 투자자 분포 */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple/10 to-indigo/10 rounded-xl border border-purple/20">
                    <h4 className="font-bold text-darkblue dark:text-light mb-3">투자자 분포</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray">신규 투자자</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray/20 rounded-full overflow-hidden">
                            <div className="w-3/5 h-full bg-blue-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-blue-600">60%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray">기존 투자자</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray/20 rounded-full overflow-hidden">
                            <div className="w-2/5 h-full bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-green-600">40%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 px-4 pb-32">
  <div className="flex gap-3">
    <Button
      className={`flex-1 rounded-xl h-14 font-semibold shadow-lg transition-all duration-200 ${
        dynamicProgress >= 100
          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
          : hasInvested
            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 text-white"
            : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 text-white"
      }`}
      onClick={dynamicProgress >= 100 ? undefined : handleInvest}
      disabled={dynamicProgress >= 100}
    >
      <div className="flex items-center justify-center">
        {dynamicProgress >= 100 ? (
          <>
            <CheckCircle className="h-5 w-5 mr-2" /> 모집 완료
          </>
        ) : hasInvested ? (
          <>
            <Plus className="h-5 w-5 mr-2" /> 추가 투자
          </>
        ) : (
          <>
            <Wallet className="h-5 w-5 mr-2" /> 투자하기
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
</div>

          {/* 상태 메시지 */}
          {(getStatusMessage() || dynamicProgress >= 100) && (
            <div className="px-4 pb-2">
              <p
                className={`text-xs text-center py-2 px-3 rounded-lg ${
                  dynamicProgress >= 100
                    ? "text-green-600 bg-green-100 dark:bg-green-900/20 font-medium"
                    : "text-gray-500 bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {dynamicProgress >= 100 ? "🎉 목표 금액이 모두 모집되었습니다!" : getStatusMessage()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 투자 성공 모달 */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-darkblue dark:text-light mb-2">
              🎉 {investmentResult?.isAdditionalInvestment ? "추가 투자" : "투자"} 완료!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300 mb-6">
              성공적으로 {investmentResult?.isAdditionalInvestment ? "추가 투자가" : "투자가"} 완료되었습니다
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-6">
            {/* 성공 아이콘 */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

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


          {/* 투자 금액 표시 */}
          <div className="py-3 space-y-4">
            {/* 투자 금액 표시 */}
            <div
              className={`p-6 rounded-2xl text-center border-2 transition-all duration-300 ${
                Number.parseInt(keypadInput, 10) > userBalance
                  ? "bg-gradient-to-br from-red/20 to-red/10 border-red/40 animate-pulse shadow-red-200/50"
                  : "bg-gradient-to-br from-blue/10 to-purple/10 border-blue/30 shadow-blue-200/50"
              } shadow-lg`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray font-semibold">투자 금액</p>
                </div>
                <div className="flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-gray" />
                  <p className="text-xs text-gray font-medium">잔액: {userBalance.toLocaleString()}원</p>
                </div>
              </div>
              <p
                className={`text-4xl md:text-5xl font-bold tracking-tight mb-2 ${
                  Number.parseInt(keypadInput, 10) > userBalance ? "text-red-500" : "text-darkblue dark:text-light"
                }`}
              >
                {keypadInput === "0" ? "0원" : `${Number.parseInt(keypadInput, 10).toLocaleString()}원`}
              </p>
              {Number.parseInt(keypadInput, 10) > userBalance && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-red-500 font-semibold">잔액이 부족합니다</p>
                </div>
              )}
            </div>

            {/* 빠른 선택 버튼 - 전문적인 디자인 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-darkblue dark:text-light">빠른 선택</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKeypadInput(userBalance.toString())
                    setInputError("")
                  }}
                  className="h-8 px-3 text-xs font-semibold bg-gradient-to-r from-green/10 to-emerald/10 border-green/30 text-green-700 hover:bg-green/20 hover:border-green/40 transition-all duration-200"
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  전액 투자
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "1만원", value: 10000 },
                  { label: "10만원", value: 100000 },
                  { label: "100만원", value: 1000000 },
                  { label: "1000만원", value: 10000000 },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    onClick={() => {
                      setKeypadInput(option.value.toString())
                      setInputError("")
                    }}
                    className="h-12 text-xs font-semibold border-2 border-gray/20 hover:bg-blue/10 hover:border-blue/30 transition-all duration-200 rounded-xl shadow-sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 전문적인 숫자 키패드 */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-darkblue dark:text-light">직접 입력</h4>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-16 text-xl font-bold rounded-2xl border-2 border-gray/20 text-darkblue dark:text-light hover:bg-blue/10 hover:border-blue/30 hover:scale-105 transition-all duration-200 shadow-sm"
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
                  className="h-16 text-sm font-bold rounded-2xl border-2 border-gray/20 text-red-600 hover:bg-red/10 hover:border-red/30 hover:scale-105 transition-all duration-200 shadow-sm"
                  onClick={() => setKeypadInput("0")}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs">C</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 text-2xl font-bold rounded-2xl border-2 border-gray/20 text-darkblue dark:text-light hover:bg-blue/10 hover:border-blue/30 hover:scale-105 transition-all duration-200 shadow-sm"
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
                  className="h-16 text-lg font-bold rounded-2xl border-2 border-gray/20 text-orange-600 hover:bg-orange/10 hover:border-orange/30 hover:scale-105 transition-all duration-200 shadow-sm"
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
            <DialogDescription className="text-center text-sm text-gray">
              현재 잔액이 부족합니다. 어떻게 하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
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
            <DialogDescription className="text-center text-sm text-gray">
              충전 페이지로 이동하여 잔액을 충전한 후 다시 돌아와서 투자를 진행하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green/20 to-blue/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-green" />
            </div>
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
            <DialogDescription className="text-center text-sm text-gray">위 작품에 투자하시겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center mb-6">
              <p className="text-lg font-bold text-darkblue dark:text-light mb-2">{webtoon.title}</p>
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
