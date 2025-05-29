"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Heart,
  Share2,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock,
  Star,
  Play,
  BookOpen,
  Award,
  Zap,
  Shield,
  DollarSign,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage, saveUserToStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { formatKoreanCurrency } from "@/lib/format-currency"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

interface WebtoonDetailProps {
  id: string
}

export function WebtoonDetail({ id }: WebtoonDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isFavorited, setIsFavorited] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [dynamicProgress, setDynamicProgress] = useState(0)
  const [dynamicCurrentRaised, setDynamicCurrentRaised] = useState(0)
  const [dynamicTotalInvestors, setDynamicTotalInvestors] = useState(0)
  const [hasInvested, setHasInvested] = useState(false)
  const [userInvestmentAmount, setUserInvestmentAmount] = useState(0)
  const [userInvestmentDate, setUserInvestmentDate] = useState<string | null>(null)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

  const webtoonData = getWebtoonById(id)

  // 사용자 정보 로드
  const user = getUserFromStorage()
  const [webtoon, setWebtoon] = useState(webtoonData)

  useEffect(() => {
    if (user) {
      setUserBalance(user.balance || 0)
    }
  }, [user])

  useEffect(() => {
    setWebtoon(getWebtoonById(id))
  }, [id])

  useEffect(() => {
    // 즐겨찾기 상태 로드
    const favoritesStr = localStorage.getItem("userFavorites")
    if (favoritesStr) {
      const favorites = JSON.parse(favoritesStr)
      setIsFavorited(favorites.includes(id))
    } else {
      setIsFavorited(false)
    }

    // 웹툰 진행 상황 로드
    const progressData = localStorage.getItem(`webtoon_progress_${id}`)
    if (progressData) {
      const data = JSON.parse(progressData)
      setDynamicCurrentRaised(data.currentRaised)
      setDynamicTotalInvestors(data.totalInvestors)
      setDynamicProgress((data.currentRaised / webtoon.goalAmount) * 100)
    } else {
      setDynamicCurrentRaised(webtoon.currentRaised)
      setDynamicTotalInvestors(webtoon.totalInvestors || 0)
      setDynamicProgress((webtoon.currentRaised / webtoon.goalAmount) * 100)
    }

    // 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      const userInvestment = investments.find((inv: any) => inv.id === id || inv.webtoonId === id)
      if (userInvestment) {
        setHasInvested(true)
        setUserInvestmentAmount(userInvestment.amount || 0)
        setUserInvestmentDate(userInvestment.date || userInvestment.investmentTime || null)
      } else {
        setHasInvested(false)
        setUserInvestmentAmount(0)
        setUserInvestmentDate(null)
      }
    } else {
      setHasInvested(false)
      setUserInvestmentAmount(0)
      setUserInvestmentDate(null)
    }
  }, [id, webtoon?.goalAmount, webtoon?.currentRaised, webtoon?.totalInvestors])

  // 24시간 이내 투자인지 확인
  const canRefund = () => {
    if (!hasInvested || !userInvestmentDate) return false
    const investmentDate = new Date(userInvestmentDate)
    const now = new Date()
    const hoursDiff = (now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff < 24
  }

  // 환불 처리
  const handleRefund = async () => {
    if (!hasInvested || !userInvestmentDate) return

    try {
      // 사용자 잔액 업데이트
      const user = getUserFromStorage()
      if (user) {
        user.balance = (user.balance || 0) + userInvestmentAmount
        saveUserToStorage(user)
        setUserBalance(user.balance)
      }

      // 투자 내역에서 제거
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        const investments = JSON.parse(investmentsStr)
        const updatedInvestments = investments.filter((inv: any) => inv.id !== id && inv.webtoonId !== id)
        localStorage.setItem("userInvestments", JSON.stringify(updatedInvestments))
      }

      // 웹툰 진행 상황 업데이트 (투자 금액 차감)
      const progressData = localStorage.getItem(`webtoon_progress_${id}`)
      if (progressData) {
        const data = JSON.parse(progressData)
        const newCurrentRaised = Math.max(0, data.currentRaised - userInvestmentAmount)
        const newTotalInvestors = Math.max(0, data.totalInvestors - 1)

        const updatedProgressData = {
          currentRaised: newCurrentRaised,
          totalInvestors: newTotalInvestors,
          lastUpdated: new Date().toISOString(),
        }
        localStorage.setItem(`webtoon_progress_${id}`, JSON.stringify(updatedProgressData))

        // 상태 업데이트
        setDynamicCurrentRaised(newCurrentRaised)
        setDynamicTotalInvestors(newTotalInvestors)
        setDynamicProgress((newCurrentRaised / webtoon.goalAmount) * 100)
      }

      // 환불 내역 추가 (결제 내역에 표시용)
      const refundRecord = {
        id: `refund_${Date.now()}`,
        amount: userInvestmentAmount,
        method: "투자 취소",
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        fee: 0,
        type: "refund",
        webtoonTitle: webtoon.title,
        webtoonId: id,
      }

      const chargeHistoryStr = localStorage.getItem("chargeHistory")
      const chargeHistory = chargeHistoryStr ? JSON.parse(chargeHistoryStr) : []
      const updatedChargeHistory = [refundRecord, ...chargeHistory]
      localStorage.setItem("chargeHistory", JSON.stringify(updatedChargeHistory))

      // 투자 상태 초기화
      setHasInvested(false)
      setUserInvestmentAmount(0)
      setUserInvestmentDate(null)

      // 이벤트 발생
      window.dispatchEvent(new Event("userDataChanged"))
      window.dispatchEvent(new Event("investmentUpdate"))
      window.dispatchEvent(
        new CustomEvent("webtoonProgressUpdate", {
          detail: { webtoonId: id },
        }),
      )

      toast({
        title: "환불 신청 완료",
        description: `${webtoon.title} 투자가 취소되었습니다. ${userInvestmentAmount.toLocaleString()}원이 환불 처리됩니다.`,
      })

      setIsRefundModalOpen(false)
    } catch (error) {
      toast({
        title: "환불 실패",
        description: "환불 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  if (!webtoon) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] dark:bg-[#323233]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#323233] dark:text-[#F5D949] mb-4">웹툰을 찾을 수 없습니다</h1>
          <Button
            onClick={() => router.back()}
            className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-semibold"
          >
            돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const handleFavoriteToggle = () => {
    const favoritesStr = localStorage.getItem("userFavorites")
    const favorites = favoritesStr ? JSON.parse(favoritesStr) : []

    if (isFavorited) {
      const updatedFavorites = favorites.filter((favId: string) => favId !== id)
      localStorage.setItem("userFavorites", JSON.stringify(updatedFavorites))
      setIsFavorited(false)
      toast({
        title: "즐겨찾기 해제",
        description: "즐겨찾기에서 제거되었습니다.",
      })
    } else {
      favorites.push(id)
      localStorage.setItem("userFavorites", JSON.stringify(favorites))
      setIsFavorited(true)
      toast({
        title: "즐겨찾기 추가",
        description: "즐겨찾기에 추가되었습니다.",
      })
    }

    window.dispatchEvent(new Event("storage"))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: webtoon.title,
        text: `${webtoon.title} - 카카오 FANance에서 투자해보세요!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "링크 복사됨",
        description: "클립보드에 링크가 복사되었습니다.",
      })
    }
  }

  const handleInvest = () => {
    if (dynamicProgress >= 100) {
      toast({
        title: "투자 마감",
        description: "이미 목표 금액이 달성된 프로젝트입니다.",
        variant: "destructive",
      })
      return
    }

    if (userBalance < 10000) {
      toast({
        title: "잔액 부족",
        description: "투자를 위해 잔액을 충전해주세요.",
        variant: "destructive",
      })
      router.push("/mypage/payment")
      return
    }

    router.push(`/webtoon/${id}/invest`)
  }

  const remainingAmount = Math.max(0, webtoon.goalAmount - dynamicCurrentRaised)
  const isCompleted = dynamicProgress >= 100
  const canRefundInvestment = canRefund()

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#323233]">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 bg-[#F9F9F9] dark:bg-[#3F3F3F] border-b border-[#C2BDAD] dark:border-[#454858] sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Logo size="sm" showSubtitle={false} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            className={`${
              isFavorited
                ? "text-[#D16561] hover:bg-[#D16561]/10"
                : "text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 pb-20">
        {/* 히어로 섹션 */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-br from-[#E5E4DC] to-[#C2BDAD] dark:from-[#3F4458] dark:to-[#383B4B] overflow-hidden">
            <Image
              src={webtoon.thumbnail || "/placeholder.svg"}
              alt={webtoon.title}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#323233]/60 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Image
                  src={webtoon.thumbnail || "/placeholder.svg"}
                  alt={webtoon.title}
                  width={120}
                  height={160}
                  className="rounded-xl shadow-2xl border-4 border-[#F9F9F9] dark:border-[#3F3F3F]"
                />
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-[#4F8F78] text-[#F9F9F9] text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    완료
                  </div>
                )}
              </div>
              <div className="flex-1 text-[#F9F9F9]">
                <h1 className="text-2xl font-bold mb-2">{webtoon.title || "제목 없음"}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(webtoon.genre || "").split(",").map((genre, index) => (
                    <Badge key={index} className="bg-[#F9DF52]/20 text-[#F9DF52] border-[#F9DF52]/30 backdrop-blur-sm">
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{webtoon.daysLeft || 0}일 남음</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{dynamicTotalInvestors}명 참여</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 투자 현황 카드 */}
        <div className="p-4">
          <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">투자 현황</h2>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#5F859F]" />
                  <span className="text-lg font-bold text-[#5F859F]">{dynamicProgress.toFixed(1)}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 진행률 바 */}
              <div className="space-y-2">
                <div className="h-3 bg-[#E5E4DC] dark:bg-[#454858] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F9DF52] to-[#F5C882] transition-all duration-1000 rounded-full"
                    style={{ width: `${Math.min(dynamicProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-[#989898]">
                  <span>{formatKoreanCurrency(dynamicCurrentRaised)}</span>
                  <span>{formatKoreanCurrency(webtoon.goalAmount)}</span>
                </div>
              </div>

              {/* 투자 정보 그리드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#E5E4DC] dark:bg-[#383B4B] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-[#4F8F78]" />
                    <span className="text-sm font-medium text-[#989898]">예상 수익률</span>
                  </div>
                  <p className="text-xl font-bold text-[#4F8F78]">
                    +{webtoon.expectedROI?.toString().replace("%", "") || "0"}%
                  </p>
                </div>

                <div className="bg-[#E5E4DC] dark:bg-[#383B4B] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-[#5F859F]" />
                    <span className="text-sm font-medium text-[#989898]">남은 기간</span>
                  </div>
                  <p className="text-xl font-bold text-[#5F859F]">{webtoon.daysLeft}일</p>
                </div>

                <div className="bg-[#E5E4DC] dark:bg-[#383B4B] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#706FB9]" />
                    <span className="text-sm font-medium text-[#989898]">참여자 수</span>
                  </div>
                  <p className="text-xl font-bold text-[#706FB9]">{dynamicTotalInvestors}명</p>
                </div>

                <div className="bg-[#E5E4DC] dark:bg-[#383B4B] p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-[#D16561]" />
                    <span className="text-sm font-medium text-[#989898]">남은 금액</span>
                  </div>
                  <p className="text-lg font-bold text-[#D16561]">{formatKoreanCurrency(remainingAmount)}</p>
                </div>
              </div>

              {/* 사용자 투자 정보 */}
              {hasInvested && (
                <div className="bg-gradient-to-r from-[#F9DF52]/20 to-[#F5C882]/20 dark:from-[#F9DF52]/10 dark:to-[#F5C882]/10 p-4 rounded-xl border border-[#F9DF52]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-[#F9DF52]" />
                    <span className="text-sm font-medium text-[#323233] dark:text-[#F5D949]">내 투자 현황</span>
                    {canRefundInvestment && (
                      <Badge className="bg-orange-100 text-orange-600 text-xs">24시간 내 환불 가능</Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#989898]">투자 금액</span>
                    <span className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">
                      {formatKoreanCurrency(userInvestmentAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#989898]">예상 수익</span>
                    <span className="text-lg font-bold text-[#4F8F78]">
                      {formatKoreanCurrency(Math.round(userInvestmentAmount * (1 + Number(webtoon.expectedROI) / 100)))}
                    </span>
                  </div>
                  {userInvestmentDate && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[#989898]">투자일</span>
                      <span className="text-sm text-[#989898]">{userInvestmentDate}</span>
                    </div>
                  )}
                  {canRefundInvestment && (
                    <Button
                      onClick={() => setIsRefundModalOpen(true)}
                      variant="outline"
                      className="w-full mt-3 border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      투자 환불하기
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#E5E4DC] dark:bg-[#383B4B] p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-[#F9DF52] data-[state=active]:text-[#323233] text-[#989898]"
              >
                개요
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-lg data-[state=active]:bg-[#F9DF52] data-[state=active]:text-[#323233] text-[#989898]"
              >
                상세정보
              </TabsTrigger>
              <TabsTrigger
                value="updates"
                className="rounded-lg data-[state=active]:bg-[#F9DF52] data-[state=active]:text-[#323233] text-[#989898]"
              >
                업데이트
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949] flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#5F859F]" />
                    작품 소개
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-[#323233] dark:text-[#F5C882] leading-relaxed">
                    {webtoon.description || "설명이 없습니다"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#4F8F78]" />
                    투자 혜택
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <DollarSign className="h-5 w-5 text-[#4F8F78]" />
                    <div>
                      <p className="font-medium text-[#323233] dark:text-[#F5D949]">수익 분배</p>
                      <p className="text-sm text-[#989898]">작품 수익의 일정 비율을 투자자에게 분배</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <Play className="h-5 w-5 text-[#5F859F]" />
                    <div>
                      <p className="font-medium text-[#323233] dark:text-[#F5D949]">우선 시청권</p>
                      <p className="text-sm text-[#989898]">완성된 작품을 일반 공개 전에 먼저 감상</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <Star className="h-5 w-5 text-[#F9DF52]" />
                    <div>
                      <p className="font-medium text-[#323233] dark:text-[#F5D949]">특별 굿즈</p>
                      <p className="text-sm text-[#989898]">투자자 전용 한정 굿즈 및 아트북 제공</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4 space-y-4">
              <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">제작 정보</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#989898] mb-1">장르</p>
                      <p className="font-medium text-[#323233] dark:text-[#F5C882]">{webtoon.genre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#989898] mb-1">예상 에피소드</p>
                      <p className="font-medium text-[#323233] dark:text-[#F5C882]">12-16화</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#989898] mb-1">제작 기간</p>
                      <p className="font-medium text-[#323233] dark:text-[#F5C882]">6-8개월</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#989898] mb-1">플랫폼</p>
                      <p className="font-medium text-[#323233] dark:text-[#F5C882]">카카오페이지</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">투자 조건</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <span className="text-[#989898]">최소 투자 금액</span>
                    <span className="font-bold text-[#323233] dark:text-[#F5D949]">10,000원</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <span className="text-[#989898]">예상 수익률</span>
                    <span className="font-bold text-[#4F8F78]">+{webtoon.expectedROI}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#E5E4DC] dark:bg-[#383B4B] rounded-lg">
                    <span className="text-[#989898]">수익 분배 시기</span>
                    <span className="font-bold text-[#323233] dark:text-[#F5D949]">작품 완성 후</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates" className="mt-4 space-y-4">
              <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F]">
                <CardHeader>
                  <h3 className="font-bold text-[#323233] dark:text-[#F5D949]">최근 업데이트</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-l-4 border-[#F9DF52] pl-4">
                    <p className="font-medium text-[#323233] dark:text-[#F5D949] mb-1">캐스팅 완료</p>
                    <p className="text-sm text-[#989898] mb-2">주요 성우진 캐스팅이 완료되었습니다.</p>
                    <p className="text-xs text-[#989898]">2024.01.15</p>
                  </div>
                  <div className="border-l-4 border-[#5F859F] pl-4">
                    <p className="font-medium text-[#323233] dark:text-[#F5D949] mb-1">스토리보드 완성</p>
                    <p className="text-sm text-[#989898] mb-2">전체 에피소드의 스토리보드 작업이 완료되었습니다.</p>
                    <p className="text-xs text-[#989898]">2024.01.10</p>
                  </div>
                  <div className="border-l-4 border-[#4F8F78] pl-4">
                    <p className="font-medium text-[#323233] dark:text-[#F5D949] mb-1">투자 목표 50% 달성</p>
                    <p className="text-sm text-[#989898] mb-2">투자 목표 금액의 50%를 달성했습니다!</p>
                    <p className="text-xs text-[#989898]">2024.01.05</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 하단 투자 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F9F9F9] dark:bg-[#3F3F3F] border-t border-[#C2BDAD] dark:border-[#454858] backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-xs text-[#989898] mb-1">현재 잔액</p>
            <p className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">{formatKoreanCurrency(userBalance)}</p>
          </div>
          <Button
            onClick={handleInvest}
            disabled={isCompleted}
            className={`flex-2 h-14 text-lg font-bold rounded-xl transition-all duration-200 ${
              isCompleted
                ? "bg-[#989898] text-[#F9F9F9] cursor-not-allowed"
                : userBalance < 10000
                  ? "bg-[#D16561] hover:bg-[#D16561]/90 text-[#F9F9F9]"
                  : "bg-gradient-to-r from-[#F9DF52] to-[#F5C882] hover:from-[#F5C882] hover:to-[#F9DF52] text-[#323233]"
            }`}
          >
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <Shield className="h-5 w-5" />
                  <span>투자 완료</span>
                </>
              ) : userBalance < 10000 ? (
                <>
                  <Zap className="h-5 w-5" />
                  <span>충전 후 투자하기</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  <span>투자하기</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </div>

      {/* 환불 확인 모달 */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <AlertTriangle className="h-10 w-10 text-white drop-shadow-sm" />
            </div>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">투자 환불</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              정말로 이 투자를 환불하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mb-4">
            <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">웹툰</span>
                <span className="text-lg font-bold text-blue-600">{webtoon.title}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red/10 to-red/5 p-3 rounded-xl border border-red/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">환불 금액</span>
                <span className="text-lg font-bold text-red-600">₩{userInvestmentAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-3 rounded-xl border border-yellow/20">
              <div className="text-center">
                <p className="text-sm text-yellow-600 font-medium">환불 처리까지 1-2일 소요될 수 있습니다.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={handleRefund}
              className="w-full h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              환불 신청하기
            </Button>
            <Button
              onClick={() => setIsRefundModalOpen(false)}
              variant="outline"
              className="w-full h-11 border-2 border-gray/30 text-gray-600 hover:bg-gray/10 font-semibold rounded-xl transition-all duration-200"
            >
              계속 투자하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
