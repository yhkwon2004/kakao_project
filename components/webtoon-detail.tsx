"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Star, TrendingUp, Users, Calendar, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"

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

  // 웹툰 상세 정보 데이터
  const webtoon = {
    id,
    title: "황녀, 반역자를 각인시키다",
    ageRating: "15",
    genre: "로맨스, 판타지",
    director: "김민지",
    productionCompany: "웹툰 스튜디오",
    distributor: "글로벌 엔터테인먼트",
    currentRaised: 320000000,
    goalAmount: 500000000,
    expectedROI: 15,
    daysLeft: 7,
    totalInvestors: 1250,
    summary: `"황녀, 반역자를 각인시키다"는 판타지 로맨스 웹툰으로, 반역자로 몰린 황녀 아리아나가 자신의 결백을 증명하고 왕국을 되찾기 위한 여정을 그립니다.

아리아나는 어릴 적 친구이자 현재 적국의 왕자인 카이든과 재회하게 되고, 그들은 함께 아리아나를 모함한 진짜 반역자를 찾아 나섭니다.

이 작품은 웹툰으로 큰 인기를 얻었으며, 현재 드라마 제작이 진행 중입니다. 주요 배우 캐스팅이 완료되었으며, 2023년 3분기에 촬영을 시작할 예정입니다.`,
    updateLog:
      "제작팀이 주요 캐릭터 캐스팅을 완료했습니다. 대본 수정 작업이 진행 중입니다. 2023년 3분기에 촬영 시작 예정입니다.",
  }

  // 투자자 증가 추이 데이터
  const investmentGrowthData: InvestmentGrowthData[] = [
    { date: "2023-01", investors: 150, amount: 45000000 },
    { date: "2023-02", investors: 320, amount: 96000000 },
    { date: "2023-03", investors: 580, amount: 174000000 },
    { date: "2023-04", investors: 850, amount: 255000000 },
    { date: "2023-05", investors: 1250, amount: 320000000 },
  ]

  const progress = (webtoon.currentRaised / webtoon.goalAmount) * 100

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "관심 목록에서 제거되었습니다" : "관심 웹툰에 추가되었습니다",
      description: isFavorite
        ? `${webtoon.title}이(가) 관심 목록에서 제거되었습니다.`
        : `${webtoon.title}이(가) 관심 웹툰에 추가되었습니다.`,
    })
  }

  const handleInvest = () => {
    if (investmentAmount >= 10000) {
      setIsConfirmDialogOpen(true)
    }
  }

  const confirmInvestment = () => {
    setIsConfirmDialogOpen(false)
    const expectedReturn = Math.round(investmentAmount * (1 + webtoon.expectedROI / 100))
    toast({
      title: "투자가 완료되었습니다",
      description: `₩${investmentAmount.toLocaleString()} 투자 완료! 예상 수익: ₩${expectedReturn.toLocaleString()}`,
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록 처리
    const value = e.target.value.replace(/[^0-9]/g, "")
    const numValue = Number.parseInt(value, 10) || 0
    setInvestmentAmount(numValue)
    setIsValidAmount(numValue >= 10000)
  }

  // 예상 수익금 계산
  const expectedReturn = Math.round(investmentAmount * (1 + webtoon.expectedROI / 100))

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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zqb39Eu363TJiELHoKxfK5QXreOHct.png"
          alt="썸네일 이미지"
          fill
          className="object-cover"
        />

        {/* 남은 일수 표시 */}
        <div className="absolute top-4 left-4 bg-yellow text-dark text-xs font-medium px-3 py-1 rounded-full z-10">
          {webtoon.daysLeft}일 남음
        </div>

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

      {/* 웹툰 상세 정보 */}
      <div className="p-4">
        {/* 주요 정보 카드 */}
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray">현재 모금액</p>
                <p className="font-bold text-lg text-darkblue dark:text-light">
                  ₩{webtoon.currentRaised.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray">목표 금액</p>
                <p className="font-medium text-darkblue dark:text-light">₩{webtoon.goalAmount.toLocaleString()}</p>
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
            <h3 className="font-bold text-darkblue dark:text-light">투자하기</h3>
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
                />
              </div>
              {!isValidAmount && <p className="text-xs text-red-500 mt-1">최소 투자 금액은 10,000원입니다.</p>}
            </div>
            <div>
              <p className="text-sm text-gray">예상 수익금</p>
              <p className="text-lg font-bold text-green">₩{expectedReturn.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-green hover:bg-green/90 rounded-xl h-12 text-light"
            onClick={handleInvest}
            disabled={!isValidAmount}
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
            <span className="block text-sm text-gray">
              입력하신 금액 {investmentAmount.toLocaleString()}원을 투자하시겠습니까?
            </span>
            <span className="block text-sm text-gray mt-2">
              예상 수익금은 {expectedReturn.toLocaleString()}원입니다.
            </span>
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
