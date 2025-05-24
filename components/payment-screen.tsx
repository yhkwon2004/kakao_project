"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Plus, Wallet, Check, ArrowRight, Shield, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"
import { getWebtoonById } from "@/data/webtoons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

// 투자 내역 타입
interface InvestmentRecord {
  id: string
  webtoonTitle: string
  amount: number
  date: string
  status: string
  roi?: number
  type: "investment"
}

// 충전 내역 타입
interface ChargeRecord {
  id: string
  amount: number
  date: string
  method: string
  status: string
  type: "charge"
}

// 통합 내역 타입
type TransactionRecord = InvestmentRecord | ChargeRecord

export function PaymentScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("payment")
  const [currentBalance, setCurrentBalance] = useState(130000)
  const [investmentHistory, setInvestmentHistory] = useState<InvestmentRecord[]>([])
  const [chargeHistory, setChargeHistory] = useState<ChargeRecord[]>([])
  const [loading, setLoading] = useState(false)

  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [chargeAmount, setChargeAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [chargeStep, setChargeStep] = useState(1) // 1: 결제수단, 2: 금액, 3: 확인
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" })

  // 최대 충전 금액 설정 (1억)
  const MAX_CHARGE_AMOUNT = 100000000

  useEffect(() => {
    // 사용자 정보에서 잔액 로드
    const user = getUserFromStorage()
    if (user && user.balance !== undefined) {
      setCurrentBalance(user.balance)
    }

    // 잔액 변경 이벤트 리스너 추가
    const handleBalanceChange = () => {
      const updatedUser = getUserFromStorage()
      if (updatedUser && updatedUser.balance !== undefined) {
        setCurrentBalance(updatedUser.balance)
      }
    }

    window.addEventListener("userDataChanged", handleBalanceChange)
    window.addEventListener("storage", handleBalanceChange)

    return () => {
      window.removeEventListener("userDataChanged", handleBalanceChange)
      window.removeEventListener("storage", handleBalanceChange)
    }
  }, [])

  // 충전 기록 로드
  const loadChargeHistory = () => {
    try {
      const storedChargeHistory = localStorage.getItem("chargeHistory")
      if (storedChargeHistory) {
        const parsedHistory = JSON.parse(storedChargeHistory)
        // 날짜순으로 정렬 (최신순)
        parsedHistory.sort(
          (a: ChargeRecord, b: ChargeRecord) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setChargeHistory(parsedHistory)
      } else {
        // 기본 더미 데이터
        const defaultChargeHistory: ChargeRecord[] = [
          {
            id: "charge-4",
            date: "2024-01-15",
            amount: 50000,
            method: "신용카드",
            status: "완료",
            type: "charge",
          },
          {
            id: "charge-3",
            date: "2024-01-10",
            amount: 100000,
            method: "계좌이체",
            status: "완료",
            type: "charge",
          },
          {
            id: "charge-2",
            date: "2024-01-05",
            amount: 30000,
            method: "신용카드",
            status: "완료",
            type: "charge",
          },
          {
            id: "charge-1",
            date: "2024-01-01",
            amount: 200000,
            method: "계좌이체",
            status: "완료",
            type: "charge",
          },
        ]
        setChargeHistory(defaultChargeHistory)
        localStorage.setItem("chargeHistory", JSON.stringify(defaultChargeHistory))
      }
    } catch (error) {
      console.error("충전 기록 로드 오류:", error)
    }
  }

  // 투자 내역 로드 (동적)
  const loadInvestmentHistory = () => {
    setLoading(true)
    try {
      const user = getUserFromStorage()
      const isGuest = user?.email === "guest_social@guest.fake"

      let allInvestments: InvestmentRecord[] = []

      // 게스트 계정의 경우 더미 데이터 추가
      if (isGuest) {
        const guestDummyData: InvestmentRecord[] = [
          {
            id: "blood-sword-family-hunting-dog",
            webtoonTitle: "철혈검가 사냥개의 회귀",
            amount: 2800000,
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR"),
            status: "completed",
            roi: 18,
            type: "investment",
          },
          {
            id: "bad-secretary",
            webtoonTitle: "나쁜 비서",
            amount: 3400000,
            date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR"),
            status: "completed",
            roi: 22,
            type: "investment",
          },
        ]
        allInvestments = [...guestDummyData]
      }

      // 일반 투자 내역 로드
      const storedInvestments = localStorage.getItem("userInvestments")
      if (storedInvestments) {
        try {
          const parsedInvestments = JSON.parse(storedInvestments)
          const mappedInvestments = parsedInvestments.map((investment: any) => {
            const webtoon = getWebtoonById(investment.id)
            return {
              id: investment.id,
              webtoonTitle: webtoon?.title || investment.title || "알 수 없는 웹툰",
              amount: investment.amount,
              date: new Date(investment.date || Date.now()).toLocaleDateString("ko-KR"),
              status: investment.status || "진행중",
              roi: investment.expectedROI,
              type: "investment",
            }
          })

          // 중복 방지하여 추��
          mappedInvestments.forEach((newInv: InvestmentRecord) => {
            if (!allInvestments.some((inv) => inv.id === newInv.id)) {
              allInvestments.push(newInv)
            }
          })
        } catch (error) {
          console.error("투자 데이터 파싱 오류:", error)
        }
      }

      // 완료된 프로젝트 데이터 로드
      const completedProjects = localStorage.getItem("completedProjects")
      if (completedProjects) {
        try {
          const parsedCompletedProjects = JSON.parse(completedProjects)
          const completedInvestments = parsedCompletedProjects.map((project: any) => {
            const webtoon = getWebtoonById(project.id)
            return {
              id: project.id,
              webtoonTitle: webtoon?.title || project.title || "완료된 프로젝트",
              amount: project.investedAmount,
              date: new Date(project.investmentDate || project.completionDate).toLocaleDateString("ko-KR"),
              status: "completed",
              roi: project.roi,
              type: "investment",
            }
          })

          // 중복 방지하여 추가
          completedInvestments.forEach((newInv: InvestmentRecord) => {
            if (!allInvestments.some((inv) => inv.id === newInv.id)) {
              allInvestments.push(newInv)
            }
          })
        } catch (error) {
          console.error("완료된 프로젝트 데이터 파싱 오류:", error)
        }
      }

      // 날짜순으로 정렬 (최신순)
      allInvestments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setInvestmentHistory(allInvestments)
    } catch (error) {
      console.error("Error loading investment history:", error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 충전 기록 로드
  useEffect(() => {
    loadChargeHistory()
  }, [])

  // 결제 내역 탭이 활성화될 때 투자 내역 로드
  useEffect(() => {
    if (activeTab === "history") {
      loadInvestmentHistory()
    }
  }, [activeTab])

  // 데이터 변경 감지하여 실시간 업데이트
  useEffect(() => {
    const handleDataChange = () => {
      if (activeTab === "history") {
        loadInvestmentHistory()
      }
      loadChargeHistory()
    }

    window.addEventListener("userDataChanged", handleDataChange)
    window.addEventListener("storage", handleDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleDataChange)
      window.removeEventListener("storage", handleDataChange)
    }
  }, [activeTab])

  // 결제 수단 데이터
  const paymentMethods = [
    {
      id: "1",
      type: "신용카드",
      name: "신한카드",
      number: "****-****-****-1234",
      expiry: "12/25",
      logo: "💳",
    },
    {
      id: "2",
      type: "신용카드",
      name: "국민카드",
      number: "****-****-****-5678",
      expiry: "09/24",
      logo: "💳",
    },
    {
      id: "3",
      type: "계좌이체",
      name: "카카오뱅크",
      number: "****-****-****-9012",
      expiry: "",
      logo: "🏦",
    },
  ]

  // 충전 기록 렌더링
  const renderChargeHistory = () => {
    return (
      <div className="space-y-3">
        <h3 className="font-bold text-darkblue dark:text-light mb-4">최근 충전 기록</h3>
        {chargeHistory.slice(0, 4).map((record, index) => (
          <div
            key={record.id}
            className="flex justify-between items-center p-4 bg-white dark:bg-darkblue/20 rounded-xl border border-gray/10 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-green" />
              </div>
              <div>
                <p className="font-semibold text-darkblue dark:text-light">+{record.amount.toLocaleString()}원</p>
                <p className="text-xs text-gray">
                  {record.date} • {record.method}
                </p>
              </div>
            </div>
            <Badge className="bg-green/10 text-green border-green/20">{record.status}</Badge>
          </div>
        ))}
        {chargeHistory.length === 0 && (
          <div className="text-center py-8 text-gray">
            <p>충전 기록이 없습니다.</p>
          </div>
        )}
      </div>
    )
  }

  // 통합 거래 내역 생성 (투자 + 충전)
  const getCombinedHistory = (): TransactionRecord[] => {
    const combined: TransactionRecord[] = [...investmentHistory, ...chargeHistory]
    // 날짜순으로 정렬 (최신순)
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const handleChargeStart = () => {
    setChargeStep(1)
    setSelectedPaymentMethod("")
    setChargeAmount("")
    setIsChargeDialogOpen(true)
  }

  const handlePaymentMethodNext = () => {
    if (!selectedPaymentMethod) {
      setAlertModal({
        isOpen: true,
        title: "결제 수단 선택",
        message: "결제 수단을 선택해주세요.",
      })
      return
    }
    setChargeStep(2)
  }

  const handleAmountNext = () => {
    const amount = Number.parseInt(chargeAmount)
    if (isNaN(amount) || amount <= 0) {
      setAlertModal({
        isOpen: true,
        title: "충전 금액 오류",
        message: "유효한 충전 금액을 입력해주세요.",
      })
      return
    }
    if (amount < 1000) {
      setAlertModal({
        isOpen: true,
        title: "최소 충전 금액",
        message: "최소 충전 금액은 1,000원입니다.",
      })
      return
    }
    if (amount > MAX_CHARGE_AMOUNT) {
      setAlertModal({
        isOpen: true,
        title: "최대 충전 금액 초과",
        message: `최대 충전 금액은 ${MAX_CHARGE_AMOUNT.toLocaleString()}원입니다.`,
      })
      return
    }
    setIsChargeDialogOpen(false)
    setIsConfirmDialogOpen(true)
  }

  const handleCharge = () => {
    const amount = Number.parseInt(chargeAmount)
    const selectedMethod = getSelectedPaymentMethodInfo()

    // 사용자 정보 업데이트 (localStorage)
    const user = getUserFromStorage()
    if (user && selectedMethod) {
      const updatedBalance = (user.balance || 0) + amount
      const updatedUser = { ...user, balance: updatedBalance }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // 새로운 충전 기록 추가
      const newChargeRecord: ChargeRecord = {
        id: `charge-${Date.now()}`,
        amount: amount,
        date: new Date().toLocaleDateString("ko-KR"),
        method: selectedMethod.name,
        status: "완료",
        type: "charge",
      }

      const updatedChargeHistory = [newChargeRecord, ...chargeHistory]
      setChargeHistory(updatedChargeHistory)
      localStorage.setItem("chargeHistory", JSON.stringify(updatedChargeHistory))

      // 이벤트 발생
      window.dispatchEvent(new Event("userDataChanged"))
      window.dispatchEvent(new Event("storage"))

      setCurrentBalance(updatedBalance)
      setIsConfirmDialogOpen(false)
      setChargeAmount("")
      setSelectedPaymentMethod("")
      setChargeStep(1)

      setAlertModal({
        isOpen: true,
        title: "충전 완료",
        message: `${amount.toLocaleString()}원 충전이 완료되었습니다.`,
      })
    } else {
      alert("사용자 정보를 찾을 수 없습니다.")
    }
  }

  const getSelectedPaymentMethodInfo = () => {
    return paymentMethods.find((method) => method.id === selectedPaymentMethod)
  }

  // 빠른 선택 금액 (기존 + 새로운 큰 금액)
  const quickAmounts = [10000, 30000, 50000, 100000, 300000, 500000]

  return (
    <div className="flex flex-col pb-20 bg-gray/5 dark:bg-dark min-h-screen">
      {/* 헤더 */}
      <div className="bg-white dark:bg-darkblue border-b border-gray/10 sticky top-0 z-40">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" className="mr-3" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Logo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* 현재 충전 금액 */}
      <div className="p-4">
        <Card className="rounded-2xl mb-6 border-0 shadow-lg bg-white dark:bg-darkblue/30 dark:to-darkblue/10">
          <CardHeader className="p-6 bg-green/5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-darkblue dark:text-light">현재 보유 잔액</h2>
                  <p className="text-sm text-gray">안전하게 보관된 투자 자금</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">보안 인증</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-4xl font-bold text-darkblue dark:text-white mb-2">
                  {currentBalance.toLocaleString()}
                  <span className="text-lg font-medium text-gray ml-1">원</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-gray">
                  <Clock className="h-4 w-4" />
                  <span>실시간 업데이트</span>
                </div>
              </div>
              <Button
                className="rounded-xl bg-yellow hover:bg-yellow/90 text-black font-semibold px-8 py-3 h-auto shadow-lg"
                onClick={handleChargeStart}
              >
                <Plus className="h-5 w-5 mr-2" />
                잔액 충전
              </Button>
            </div>

            {renderChargeHistory()}
          </CardContent>
        </Card>
      </div>

      {/* 결제 수단 및 결제 내역 */}
      <div className="p-4">
        <Tabs defaultValue="payment" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white dark:bg-darkblue/20 p-1 rounded-2xl shadow-sm">
            <TabsTrigger
              value="payment"
              className={`rounded-xl transition-all font-semibold ${
                activeTab === "payment"
                  ? "bg-yellow text-black shadow-md"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              결제 수단
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={`rounded-xl transition-all font-semibold ${
                activeTab === "history"
                  ? "bg-yellow text-black shadow-md"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              결제 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className="rounded-2xl border-0 shadow-md bg-white dark:bg-darkblue/20 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-2xl">
                          {method.logo}
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-darkblue dark:text-light">{method.name}</p>
                          <p className="text-sm text-gray">{method.number}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {method.type}
                            </Badge>
                            {method.expiry && <span className="text-xs text-gray">만료: {method.expiry}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green rounded-full"></div>
                        <span className="text-xs text-green font-medium">활성</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="rounded-2xl border-2 border-dashed border-gray/30 bg-transparent hover:bg-gray/5 dark:hover:bg-darkblue/10 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray" />
                  </div>
                  <p className="text-gray font-medium mb-2">새 결제 수단 추가</p>
                  <p className="text-sm text-gray/70">신용카드 또는 계좌를 등록하세요</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray/10 rounded-full animate-pulse mx-auto mb-4"></div>
                  <p className="text-gray">거래 내역을 불러오는 중...</p>
                </div>
              ) : getCombinedHistory().length > 0 ? (
                getCombinedHistory().map((transaction) => (
                  <Card
                    key={`${transaction.type}-${transaction.id}-${transaction.date}`}
                    className="rounded-2xl border-0 shadow-md bg-white dark:bg-darkblue/20 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              transaction.type === "charge" ? "bg-green/10" : "bg-blue-50"
                            }`}
                          >
                            {transaction.type === "charge" ? (
                              <Plus className="h-6 w-6 text-green" />
                            ) : (
                              <ArrowRight className="h-6 w-6 text-blue-500 rotate-45" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-darkblue dark:text-light">
                              {transaction.type === "charge" ? "충전" : "투자"}
                            </p>
                            <p className="text-sm text-gray">
                              {transaction.type === "charge"
                                ? (transaction as ChargeRecord).method
                                : (transaction as InvestmentRecord).webtoonTitle}
                            </p>
                            <p className="text-xs text-gray mt-1">{transaction.date}</p>
                            {transaction.type === "investment" &&
                              (transaction as InvestmentRecord).status === "completed" &&
                              (transaction as InvestmentRecord).roi && (
                                <Badge className="bg-green/10 text-green border-green/20 mt-2">
                                  수익률: +{(transaction as InvestmentRecord).roi}%
                                </Badge>
                              )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              transaction.type === "charge" ? "text-green" : "text-blue-500"
                            }`}
                          >
                            {transaction.type === "charge" ? "+" : "-"}
                            {transaction.amount.toLocaleString()}원
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {transaction.type === "charge"
                              ? (transaction as ChargeRecord).status
                              : (transaction as InvestmentRecord).status === "completed"
                                ? "완료"
                                : "진행중"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-gray" />
                  </div>
                  <p className="text-gray font-medium">거래 내역이 없습니다</p>
                  <p className="text-sm text-gray/70 mt-1">첫 투자를 시작해보세요</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 충전 다이얼로그 */}
      <Dialog open={isChargeDialogOpen} onOpenChange={setIsChargeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-darkblue dark:text-light">
              {chargeStep === 1 ? "결제 수단 선택" : "충전 금액 입력"}
            </DialogTitle>
            <DialogDescription className="text-gray">
              {chargeStep === 1 ? "안전한 결제를 위해 결제 수단을 선택해주세요" : "충전하실 금액을 입력해주세요"}
            </DialogDescription>
          </DialogHeader>

          {chargeStep === 1 && (
            <div className="space-y-4">
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center space-x-3 p-4 rounded-xl border border-gray/10 hover:bg-gray/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">{method.logo}</div>
                      <div>
                        <Label
                          htmlFor={`payment-${method.id}`}
                          className="font-semibold text-darkblue dark:text-light cursor-pointer"
                        >
                          {method.name}
                        </Label>
                        <p className="text-sm text-gray">{method.number}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {chargeStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-gray/5 rounded-xl">
                <p className="text-sm text-gray mb-1">선택된 결제 수단</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getSelectedPaymentMethodInfo()?.logo}</span>
                  <span className="font-semibold text-darkblue dark:text-light">
                    {getSelectedPaymentMethodInfo()?.name}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-darkblue dark:text-light block mb-3">충전 금액</Label>
                <div className="p-6 bg-gradient-to-br from-yellow/10 to-yellow/5 rounded-2xl mb-6 border border-yellow/20">
                  <p className="text-4xl font-bold text-center text-darkblue dark:text-light">
                    {chargeAmount ? `${Number(chargeAmount).toLocaleString()}원` : "0원"}
                  </p>
                  <p className="text-sm text-center text-gray mt-2">
                    최대 {MAX_CHARGE_AMOUNT.toLocaleString()}원까지 충전 가능
                  </p>
                </div>

                {/* 빠른 선택 */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-darkblue dark:text-light mb-3">빠른 선택</p>
                  <div className="grid grid-cols-3 gap-3">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="rounded-xl border-gray/20 hover:bg-yellow/10 hover:border-yellow/30"
                        onClick={() => setChargeAmount(amount.toString())}
                      >
                        {amount.toLocaleString()}원
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 숫자 패드 */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      className="h-14 text-xl font-semibold rounded-xl border-gray/20 hover:bg-yellow/10 transition-colors"
                      onClick={() => setChargeAmount((prev) => prev + num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <Button
                    variant="outline"
                    className="h-14 text-lg font-semibold rounded-xl border-red/30 bg-red/5 hover:bg-red/10 text-red-600"
                    onClick={() => setChargeAmount("")}
                  >
                    전체삭제
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 text-xl font-semibold rounded-xl border-gray/20 hover:bg-yellow/10"
                    onClick={() => setChargeAmount((prev) => prev + "0")}
                  >
                    0
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 text-lg font-semibold rounded-xl border-red/30 bg-red/5 hover:bg-red/10 text-red-600"
                    onClick={() => setChargeAmount((prev) => prev.slice(0, -1))}
                  >
                    ⌫
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3 pt-6">
            {chargeStep === 2 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-gray/20 text-gray h-12"
                onClick={() => setChargeStep(1)}
              >
                이전
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray h-12"
              onClick={() => setIsChargeDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-yellow hover:bg-yellow/90 text-black h-12 font-semibold"
              onClick={chargeStep === 1 ? handlePaymentMethodNext : handleAmountNext}
            >
              {chargeStep === 1 ? "다음" : "충전하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 충전 확인 다이얼로그 */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-darkblue dark:text-light">충전 확인</DialogTitle>
            <DialogDescription className="text-gray">아래 내용을 확인하고 충전을 진행해주세요</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="p-6 bg-yellow/5 rounded-2xl border border-yellow/10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-black" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-darkblue dark:text-light mb-2">
                  {Number.parseInt(chargeAmount).toLocaleString()}원
                </p>
                <p className="text-sm text-gray">충전 금액</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray/5 rounded-xl">
                <span className="text-sm text-gray">결제 수단</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSelectedPaymentMethodInfo()?.logo}</span>
                  <span className="font-semibold text-darkblue dark:text-light">
                    {getSelectedPaymentMethodInfo()?.name}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray/5 rounded-xl">
                <span className="text-sm text-gray">현재 잔액</span>
                <span className="font-semibold text-darkblue dark:text-light">{currentBalance.toLocaleString()}원</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow/5 rounded-xl border border-yellow/20">
                <span className="text-sm text-gray">충전 금액</span>
                <span className="font-semibold text-yellow">{Number.parseInt(chargeAmount).toLocaleString()}원</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-green/5 rounded-xl border border-green/20">
                <span className="text-sm text-gray">충전 후 잔액</span>
                <span className="font-semibold text-green">
                  {(currentBalance + Number.parseInt(chargeAmount)).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200/20">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">안전한 결제</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">모든 결제는 SSL 암호화로 보호됩니다</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray h-12"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-yellow hover:bg-yellow/90 text-black h-12 font-semibold"
              onClick={handleCharge}
            >
              <Check className="h-5 w-5 mr-2" />
              충전 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 안내 모달 - 영수증 스타일 */}
      <Dialog open={alertModal.isOpen} onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-darkblue border-0 shadow-2xl">
          {alertModal.title === "충전 완료" ? (
            // 충전 성공 영수증 디자인
            <>
              <DialogHeader className="pb-6 text-center">
                <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green" />
                </div>
                <DialogTitle className="text-2xl font-bold text-green">충전 완료!</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* 영수증 스타일 정보 */}
                <div className="bg-gray/5 rounded-xl p-4 border-2 border-dashed border-gray/20">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-darkblue dark:text-light mb-1">충전 영수증</h3>
                    <p className="text-xs text-gray">{new Date().toLocaleString("ko-KR")}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray">결제 수단</span>
                      <span className="font-medium text-darkblue dark:text-light">
                        {getSelectedPaymentMethodInfo()?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray">충전 금액</span>
                      <span className="font-bold text-green">
                        +{Number.parseInt(chargeAmount || "0").toLocaleString()}원
                      </span>
                    </div>
                    <div className="border-t border-gray/20 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray">현재 잔액</span>
                        <span className="font-bold text-darkblue dark:text-light">
                          {currentBalance.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-4 pt-3 border-t border-gray/20">
                    <p className="text-xs text-gray">거래번호: {Date.now().toString().slice(-8)}</p>
                    <p className="text-xs text-gray mt-1">안전한 결제가 완료되었습니다</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-darkblue dark:text-light">
                    충전이 성공적으로 완료되었습니다!
                  </p>
                  <p className="text-sm text-gray mt-1">이제 웹툰에 투자해보세요</p>
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button
                  type="button"
                  className="w-full rounded-xl bg-green hover:bg-green/90 text-white h-12 font-semibold"
                  onClick={() => setAlertModal({ isOpen: false, title: "", message: "" })}
                >
                  확인
                </Button>
              </DialogFooter>
            </>
          ) : (
            // 기본 안내 모달
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">
                  {alertModal.title}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray text-center text-sm leading-relaxed">{alertModal.message}</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  className="w-full rounded-xl bg-yellow hover:bg-yellow/90 text-black h-12 font-semibold"
                  onClick={() => setAlertModal({ isOpen: false, title: "", message: "" })}
                >
                  확인
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
