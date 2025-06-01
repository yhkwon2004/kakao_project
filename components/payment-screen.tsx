"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Smartphone,
  Building,
  TrendingDown,
  TrendingUp,
  Receipt,
  Download,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage, saveUserToStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

interface PaymentMethod {
  id: string
  type: "card" | "bank" | "kakao" | "naver"
  name: string
  number: string
  isDefault: boolean
}

interface TransactionRecord {
  id: string
  amount: number
  method: string
  status: "completed" | "pending" | "failed"
  date: string
  fee: number
  type: "charge" | "refund" | "investment"
  webtoonTitle?: string
  webtoonId?: string
  description?: string
}

export function PaymentScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [chargeAmount, setChargeAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [userBalance, setUserBalance] = useState(0)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([])
  const [isCharging, setIsCharging] = useState(false)
  const [totalInvested, setTotalInvested] = useState(0)

  // 모달 상태들
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<TransactionRecord | null>(null)

  // 투자 내역을 거래 내역으로 변환하는 함수
  const convertInvestmentsToTransactions = (investments: any[]): TransactionRecord[] => {
    return investments.map((investment) => ({
      id: `investment_${investment.id || investment.webtoonId}_${Date.now()}`,
      amount: investment.amount,
      method: "투자",
      status: "completed" as const,
      date: investment.date || investment.investmentTime || new Date().toISOString().split("T")[0],
      fee: 0,
      type: "investment" as const,
      webtoonTitle: investment.title,
      webtoonId: investment.id || investment.webtoonId,
      description: `${investment.title} 투자`,
    }))
  }

  useEffect(() => {
    const user = getUserFromStorage()
    if (user && user.balance !== undefined) {
      setUserBalance(user.balance)
    }

    // 총 투자 금액 계산
    const investmentsStr = localStorage.getItem("userInvestments")
    let investmentTransactions: TransactionRecord[] = []
    if (investmentsStr) {
      const investments = JSON.parse(investmentsStr)
      const total = investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
      setTotalInvested(total)
      investmentTransactions = convertInvestmentsToTransactions(investments)
    }

    const savedMethods = localStorage.getItem("paymentMethods")
    if (savedMethods) {
      setPaymentMethods(JSON.parse(savedMethods))
    } else {
      const defaultMethods: PaymentMethod[] = [
        {
          id: "1",
          type: "kakao",
          name: "카카오페이",
          number: "연결됨",
          isDefault: true,
        },
        {
          id: "2",
          type: "card",
          name: "신한카드",
          number: "**** **** **** 1234",
          isDefault: false,
        },
      ]
      setPaymentMethods(defaultMethods)
      localStorage.setItem("paymentMethods", JSON.stringify(defaultMethods))
    }

    // 기존 충전/환불 내역 로드
    const savedHistory = localStorage.getItem("chargeHistory")
    let chargeRefundTransactions: TransactionRecord[] = []
    if (savedHistory) {
      chargeRefundTransactions = JSON.parse(savedHistory)
    } else {
      const defaultHistory: TransactionRecord[] = [
        {
          id: "1",
          amount: 100000,
          method: "카카오페이",
          status: "completed",
          date: "2024-01-15",
          fee: 0,
          type: "charge",
          description: "100,000원 충전",
        },
        {
          id: "2",
          amount: 50000,
          method: "신한카드",
          status: "completed",
          date: "2024-01-10",
          fee: 500,
          type: "charge",
          description: "50,000원 충전",
        },
      ]
      chargeRefundTransactions = defaultHistory
      localStorage.setItem("chargeHistory", JSON.stringify(defaultHistory))
    }

    // 모든 거래 내역 합치기 (최신순 정렬)
    const allTransactions = [...chargeRefundTransactions, ...investmentTransactions].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })

    setTransactionHistory(allTransactions)
  }, [])

  // 투자 데이터 변경 감지
  useEffect(() => {
    const handleInvestmentUpdate = () => {
      const investmentsStr = localStorage.getItem("userInvestments")
      let investmentTransactions: TransactionRecord[] = []
      if (investmentsStr) {
        const investments = JSON.parse(investmentsStr)
        const total = investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
        setTotalInvested(total)
        investmentTransactions = convertInvestmentsToTransactions(investments)
      }

      // 충전/환불 내역 다시 로드
      const savedHistory = localStorage.getItem("chargeHistory")
      let chargeRefundTransactions: TransactionRecord[] = []
      if (savedHistory) {
        chargeRefundTransactions = JSON.parse(savedHistory)
      }

      // 모든 거래 내역 합치기 (최신순 정렬)
      const allTransactions = [...chargeRefundTransactions, ...investmentTransactions].sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateB.getTime() - dateA.getTime()
      })

      setTransactionHistory(allTransactions)
    }

    window.addEventListener("investmentUpdate", handleInvestmentUpdate)
    window.addEventListener("storage", handleInvestmentUpdate)

    return () => {
      window.removeEventListener("investmentUpdate", handleInvestmentUpdate)
      window.removeEventListener("storage", handleInvestmentUpdate)
    }
  }, [])

  const quickAmounts = [10000, 30000, 50000, 100000, 300000, 500000]

  const handleQuickAmount = (amount: number) => {
    const formattedValue = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    setChargeAmount(formattedValue)
  }

  const handleChargeClick = () => {
    if (!chargeAmount || !selectedMethod) {
      toast({
        title: "입력 오류",
        description: "충전 금액과 결제 수단을 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseInt(chargeAmount.replace(/,/g, "")) // 콤마 제거 후 숫자 변환
    if (amount < 1000) {
      toast({
        title: "충전 오류",
        description: "최소 충전 금액은 1,000원입니다.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmCharge = async () => {
    setShowConfirmModal(false)
    setIsCharging(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const amount = Number.parseInt(chargeAmount.replace(/,/g, ""))
      const newBalance = userBalance + amount
      const user = getUserFromStorage()
      if (user) {
        user.balance = newBalance
        saveUserToStorage(user)
      }

      const newRecord: TransactionRecord = {
        id: Date.now().toString(),
        amount,
        method: selectedMethod,
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        fee: amount >= 50000 ? 0 : 500,
        type: "charge",
        description: `${amount.toLocaleString()}원 충전`,
      }

      setCurrentTransaction(newRecord)

      // 충전 내역에 추가
      const savedHistory = localStorage.getItem("chargeHistory")
      const chargeHistory = savedHistory ? JSON.parse(savedHistory) : []
      const updatedChargeHistory = [newRecord, ...chargeHistory]
      localStorage.setItem("chargeHistory", JSON.stringify(updatedChargeHistory))

      // 전체 거래 내역 업데이트
      const updatedTransactions = [newRecord, ...transactionHistory]
      setTransactionHistory(updatedTransactions)

      setUserBalance(newBalance)
      setChargeAmount("")
      setSelectedMethod("")

      window.dispatchEvent(new Event("userDataChanged"))

      // 영수증 모달 표시
      setShowReceiptModal(true)
    } catch (error) {
      toast({
        title: "충전 실패",
        description: "충전 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsCharging(false)
    }
  }

  const handleReceiptConfirm = () => {
    setShowReceiptModal(false)
    setShowSuccessModal(true)
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}원`
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "kakao":
        return <Smartphone className="h-5 w-5 text-[#F9DF52]" />
      case "naver":
        return <Smartphone className="h-5 w-5 text-[#4F8F78]" />
      case "card":
        return <CreditCard className="h-5 w-5 text-[#5F859F]" />
      case "bank":
        return <Building className="h-5 w-5 text-[#58678C]" />
      default:
        return <Wallet className="h-5 w-5 text-[#989898]" />
    }
  }

  const getStatusIcon = (status: string, type: string) => {
    if (type === "refund") {
      switch (status) {
        case "completed":
          return <TrendingDown className="h-4 w-4 text-[#4F8F78]" />
        case "pending":
          return <Clock className="h-4 w-4 text-[#F9DF52]" />
        case "failed":
          return <AlertCircle className="h-4 w-4 text-[#D16561]" />
        default:
          return <TrendingDown className="h-4 w-4 text-[#F9DF52]" />
      }
    }

    if (type === "investment") {
      return <TrendingUp className="h-4 w-4 text-[#5F859F]" />
    }

    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-[#4F8F78]" />
      case "pending":
        return <Clock className="h-4 w-4 text-[#F9DF52]" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-[#D16561]" />
      default:
        return null
    }
  }

  const getStatusText = (status: string, type: string) => {
    if (type === "refund") {
      switch (status) {
        case "completed":
          return "환불완료"
        case "pending":
          return "환불처리중"
        case "failed":
          return "환불실패"
        default:
          return "환불처리중"
      }
    }

    if (type === "investment") {
      return "투자완료"
    }

    switch (status) {
      case "completed":
        return "완료"
      case "pending":
        return "처리중"
      case "failed":
        return "실패"
      default:
        return status
    }
  }

  const getRecordTitle = (record: TransactionRecord) => {
    if (record.type === "refund") {
      return `${record.webtoonTitle || "웹툰"} 투자 취소`
    }
    if (record.type === "investment") {
      return `${record.webtoonTitle || "웹툰"} 투자`
    }
    return record.description || `${formatCurrency(record.amount)} 충전`
  }

  const getAmountDisplay = (record: TransactionRecord) => {
    const prefix = record.type === "refund" ? "+" : record.type === "investment" ? "-" : ""
    return `${prefix}${formatCurrency(record.amount)}`
  }

  const getAmountColor = (record: TransactionRecord) => {
    switch (record.type) {
      case "refund":
        return "text-[#4F8F78]"
      case "investment":
        return "text-[#5F859F]"
      case "charge":
        return "text-[#4F8F78]"
      default:
        return "text-[#989898]"
    }
  }

  return (
    <div className="flex flex-col pb-20 bg-gradient-to-br from-[#FAFAFA] to-[#F9F9F9] dark:from-[#323233] dark:to-[#3F3F3F]">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-[#BCBCBC]/20 bg-[#FAFAFA]/80 dark:bg-[#3F3F3F]/80 backdrop-blur-sm sticky top-0 z-40 h-16">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 text-[#58678C]" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      <div className="p-4 space-y-6">
        {/* 잔액 및 투자 현황 카드 */}
        <Card className="bg-gradient-to-br from-[#5F859F] to-[#58678C] text-white border-0 shadow-xl shadow-[#C2BDAD]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">내 잔액</h2>
                  <p className="text-white/80 text-sm">사용 가능한 금액</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(userBalance)}</p>
              </div>
            </div>

            {/* 투자 현황 추가 */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/80 text-xs font-medium">총 투자금액</p>
                <p className="text-lg font-bold">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/80 text-xs font-medium">총 거래금액</p>
                <p className="text-lg font-bold">{formatCurrency(userBalance + totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 충전 섹션 */}
        <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
          <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#4F8F78]" />
              <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">잔액 충전</h3>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* 금액 입력 */}
            <div>
              <label className="text-sm font-medium text-[#3F3F3F] dark:text-[#F9DF52] mb-2 block">충전 금액</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="충전할 금액을 입력하세요"
                  value={chargeAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "") // 숫자만 추출
                    const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",") // 천 단위 콤마 추가
                    setChargeAmount(formattedValue)
                  }}
                  className="rounded-xl border-[#BCBCBC] focus:ring-[#5F859F] focus:border-[#5F859F] bg-[#F9F9F9] dark:bg-[#454858] text-[#3F3F3F] dark:text-[#F9DF52] pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#989898] text-sm pointer-events-none">
                  원
                </span>
              </div>
            </div>

            {/* 빠른 금액 선택 */}
            <div>
              <label className="text-sm font-medium text-[#3F3F3F] dark:text-[#F9DF52] mb-2 block">빠른 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => handleQuickAmount(amount)}
                    className="border-[#BCBCBC] hover:bg-[#E5E4DC] dark:hover:bg-[#454858] text-[#3F3F3F] dark:text-[#F9DF52]"
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* 결제 수단 선택 */}
            <div>
              <label className="text-sm font-medium text-[#3F3F3F] dark:text-[#F9DF52] mb-2 block">결제 수단</label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.name)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMethod === method.name
                        ? "border-[#5F859F] bg-[#5F859F]/5"
                        : "border-[#BCBCBC] hover:border-[#5F859F]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getMethodIcon(method.type)}
                        <div>
                          <p className="font-medium text-[#3F3F3F] dark:text-[#F9DF52]">{method.name}</p>
                          <p className="text-xs text-[#989898]">{method.number}</p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-[#F9DF52] text-[#323233] px-2 py-1 rounded-full font-medium">
                          기본
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 수수료 안내 */}
            <div className="bg-[#E5E4DC]/50 dark:bg-[#454858]/50 p-3 rounded-xl">
              <p className="text-xs text-[#989898]">
                • 5만원 이상 충전 시 수수료 무료
                <br />• 5만원 미만 충전 시 수수료 500원
              </p>
            </div>

            {/* 충전 버튼 */}
            <Button
              onClick={handleChargeClick}
              disabled={!chargeAmount || !selectedMethod || isCharging}
              className="w-full bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-bold py-3 rounded-xl disabled:bg-[#BCBCBC] disabled:text-[#989898]"
            >
              {isCharging ? "충전 중..." : `${chargeAmount ? `${chargeAmount}원` : "0원"} 충전하기`}
            </Button>
          </CardContent>
        </Card>

        {/* 거래 내역 */}
        <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
          <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
            <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">거래 내역</h3>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-5 mb-4 bg-[#E5E4DC] dark:bg-[#454858] p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52] text-xs">
                  전체
                </TabsTrigger>
                <TabsTrigger value="charge" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52] text-xs">
                  충전
                </TabsTrigger>
                <TabsTrigger value="investment" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52] text-xs">
                  투자
                </TabsTrigger>
                <TabsTrigger value="refund" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52] text-xs">
                  환불
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52] text-xs">
                  처리중
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {transactionHistory.length > 0 ? (
                  transactionHistory.slice(0, 15).map((record) => (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        record.type === "refund"
                          ? "bg-[#F9DF52]/10 dark:bg-[#F9DF52]/20"
                          : record.type === "investment"
                            ? "bg-[#5F859F]/10 dark:bg-[#5F859F]/20"
                            : "bg-[#E5E4DC]/30 dark:bg-[#454858]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(record.status, record.type)}
                        <div>
                          <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                            {getRecordTitle(record)}
                          </p>
                          <p className="text-xs text-[#989898]">
                            {record.method} • {record.date}
                            {record.type === "refund" && " • 투자취소"}
                            {record.type === "investment" && " • 투자"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getAmountColor(record)}`}>{getAmountDisplay(record)}</p>
                        <p className="text-xs text-[#989898]">{getStatusText(record.status, record.type)}</p>
                        {record.fee > 0 && (
                          <p className="text-xs text-[#989898]">수수료 {formatCurrency(record.fee)}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">거래 내역이 없습니다</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="charge" className="space-y-3">
                {transactionHistory
                  .filter((record) => record.type === "charge")
                  .slice(0, 10)
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-[#4F8F78]/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-[#4F8F78]" />
                        <div>
                          <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                            {getRecordTitle(record)}
                          </p>
                          <p className="text-xs text-[#989898]">
                            {record.method} • {record.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#4F8F78]">{formatCurrency(record.amount)}</p>
                        <p className="text-xs text-[#989898]">완료</p>
                        {record.fee > 0 && (
                          <p className="text-xs text-[#989898]">수수료 {formatCurrency(record.fee)}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="investment" className="space-y-3">
                {transactionHistory.filter((record) => record.type === "investment").length > 0 ? (
                  transactionHistory
                    .filter((record) => record.type === "investment")
                    .slice(0, 10)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-[#5F859F]/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-4 w-4 text-[#5F859F]" />
                          <div>
                            <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                              {record.webtoonTitle || "웹툰"} 투자
                            </p>
                            <p className="text-xs text-[#989898]">투자 • {record.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#5F859F]">-{formatCurrency(record.amount)}</p>
                          <p className="text-xs text-[#989898]">투자완료</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">투자 내역이 없습니다</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="refund" className="space-y-3">
                {transactionHistory.filter((record) => record.type === "refund").length > 0 ? (
                  transactionHistory
                    .filter((record) => record.type === "refund")
                    .slice(0, 10)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-[#F9DF52]/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="h-4 w-4 text-[#F9DF52]" />
                          <div>
                            <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                              {record.webtoonTitle || "웹툰"} 투자 취소
                            </p>
                            <p className="text-xs text-[#989898]">투자취소 • {record.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#F9DF52]">+{formatCurrency(record.amount)}</p>
                          <p className="text-xs text-[#989898]">{getStatusText(record.status, record.type)}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">환불 내역이 없습니다</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {transactionHistory.filter((record) => record.status === "pending").length > 0 ? (
                  transactionHistory
                    .filter((record) => record.status === "pending")
                    .slice(0, 10)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-[#F9DF52]/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-[#F9DF52]" />
                          <div>
                            <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                              {getRecordTitle(record)}
                            </p>
                            <p className="text-xs text-[#989898]">
                              {record.method} • {record.date}
                              {record.type === "refund" && " • 투자취소"}
                              {record.type === "investment" && " • 투자"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#F9DF52]">{getAmountDisplay(record)}</p>
                          <p className="text-xs text-[#989898]">처리중</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">처리중인 거래가 없습니다</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 충전 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAFAFA] dark:bg-[#3F3F3F] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#F9DF52] rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-[#323233]" />
              </div>
              <h3 className="text-xl font-bold text-[#323233] dark:text-[#F9DF52] mb-2">충전 확인</h3>
              <p className="text-[#989898] text-sm">다음 내용으로 충전하시겠습니까?</p>
            </div>

            <div className="bg-[#E5E4DC] dark:bg-[#454858] rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#989898] text-sm">충전 금액</span>
                  <span className="font-bold text-[#323233] dark:text-[#F9DF52]">{chargeAmount}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#989898] text-sm">결제 수단</span>
                  <span className="font-medium text-[#323233] dark:text-[#F9DF52]">{selectedMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#989898] text-sm">수수료</span>
                  <span className="font-medium text-[#323233] dark:text-[#F9DF52]">
                    {Number.parseInt(chargeAmount.replace(/,/g, "")) >= 50000 ? "무료" : "500원"}
                  </span>
                </div>
                <div className="border-t border-[#BCBCBC] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[#323233] dark:text-[#F9DF52] font-bold">총 결제 금액</span>
                    <span className="font-bold text-[#323233] dark:text-[#F9DF52]">
                      {formatCurrency(
                        Number.parseInt(chargeAmount.replace(/,/g, "")) +
                          (Number.parseInt(chargeAmount.replace(/,/g, "")) >= 50000 ? 0 : 500),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1 border-[#BCBCBC] text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
              >
                취소
              </Button>
              <Button
                onClick={handleConfirmCharge}
                className="flex-1 bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-bold"
              >
                충전하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 영수증 모달 */}
      {showReceiptModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAFAFA] dark:bg-[#3F3F3F] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#4F8F78] rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-[#FAFAFA]" />
              </div>
              <h3 className="text-xl font-bold text-[#323233] dark:text-[#F9DF52] mb-2">충전 영수증</h3>
              <p className="text-[#989898] text-sm">충전이 완료되었습니다</p>
            </div>

            <div className="bg-[#E5E4DC] dark:bg-[#454858] rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="text-center border-b border-[#BCBCBC] pb-3">
                  <p className="text-xs text-[#989898]">거래번호</p>
                  <p className="font-mono text-sm text-[#323233] dark:text-[#F9DF52]">{currentTransaction.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#989898] text-sm">충전 금액</span>
                    <span className="font-bold text-[#323233] dark:text-[#F9DF52]">
                      {formatCurrency(currentTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#989898] text-sm">결제 수단</span>
                    <span className="font-medium text-[#323233] dark:text-[#F9DF52]">{currentTransaction.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#989898] text-sm">수수료</span>
                    <span className="font-medium text-[#323233] dark:text-[#F9DF52]">
                      {currentTransaction.fee > 0 ? formatCurrency(currentTransaction.fee) : "무료"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#989898] text-sm">처리 일시</span>
                    <span className="font-medium text-[#323233] dark:text-[#F9DF52]">
                      {new Date().toLocaleString("ko-KR")}
                    </span>
                  </div>
                  <div className="border-t border-[#BCBCBC] pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-[#323233] dark:text-[#F9DF52] font-bold">충전 후 잔액</span>
                      <span className="font-bold text-[#4F8F78] text-lg">{formatCurrency(userBalance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // 영수증 다운로드 로직 (실제로는 PDF 생성 등)
                  toast({
                    title: "영수증 저장",
                    description: "영수증이 다운로드 폴더에 저장되었습니다.",
                  })
                }}
                variant="outline"
                className="flex-1 border-[#BCBCBC] text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
              >
                <Download className="h-4 w-4 mr-2" />
                저장
              </Button>
              <Button
                onClick={handleReceiptConfirm}
                className="flex-1 bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-bold"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 충전 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAFAFA] dark:bg-[#3F3F3F] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#4F8F78] to-[#6CB9B1] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-[#FAFAFA]" />
              </div>
              <h3 className="text-2xl font-bold text-[#323233] dark:text-[#F9DF52] mb-3">충전 완료!</h3>
              <p className="text-[#989898] text-sm mb-6">
                {currentTransaction && formatCurrency(currentTransaction.amount)}이 성공적으로 충전되었습니다.
              </p>

              <div className="bg-gradient-to-r from-[#F9DF52] to-[#F5C882] rounded-xl p-4 mb-6">
                <p className="text-[#323233] text-sm font-medium mb-1">현재 잔액</p>
                <p className="text-[#323233] text-2xl font-bold">{formatCurrency(userBalance)}</p>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-bold py-3"
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
