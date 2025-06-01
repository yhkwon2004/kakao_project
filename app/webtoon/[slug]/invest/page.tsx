"use client"

import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Wallet, Target, CheckCircle, ArrowRight, Shield, Award, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { formatKoreanCurrency } from "@/lib/format-currency"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function InvestPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const webtoonId = params.slug as string

  const [userBalance, setUserBalance] = useState(0)
  const [investmentAmount, setInvestmentAmount] = useState("0")
  const [inputError, setInputError] = useState("")
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [investmentResult, setInvestmentResult] = useState<{
    amount: number
    expectedReturn: number
    mileage: number
    isCompleted: boolean
    isAdditionalInvestment?: boolean
  } | null>(null)
  const [isInsufficientBalanceModalOpen, setIsInsufficientBalanceModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const webtoonData = getWebtoonById(webtoonId)
  const [dynamicProgress, setDynamicProgress] = useState(0)
  const [dynamicCurrentRaised, setDynamicCurrentRaised] = useState(0)
  const [dynamicTotalInvestors, setDynamicTotalInvestors] = useState(0)
  const [hasInvested, setHasInvested] = useState(false)

  // 웹툰 데이터가 없는 경우 기본값 설정
  const webtoon = {
    id: webtoonId,
    title: webtoonData?.title || "웹툰 정보를 찾을 수 없습니다",
    thumbnail: webtoonData?.thumbnail || "/placeholder.svg",
    currentRaised: webtoonData?.currentRaised || 0,
    goalAmount: webtoonData?.goalAmount || 100000000,
    expectedROI: webtoonData?.expectedROI ? Number.parseFloat(webtoonData.expectedROI.toString()) : 15,
    daysLeft: webtoonData?.daysLeft || 0,
    genre: webtoonData?.genre || "정보 없음",
  }

  // 최소, 최대 투자 금액 설정
  const MIN_INVESTMENT = 10000
  const MAX_INVESTMENT = 2000000000

  // 만원 단위 체크 함수 추가
  const isValidAmount = (amount: number) => {
    return amount >= MIN_INVESTMENT && amount % 10000 === 0
  }

  // 사용자 정보 및 웹툰 진행 상황 로드
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserBalance(user.balance || 0)
    }

    // 웹툰 진행 상황 로드
    const progressData = localStorage.getItem(`webtoon_progress_${webtoonId}`)
    if (progressData) {
      const data = JSON.parse(progressData)
      setDynamicCurrentRaised(data.currentRaised)
      setDynamicTotalInvestors(data.totalInvestors)
      setDynamicProgress((data.currentRaised / webtoon.goalAmount) * 100)
    } else {
      setDynamicCurrentRaised(webtoon.currentRaised)
      setDynamicTotalInvestors(0)
      setDynamicProgress((webtoon.currentRaised / webtoon.goalAmount) * 100)
    }

    // 투자 내역 확인
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      const hasInvestedInThisWebtoon = investments.some((inv: any) => inv.id === webtoonId)
      setHasInvested(hasInvestedInThisWebtoon)
    }
  }, [webtoonId, webtoon.goalAmount, webtoon.currentRaised])

  // 예상 수익률 계산
  const expectedROIValue = webtoon.expectedROI || 15
  const currentAmount = Number(investmentAmount) || 0
  const expectedReturn = Math.round(currentAmount * (1 + expectedROIValue / 100))
  const profitAmount = expectedReturn - currentAmount
  const remainingAmount = Math.max(0, webtoon.goalAmount - dynamicCurrentRaised)

  // 키패드 입력 처리
  const handleKeypadInput = (value: string) => {
    if (value === "C") {
      setInvestmentAmount("0")
      setInputError("")
      return
    }

    if (value === "⌫") {
      if (investmentAmount.length > 1) {
        setInvestmentAmount((prev) => prev.slice(0, -1))
      } else {
        setInvestmentAmount("0")
      }
      setInputError("")
      return
    }

    let newAmount: string
    if (investmentAmount === "0") {
      newAmount = value
    } else {
      newAmount = investmentAmount + value
    }

    // 잔액 초과 시 자동으로 최대 잔액으로 조정
    const numericAmount = Number(newAmount)
    if (numericAmount > userBalance) {
      setInvestmentAmount(userBalance.toString())
      setInputError(`최대 투자 가능 금액은 ${formatKoreanCurrency(userBalance)}입니다.`)
      setTimeout(() => setInputError(""), 3000) // 3초 후 에러 메시지 제거
    } else if (numericAmount > remainingAmount) {
      // 남은 투자금액 초과 시 자동으로 남은 투자금액으로 조정
      setInvestmentAmount(remainingAmount.toString())
      setInputError(`남은 투자 가능 금액은 ${formatKoreanCurrency(remainingAmount)}입니다.`)
      setTimeout(() => setInputError(""), 3000) // 3초 후 에러 메시지 제거
    } else {
      setInvestmentAmount(newAmount)
      setInputError("")
    }
  }

  // 빠른 선택 금액
  const quickAmounts = [10000, 50000, 100000, userBalance]

  // 투자 실행
  const handleInvest = () => {
    const amount = Number(investmentAmount)

    // 유효성 검사
    if (amount < MIN_INVESTMENT) {
      setInputError(`최소 투자 금액은 ${formatKoreanCurrency(MIN_INVESTMENT)}입니다.`)
      return
    }

    if (!isValidAmount(amount)) {
      setInputError("만원 단위로만 투자 가능합니다.")
      return
    }

    if (amount > userBalance) {
      setIsInsufficientBalanceModalOpen(true)
      return
    }

    if (amount > remainingAmount) {
      setInputError("남은 투자 금액을 초과했습니다.")
      return
    }

    // 투자 확인 모달 열기
    setIsConfirmModalOpen(true)
  }

  // 실제 투자 실행 함수
  const executeInvestment = () => {
    const amount = Number(investmentAmount)

    // 투자 처리
    const newBalance = userBalance - amount
    setUserBalance(newBalance)

    // localStorage의 사용자 정보 업데이트
    const user = getUserFromStorage()
    if (user) {
      user.balance = newBalance
      localStorage.setItem("currentUser", JSON.stringify(user))
    }

    // 웹툰 진행 상황 업데이트
    const newCurrentRaised = dynamicCurrentRaised + amount
    const isNewInvestor = !hasInvested
    const newTotalInvestors = isNewInvestor ? dynamicTotalInvestors + 1 : dynamicTotalInvestors
    const newProgress = (newCurrentRaised / webtoon.goalAmount) * 100
    const isCompleted = newProgress >= 100

    // 웹툰 진행 상황 저장
    const progressData = {
      currentRaised: newCurrentRaised,
      totalInvestors: newTotalInvestors,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(`webtoon_progress_${webtoonId}`, JSON.stringify(progressData))

    // 현재 날짜
    const currentDate = new Date().toISOString().split("T")[0]

    // 기존 투자 내역 가져오기
    const existingInvestmentsStr = localStorage.getItem("userInvestments")
    const existingInvestments = existingInvestmentsStr ? JSON.parse(existingInvestmentsStr) : []

    // 기존 투자가 있는지 확인
    const existingInvestmentIndex = existingInvestments.findIndex(
      (inv: any) => inv.id === webtoonId || inv.webtoonId === webtoonId,
    )

    if (existingInvestmentIndex !== -1) {
      // 기존 투자 업데이트 (추가 투자)
      existingInvestments[existingInvestmentIndex] = {
        ...existingInvestments[existingInvestmentIndex],
        amount: (existingInvestments[existingInvestmentIndex].amount || 0) + amount,
        date: currentDate,
        progress: newProgress,
        status: isCompleted ? "완료" : "진행중",
      }
    } else {
      // 새로운 투자 내역 추가
      const newInvestment = {
        id: webtoonId,
        webtoonId: webtoonId,
        title: webtoon.title,
        webtoonTitle: webtoon.title,
        thumbnail: webtoon.thumbnail,
        webtoonThumbnail: webtoon.thumbnail,
        amount: amount,
        date: currentDate,
        expectedROI: expectedROIValue,
        progress: newProgress,
        status: isCompleted ? "완료" : "진행중",
        slug: webtoonId,
      }
      existingInvestments.push(newInvestment)
    }

    localStorage.setItem("userInvestments", JSON.stringify(existingInvestments))

    // 마일리지 적립
    const mileageToAdd = Math.floor(amount / 1000) * 1 // 1000원당 1 마일리지
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
            id: Date.now().toString(),
            date: currentDate,
            amount: mileageToAdd,
            type: "earned",
            description: `웹툰 투자: ${webtoon.title} (${formatKoreanCurrency(amount)})`,
            source: "investment",
          },
          ...(mileageData.history || []),
        ],
      }

      localStorage.setItem("userMileage", JSON.stringify(updatedMileageData))
    }

    // 이벤트 발생
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("userDataChanged"))
    window.dispatchEvent(new CustomEvent("mileageUpdated"))
    window.dispatchEvent(
      new CustomEvent("webtoonProgressUpdate", {
        detail: { webtoonId: webtoonId, ...progressData },
      }),
    )
    window.dispatchEvent(
      new CustomEvent("investmentUpdate", {
        detail: {
          webtoonId: webtoonId,
          amount: amount,
          newBalance: newBalance,
          totalInvestment: existingInvestments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0),
        },
      }),
    )

    // 투자 결과 설정
    setInvestmentResult({
      amount: amount,
      expectedReturn: expectedReturn,
      mileage: mileageToAdd,
      isCompleted: isCompleted,
      isAdditionalInvestment: hasInvested,
    })

    // 확인 모달 닫고 성공 모달 열기
    setIsConfirmModalOpen(false)
    setIsSuccessModalOpen(true)

    // 토스트 메시지
    toast({
      title: "투자 성공!",
      description: `${webtoon.title}에 ${formatKoreanCurrency(amount)}을 투자하셨습니다.`,
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-3 bg-white/90 dark:bg-darkblue/90 backdrop-blur-sm border-b border-gray/10 shadow-sm shrink-0">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Logo size="sm" showSubtitle={false} />
        </div>
        <div className="flex items-center gap-2 bg-green/10 px-3 py-1.5 rounded-full">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-semibold text-green-600">{formatKoreanCurrency(userBalance)}</span>
        </div>
      </div>

      {/* 메인 컨텐츠 - 스크롤 없이 화면에 맞춤 */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full grid grid-rows-[auto_1fr_auto] gap-3">
          {/* 웹툰 정보 카드 - 컴팩트 */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-darkblue/80 backdrop-blur-sm shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Image
                    src={webtoon.thumbnail || "/placeholder.svg"}
                    alt={webtoon.title}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 bg-yellow text-dark text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                    {webtoon.daysLeft}일
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-darkblue dark:text-light mb-1 truncate">{webtoon.title}</h1>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {webtoon.genre
                      .split(",")
                      .slice(0, 2)
                      .map((genre, index) => (
                        <span
                          key={index}
                          className="bg-blue/10 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{dynamicProgress.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>+{expectedROIValue}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 진행률 바 - 컴팩트 */}
              <div className="mt-3 space-y-1">
                <div className="h-2 bg-gray/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow to-green transition-all duration-1000"
                    style={{ width: `${Math.min(dynamicProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray">
                  <span>{formatKoreanCurrency(dynamicCurrentRaised)}</span>
                  <span>{formatKoreanCurrency(webtoon.goalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 투자 입력 영역 - 메인 */}
          <div className="flex-1 grid grid-rows-[auto_1fr_auto] gap-3 min-h-0">
            {/* 투자 금액 표시 */}
            <div
              className={`p-4 rounded-2xl text-center border-2 transition-all duration-300 shrink-0 ${
                Number(investmentAmount) > userBalance
                  ? "bg-gradient-to-br from-red/20 to-red/10 border-red/40 shadow-red-200/50"
                  : "bg-gradient-to-br from-blue/10 to-purple/10 border-blue/30 shadow-blue-200/50"
              } shadow-lg`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray">투자 금액</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">안전투자</span>
                </div>
              </div>
              <p
                className={`text-3xl font-bold tracking-tight mb-1 ${
                  Number(investmentAmount) > userBalance ? "text-red-500" : "text-darkblue dark:text-[#F5D949]"
                }`}
              >
                {investmentAmount === "0" ? "0원" : formatKoreanCurrency(Number(investmentAmount))}
              </p>
              {inputError && <p className="text-sm text-red-500 font-medium">{inputError}</p>}
            </div>

            {/* 키패드 영역 */}
            <div className="flex-1 grid grid-rows-[auto_1fr_auto] gap-3 min-h-0">
              {/* 빠른 선택 */}
              <div className="shrink-0">
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        let finalAmount = amount

                        // 전액 버튼인 경우 (마지막 인덱스)
                        if (index === quickAmounts.length - 1) {
                          // 사용자 잔액과 남은 모금액 중 작은 값을 선택
                          finalAmount = Math.min(userBalance, remainingAmount)
                        }

                        setInvestmentAmount(finalAmount.toString())
                        setInputError("")
                      }}
                      className="h-10 text-xs font-semibold border border-gray/20 hover:bg-blue/10 hover:border-blue/30 transition-all duration-200 rounded-lg"
                    >
                      {index === quickAmounts.length - 1 ? "전액" : formatKoreanCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 숫자 키패드 */}
              <div className="grid grid-cols-3 gap-2 min-h-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    className="h-full text-lg font-bold rounded-xl border border-gray/20 hover:bg-blue/10 hover:border-blue/30 hover:scale-105 transition-all duration-200 shadow-sm min-h-[3rem]"
                    onClick={() => handleKeypadInput(num.toString())}
                  >
                    {num}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  className="h-full text-lg font-bold rounded-xl border border-red/30 bg-red/5 hover:bg-red/10 text-red-600 transition-all duration-200 shadow-sm min-h-[3rem]"
                  onClick={() => handleKeypadInput("C")}
                >
                  C
                </Button>

                <Button
                  variant="outline"
                  className="h-full text-xl font-bold rounded-xl border border-gray/20 hover:bg-blue/10 hover:border-blue/30 hover:scale-105 transition-all duration-200 shadow-sm min-h-[3rem]"
                  onClick={() => handleKeypadInput("0")}
                >
                  0
                </Button>

                <Button
                  variant="outline"
                  className="h-full text-lg font-bold rounded-xl border border-orange/30 bg-orange/5 hover:bg-orange/10 text-orange-600 transition-all duration-200 shadow-sm min-h-[3rem]"
                  onClick={() => handleKeypadInput("⌫")}
                >
                  ⌫
                </Button>
              </div>
            </div>

            {/* 예상 수익 & 투자 버튼 */}
            <div className="shrink-0 space-y-3">
              {/* 투자 버튼 */}
              <Button
                onClick={handleInvest}
                disabled={
                  Number(investmentAmount) < MIN_INVESTMENT || Number(investmentAmount) > userBalance || !!inputError
                }
                className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>
                    {Number(investmentAmount) < MIN_INVESTMENT
                      ? `최소 ${formatKoreanCurrency(MIN_INVESTMENT)}`
                      : `${formatKoreanCurrency(Number(investmentAmount))} 투자하기`}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 투자 성공 모달 */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white drop-shadow-sm" />
            </div>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">🎉 투자 완료!</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              성공적으로 투자가 완료되었습니다
            </DialogDescription>
          </DialogHeader>

          {investmentResult && (
            <div className="space-y-3 mb-4">
              {/* 투자 금액 */}
              <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-darkblue dark:text-light">투자 금액</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatKoreanCurrency(investmentResult.amount)}
                  </span>
                </div>
              </div>

              {/* 예상 수익금 */}
              <div className="bg-gradient-to-r from-green/10 to-green/5 p-3 rounded-xl border border-green/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-darkblue dark:text-light">예상 수익금</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatKoreanCurrency(investmentResult.expectedReturn)}
                  </span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-green-600 font-medium">+{expectedROIValue}% 수익률</span>
                </div>
              </div>

              {/* 마일리지 적립 */}
              {investmentResult.mileage > 0 && (
                <div className="bg-gradient-to-r from-yellow/10 to-yellow/5 p-3 rounded-xl border border-yellow/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-darkblue dark:text-light">마일리지 적립</span>
                    <span className="text-lg font-bold text-yellow-600">+{investmentResult.mileage}P</span>
                  </div>
                </div>
              )}

              {/* 프로젝트 완료 메시지 */}
              {investmentResult.isCompleted && (
                <div className="bg-gradient-to-r from-purple/10 to-purple/5 p-3 rounded-xl border border-purple/20">
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600 mb-1">🎊 프로젝트 완료!</p>
                    <p className="text-sm text-purple-600">목표 금액이 달성되었습니다</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false)
                router.push(`/webtoon/${webtoonId}`)
              }}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              투자 페이지로 돌아가기
            </Button>
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false)
                router.push("/asset")
              }}
              variant="outline"
              className="w-full h-11 border-2 border-green/30 text-green-600 hover:bg-green/10 font-semibold rounded-xl transition-all duration-200"
            >
              <Wallet className="h-4 w-4 mr-2" />
              투자 목록 확인하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 잔액 부족 모달 */}
      <Dialog open={isInsufficientBalanceModalOpen} onOpenChange={setIsInsufficientBalanceModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <Wallet className="h-10 w-10 text-white drop-shadow-sm" />
            </div>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">💰 잔액 부족</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              투자하려는 금액이 현재 잔액을 초과합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mb-4">
            <div className="bg-gradient-to-r from-red/10 to-red/5 p-3 rounded-xl border border-red/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">투자 희망 금액</span>
                <span className="text-lg font-bold text-red-600">{formatKoreanCurrency(Number(investmentAmount))}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">현재 잔액</span>
                <span className="text-lg font-bold text-blue-600">{formatKoreanCurrency(userBalance)}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange/10 to-orange/5 p-3 rounded-xl border border-orange/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">부족한 금액</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatKoreanCurrency(Number(investmentAmount) - userBalance)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setIsInsufficientBalanceModalOpen(false)
                router.push("/mypage/payment")
              }}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <Wallet className="h-4 w-4 mr-2" />
              잔액 충전하기
            </Button>
            <Button
              onClick={() => setIsInsufficientBalanceModalOpen(false)}
              variant="outline"
              className="w-full h-11 border-2 border-gray/30 text-gray-600 hover:bg-gray/10 font-semibold rounded-xl transition-all duration-200"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 투자 확인 모달 */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
              <Target className="h-10 w-10 text-white drop-shadow-sm" />
            </div>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">💰 투자 확인</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">투자하시겠습니까?</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mb-4">
            {/* 웹툰 정보 */}
            <div className="bg-gradient-to-r from-blue/10 to-blue/5 p-3 rounded-xl border border-blue/20">
              <div className="flex items-center gap-3">
                <Image
                  src={webtoon.thumbnail || "/placeholder.svg"}
                  alt={webtoon.title}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-darkblue dark:text-light">{webtoon.title}</p>
                  <p className="text-xs text-gray">예상 수익률 +{expectedROIValue}%</p>
                </div>
              </div>
            </div>

            {/* 투자 금액 */}
            <div className="bg-gradient-to-r from-green/10 to-green/5 p-3 rounded-xl border border-green/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">투자 금액</span>
                <span className="text-lg font-bold text-green-600">
                  {formatKoreanCurrency(Number(investmentAmount))}
                </span>
              </div>
            </div>

            {/* 예상 수익 */}
            <div className="bg-gradient-to-r from-emerald/10 to-emerald/5 p-3 rounded-xl border border-emerald/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">예상 수익금</span>
                <span className="text-lg font-bold text-emerald-600">{formatKoreanCurrency(expectedReturn)}</span>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-emerald-600 font-medium">
                  +{formatKoreanCurrency(profitAmount)} (+{expectedROIValue}%)
                </span>
              </div>
            </div>

            {/* 투자 후 잔액 */}
            <div className="bg-gradient-to-r from-orange/10 to-orange/5 p-3 rounded-xl border border-orange/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-darkblue dark:text-light">투자 후 잔액</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatKoreanCurrency(userBalance - Number(investmentAmount))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              onClick={executeInvestment}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
            >
              <Zap className="h-4 w-4 mr-2" />
              투자하기
            </Button>
            <Button
              onClick={() => setIsConfirmModalOpen(false)}
              variant="outline"
              className="w-full h-11 border-2 border-gray/30 text-gray-600 hover:bg-gray/10 font-semibold rounded-xl transition-all duration-200"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
