"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  Star,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Check,
  Sparkles,
  AlertTriangle,
  Wallet,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { getWebtoonById } from "@/data/webtoons"
import { Slider } from "@/components/ui/slider"
import { getUserFromStorage } from "@/lib/auth"

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

  // 웹툰 상세 정보 데이터 부분을 수정합니다.
  // 이제 ID를 기반으로 웹툰 정보를 가져오고, 필요한 속성에 기본값을 제공합니다.
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
    expectedROI: webtoonData?.expectedROI ? Number.parseFloat(webtoonData.expectedROI) : 15,
    daysLeft: webtoonData?.daysLeft || 0,
    totalInvestors: webtoonData?.totalInvestors || 0,
    summary: webtoonData?.description || "웹툰 정보를 찾을 수 없습니다.",
    updateLog: webtoonData?.updateLog || "정보 없음",
    isDramatized: webtoonData?.isDramatized || false,
    status: webtoonData?.status || "ongoing",
  }

  // 투자 버튼 비활성화 조건 확인
  const isInvestmentDisabled = webtoon.isDramatized || webtoon.status === "completed" || hasInvested

  // 상태 메시지를 얻기 위한 함수
  const getStatusMessage = () => {
    if (webtoon.isDramatized) return "이미 드라마화가 완료된 작품입니다"
    if (webtoon.status === "completed") return "이미 투자가 마감된 작품입니다"
    if (hasInvested) return "이미 투자한 작품입니다"
    return ""
  }

  // 진행률 계산 부분도 안전하게 수정
  const progress = webtoon.goalAmount > 0 ? (webtoon.currentRaised / webtoon.goalAmount) * 100 : 0

  // 투자자 증가 추이 데이터
  const investmentGrowthData: InvestmentGrowthData[] = [
    { date: "2023-01", investors: 150, amount: 45000000 },
    { date: "2023-02", investors: 320, amount: 96000000 },
    { date: "2023-03", investors: 580, amount: 174000000 },
    { date: "2023-04", investors: 850, amount: 255000000 },
    { date: "2023-05", investors: 1250, amount: 320000000 },
  ]

  // 최소, 최대 투자 금액 설정
  const MIN_INVESTMENT = 10000
  const MAX_INVESTMENT = 10000000
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
    if (user && user.balance) {
      setUserBalance(user.balance)
    }

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
    return investmentAmount <= userBalance && investmentAmount >= MIN_INVESTMENT && !isInvestmentDisabled
  }

  const handleInvest = () => {
    if (canInvest()) {
      setIsConfirmDialogOpen(true)
    } else if (investmentAmount > userBalance) {
      toast({
        title: "잔액 부족",
        description: "투자 금액이 현재 잔액보다 많습니다.",
        variant: "destructive",
        duration: 500,
      })
    }
  }

  const confirmInvestment = () => {
    setIsConfirmDialogOpen(false)

    // 투자 후 잔액 계산
    const newBalance = userBalance - investmentAmount
    setUserBalance(newBalance)

    // 사용자 정보 업데이트
    const user = getUserFromStorage()
    if (user) {
      user.balance = newBalance
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    // 투자 내역 저장
    const investmentsStr = localStorage.getItem("userInvestments")
    const investments = investmentsStr ? JSON.parse(investmentsStr) : []

    // 새 투자 정보 추가
    const newInvestment = {
      webtoonId: id,
      webtoonTitle: webtoon.title,
      amount: investmentAmount,
      date: new Date().toISOString(),
      expectedROI: webtoon.expectedROI,
    }

    investments.push(newInvestment)
    localStorage.setItem("userInvestments", JSON.stringify(investments))

    // 투자 상태 업데이트
    setHasInvested(true)

    // 즐겨찾기에 있는 경우 투자 상태 업데이트
    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    if (storedFavorites) {
      const favorites = JSON.parse(storedFavorites)
      const updatedFavorites = favorites.map((fav: any) => {
        if (fav.slug === id) {
          return { ...fav, invested: true }
        }
        return fav
      })
      localStorage.setItem("favoriteWebtoons", JSON.stringify(updatedFavorites))
    }

    const expectedReturn = Math.round(
      investmentAmount *
        (1 +
          (typeof webtoon.expectedROI === "string"
            ? Number.parseFloat(webtoon.expectedROI.split("-")[0])
            : webtoon.expectedROI) /
            100),
    )

    toast({
      title: "투자가 완료되었습니다",
      description: `₩${investmentAmount.toLocaleString()} 투자 완료! 예상 수익: ₩${expectedReturn.toLocaleString()}`,
      duration: 500, // 0.5초 후 메시지 제거
    })
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

  // 투자자 증가 그래프 렌더링
  const renderInvestorGrowthGraph = () => {
    const maxInvestors = Math.max(...investmentGrowthData.map((d) => d.investors))

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-darkblue dark:text-light">투자자 증가 추이</h3>
          <span className="text-xs text-gray">단위: 명</span>
        </div>
        <div className="relative h-60 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
          {/* Y축 레이블 */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray py-6">
            <span>1500</span>
            <span>1000</span>
            <span>500</span>
            <span>0</span>
          </div>

          {/* 그래프 영역 */}
          <div className="ml-10 h-full flex items-end">
            {investmentGrowthData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                {/* 막대 그래프 */}
                <div
                  className="w-6 bg-yellow rounded-t-md transition-all duration-500 ease-in-out"
                  style={{
                    height: `${(data.investors / 1500) * 100}%`,
                    opacity: activeTab === "investors" ? 1 : 0.7,
                  }}
                ></div>

                {/* X축 레이블 */}
                <span className="text-xs text-gray mt-2">{data.date.split("-")[1]}월</span>
              </div>
            ))}
          </div>

          {/* 현재 투자자 수 표시 */}
          <div className="absolute top-4 right-4 bg-yellow/20 text-darkblue dark:text-light px-3 py-1 rounded-full text-sm font-medium">
            현재 투자자: {webtoon.totalInvestors}명
          </div>
        </div>
      </div>
    )
  }

  // 투자금액 증가 그래프 렌더링
  const renderAmountGrowthGraph = () => {
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-darkblue dark:text-light">투자금액 증가 추이</h3>
          <span className="text-xs text-gray">단위: 백만원</span>
        </div>
        <div className="relative h-60 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
          {/* Y축 레이블 */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray py-6">
            <span>500</span>
            <span>375</span>
            <span>250</span>
            <span>125</span>
            <span>0</span>
          </div>

          {/* 그래프 영역 */}
          <div className="ml-10 h-full flex items-end">
            {investmentGrowthData.map((data, index) => (
              <div key={data.date} className="flex-1 flex flex-col items-center">
                {/* 막대 그래프 */}
                <div
                  className="w-6 bg-green rounded-t-md transition-all duration-500 ease-in-out"
                  style={{
                    height: `${(data.amount / 500000000) * 100}%`,
                    opacity: activeTab === "amount" ? 1 : 0.7,
                  }}
                ></div>

                {/* X축 레이블 */}
                <span className="text-xs text-gray mt-2">{data.date.split("-")[1]}월</span>
              </div>
            ))}
          </div>

          {/* 현재 투자금액 표시 */}
          <div className="absolute top-4 right-4 bg-green/20 text-darkblue dark:text-light px-3 py-1 rounded-full text-sm font-medium">
            현재 투자금액: {(webtoon.currentRaised / 1000000).toFixed(0)}백만원
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
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
      <div className="relative h-80 w-full bg-light flex items-center justify-center">
        <Image
          src={webtoonData?.thumbnail || "/gray-placeholder.png"}
          alt={webtoon.title}
          fill
          className="object-cover"
        />

        {/* 드라마화 완료 뱃지 표시 */}
        {webtoon.isDramatized && (
          <div className="absolute top-4 left-4 bg-green text-light text-xs font-medium px-3 py-1 rounded-full z-10 flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            드라마화 완료
          </div>
        )}

        {/* 남은 일수 표시 (드라마화 안된 경우만) */}
        {!webtoon.isDramatized && webtoon.status === "ongoing" && (
          <div className="absolute top-4 left-4 bg-yellow text-dark text-xs font-medium px-3 py-1 rounded-full z-10">
            {webtoon.daysLeft}일 남음
          </div>
        )}

        {/* 투자 마감 표시 (드라마화 안됐지만 완료된 경우) */}
        {!webtoon.isDramatized && webtoon.status === "completed" && (
          <div className="absolute top-4 left-4 bg-gray text-light text-xs font-medium px-3 py-1 rounded-full z-10">
            투자 마감
          </div>
        )}

        {/* 진행률 표시 */}
        <div className="absolute top-4 right-4 bg-darkblue/80 text-light text-xs font-medium px-3 py-1 rounded-full z-10">
          {progress.toFixed(0)}% 모집됨
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-dark/80 p-4">
          <h2 className="text-xl font-bold text-light">{webtoon.title}</h2>
          <p className="text-gray text-sm">{webtoon.genre}</p>
        </div>
      </div>
      <p className="text-xs text-gray text-center mt-1 px-4">
        ※ 현재는 임시 이미지입니다. 추후 실제 이미지로 교체될 수 있습니다.
      </p>

      {/* 사용자 잔액 표시 */}
      <div className="p-4 pt-2">
        <div className="flex items-center justify-between bg-green/10 rounded-xl p-3">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 text-green mr-2" />
            <span className="text-sm font-medium text-darkblue dark:text-light">내 잔액</span>
          </div>
          <span className="font-bold text-green">₩{userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* 웹툰 상세 정보 */}
      <div className="p-4 pt-0">
        {/* 주요 정보 카드 */}
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-4">
            {/* 웹툰 상세 정보 카드 부분에서 toLocaleString() 호출 전에 안전 검사 추가 */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray">현재 모금액</p>
                <p className="font-bold text-lg text-darkblue dark:text-light">
                  ₩{typeof webtoon.currentRaised === "number" ? webtoon.currentRaised.toLocaleString() : "0"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray">목표 금액</p>
                <p className="font-medium text-darkblue dark:text-light">
                  ₩{typeof webtoon.goalAmount === "number" ? webtoon.goalAmount.toLocaleString() : "0"}
                </p>
              </div>
            </div>

            <Progress value={progress} className="h-2 mb-2 bg-gray/20" indicatorClassName="bg-yellow" />

            <div className="flex justify-between items-center">
              <p className="text-sm text-darkblue dark:text-light">{progress.toFixed(1)}% 완료</p>
              <p className="text-sm font-medium text-green">예상 수익률: {webtoon.expectedROI}%</p>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray/10">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-yellow/20 flex items-center justify-center mb-1">
                  <Calendar className="h-5 w-5 text-yellow" />
                </div>
                <p className="text-xs text-gray">남은 기간</p>
                <p className="text-sm font-medium text-darkblue dark:text-light">{webtoon.daysLeft}일</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green/20 flex items-center justify-center mb-1">
                  <Users className="h-5 w-5 text-green" />
                </div>
                <p className="text-xs text-gray">투자자 수</p>
                <p className="text-sm font-medium text-darkblue dark:text-light">{webtoon.totalInvestors}명</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-darkblue/20 flex items-center justify-center mb-1">
                  <DollarSign className="h-5 w-5 text-darkblue dark:text-light" />
                </div>
                <p className="text-xs text-gray">예상 수익률</p>
                <p className="text-sm font-medium text-green">{webtoon.expectedROI}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 컨텐츠 */}
        <Tabs defaultValue="summary" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
            <TabsTrigger
              value="summary"
              className={`rounded-full transition-all ${
                activeTab === "summary"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              작품 소개
            </TabsTrigger>
            <TabsTrigger
              value="investors"
              className={`rounded-full transition-all ${
                activeTab === "investors"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              투자자 추이
            </TabsTrigger>
            <TabsTrigger
              value="amount"
              className={`rounded-full transition-all ${
                activeTab === "amount"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              투자금액 추이
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 text-darkblue dark:text-light">작품 소개</h3>
                <p className="text-sm text-darkblue/80 dark:text-light/80 whitespace-pre-line">{webtoon.summary}</p>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray/10">
                  <div>
                    <p className="text-sm text-gray">감독</p>
                    <p className="font-medium text-darkblue dark:text-light">{webtoon.director}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray">제작사</p>
                    <p className="font-medium text-darkblue dark:text-light">{webtoon.productionCompany}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray">배급사</p>
                    <p className="font-medium text-darkblue dark:text-light">{webtoon.distributor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3 text-darkblue dark:text-light">최신 제작 업데이트</h3>
                <p className="text-sm text-darkblue/80 dark:text-light/80">{webtoon.updateLog}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-yellow" />
                  <h3 className="font-bold text-darkblue dark:text-light">투자자 증가 추이</h3>
                </div>
                {renderInvestorGrowthGraph()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amount">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green" />
                  <h3 className="font-bold text-darkblue dark:text-light">투자금액 증가 추이</h3>
                </div>
                {renderAmountGrowthGraph()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 투자 섹션 */}
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-darkblue dark:text-light">투자하기</h3>

              {/* 투자 상태 메시지 표시 */}
              {isInvestmentDisabled && (
                <div className="text-sm flex items-center text-gray">
                  <AlertTriangle className="h-4 w-4 mr-1 text-yellow" />
                  {getStatusMessage()}
                </div>
              )}
            </div>

            {/* 이미 투자한 경우 메시지 */}
            {hasInvested && (
              <div className="bg-green/10 rounded-lg p-3 text-sm text-darkblue dark:text-light flex items-center">
                <Check className="h-4 w-4 mr-2 text-green" />이 웹툰에 이미 투자하셨습니다. 마이페이지에서 투자 내역을
                확인하세요.
              </div>
            )}

            {/* 드라마화 완료된 경우에만 보여줄 메시지 */}
            {webtoon.isDramatized && (
              <div className="bg-green/10 rounded-lg p-3 text-sm text-darkblue dark:text-light flex items-center">
                <Check className="h-4 w-4 mr-2 text-green" />이 웹툰은 이미 드라마화가 완료되었습니다. 다른 작품에
                투자해보세요!
              </div>
            )}

            {/* 투자가 마감된 경우에만 보여줄 메시지 */}
            {!webtoon.isDramatized && webtoon.status === "completed" && (
              <div className="bg-yellow/10 rounded-lg p-3 text-sm text-darkblue dark:text-light flex items-center">
                <Check className="h-4 w-4 mr-2 text-yellow" />이 웹툰의 투자가 마감되었습니다. 다른 투자 가능한 작품을
                확인해보세요!
              </div>
            )}

            <div>
              <label
                htmlFor="investment-amount"
                className="text-sm font-medium block mb-2 text-darkblue dark:text-light"
              >
                투자 금액을 입력하세요 (최소 10,000원부터)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray">₩</span>
                <Input
                  id="investment-amount"
                  type="text"
                  className="pl-8 rounded-xl border-gray/20"
                  value={investmentAmount}
                  onChange={handleAmountChange}
                  inputMode="numeric"
                  disabled={isInvestmentDisabled}
                />
              </div>
              {!isValidAmount && <p className="text-xs text-red-500 mt-1">최소 투자 금액은 10,000원입니다.</p>}
              {investmentAmount > userBalance && (
                <p className="text-xs text-red-500 mt-1">투자 금액이 현재 잔액보다 많습니다.</p>
              )}
            </div>

            {/* 슬라이더 추가 */}
            <div className="pt-4">
              <Slider
                defaultValue={[MIN_INVESTMENT]}
                max={MAX_INVESTMENT}
                min={0}
                step={STEP_SIZE}
                value={[investmentAmount]}
                onValueChange={handleSliderChange}
                disabled={isInvestmentDisabled}
                className={isInvestmentDisabled ? "opacity-50" : ""}
              />
              <div className="flex justify-between mt-2 text-xs text-gray">
                <span>0원</span>
                <span>500만원</span>
                <span>1,000만원</span>
              </div>
            </div>

            {/* 빠른 선택 버튼 추가 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {investmentRanges.map((range) => (
                <Button
                  key={range.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInvestmentAmount(range.value)
                    setIsValidAmount(range.value >= MIN_INVESTMENT)
                  }}
                  className={`rounded-full ${isInvestmentDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isInvestmentDisabled}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray">투자 후 잔액</p>
                <p className="text-lg font-bold text-darkblue dark:text-light">
                  ₩{Math.max(0, userBalance - investmentAmount).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray">예상 수익금</p>
                <p className="text-lg font-bold text-green">₩{expectedReturn.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            className={`flex-1 rounded-xl h-12 text-light ${
              !canInvest() ? "bg-gray hover:bg-gray/90" : "bg-green hover:bg-green/90"
            }`}
            onClick={handleInvest}
            disabled={!canInvest()}
          >
            💰 투자하기
          </Button>
          <Button
            variant="outline"
            className={`rounded-xl w-12 h-12 ${
              isFavorite
                ? "bg-yellow/10 border-yellow text-yellow hover:bg-yellow/20"
                : "border-gray text-gray hover:bg-light dark:hover:bg-darkblue/30"
            }`}
            onClick={handleFavorite}
          >
            <Star className={`h-5 w-5 ${isFavorite ? "fill-yellow" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 투자 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold text-darkblue dark:text-light">투자 확인</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            {/* 투자 확인 다이얼로그에서도 안전 검사 추가 */}
            <span className="block text-sm text-gray">
              입력하신 금액 {typeof investmentAmount === "number" ? investmentAmount.toLocaleString() : "0"}원을
              투자하시겠습니까?
            </span>
            <span className="block text-sm text-gray mt-2">
              예상 수익금은 {typeof expectedReturn === "number" ? expectedReturn.toLocaleString() : "0"}원입니다.
            </span>

            {/* 투자 전후 잔액 표시 */}
            <div className="mt-4 p-3 bg-green/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-darkblue dark:text-light">현재 잔액:</span>
                <span className="font-bold text-darkblue dark:text-light">₩{userBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-darkblue dark:text-light">투자 후 잔액:</span>
                <span className="font-bold text-green">
                  ₩{Math.max(0, userBalance - investmentAmount).toLocaleString()}
                </span>
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
