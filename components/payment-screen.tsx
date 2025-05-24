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
import { Input } from "@/components/ui/input"
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
}

export function PaymentScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("payment")
  const [currentBalance, setCurrentBalance] = useState(130000)
  const [investmentHistory, setInvestmentHistory] = useState<InvestmentRecord[]>([])
  const [loading, setLoading] = useState(false)

  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [chargeAmount, setChargeAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [chargeStep, setChargeStep] = useState(1) // 1: 결제수단, 2: 금액, 3: 확인

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
          },
          {
            id: "bad-secretary",
            webtoonTitle: "나쁜 비서 [19세 완전판]",
            amount: 3400000,
            date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR"),
            status: "completed",
            roi: 22,
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
            }
          })

          // 중복 방지하여 추가
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
    const chargeHistory = [
      { date: "2024-01-15", amount: 50000, method: "신용카드", status: "완료" },
      { date: "2024-01-10", amount: 100000, method: "계좌이체", status: "완료" },
      { date: "2024-01-05", amount: 30000, method: "신용카드", status: "완료" },
      { date: "2024-01-01", amount: 200000, method: "계좌이체", status: "완료" },
    ]

    return (
      <div className="space-y-3">
        <h3 className="font-bold text-darkblue dark:text-light mb-4">최근 충전 기록</h3>
        {chargeHistory.map((record, index) => (
          <div
            key={index}
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

  const handleChargeStart = () => {
    setChargeStep(1)
    setSelectedPaymentMethod("")
    setChargeAmount("")
    setIsChargeDialogOpen(true)
  }

  const handlePaymentMethodNext = () => {
    if (!selectedPaymentMethod) {
      alert("결제 수단을 선택해주세요.")
      return
    }
    setChargeStep(2)
  }

  const handleAmountNext = () => {
    const amount = Number.parseInt(chargeAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("유효한 충전 금액을 입력해주세요.")
      return
    }
    if (amount < 1000) {
      alert("최소 충전 금액은 1,000원입니다.")
      return
    }
    setIsChargeDialogOpen(false)
    setIsConfirmDialogOpen(true)
  }

  const handleCharge = () => {
    const amount = Number.parseInt(chargeAmount)

    // 사용자 정보 업데이트 (localStorage)
    const user = getUserFromStorage()
    if (user) {
      const updatedBalance = (user.balance || 0) + amount
      const updatedUser = { ...user, balance: updatedBalance }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // 이벤트 발생
      window.dispatchEvent(new Event("userDataChanged"))
      window.dispatchEvent(new Event("storage"))

      setCurrentBalance(updatedBalance)
      setIsConfirmDialogOpen(false)
      setChargeAmount("")
      setSelectedPaymentMethod("")
      setChargeStep(1)

      alert(`${amount.toLocaleString()}원 충전이 완료되었습니다.`)
    } else {
      alert("사용자 정보를 찾을 수 없습니다.")
    }
  }

  const getSelectedPaymentMethodInfo = () => {
    return paymentMethods.find((method) => method.id === selectedPaymentMethod)
  }

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
                  <Wallet className="h-6 w-6 text-white" />
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
                className="rounded-xl bg-yellow hover:from-yellow/90 hover:to-green/90 text-white font-semibold px-8 py-3 h-auto shadow-lg"
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
                  ? "bg-yellow text-white shadow-md"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              결제 수단
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={`rounded-xl transition-all font-semibold ${
                activeTab === "history"
                  ? "bg-yellow text-white shadow-md"
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
                  <p className="text-gray">투자 내역을 불러오는 중...</p>
                </div>
              ) : investmentHistory.length > 0 ? (
                investmentHistory.map((investment) => (
                  <Card
                    key={`${investment.id}-${investment.date}`}
                    className="rounded-2xl border-0 shadow-md bg-white dark:bg-darkblue/20 hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <ArrowRight className="h-6 w-6 text-blue-500 rotate-45" />
                          </div>
                          <div>
                            <p className="font-semibold text-darkblue dark:text-light">투자</p>
                            <p className="text-sm text-gray">{investment.webtoonTitle}</p>
                            <p className="text-xs text-gray mt-1">{investment.date}</p>
                            {investment.status === "completed" && investment.roi && (
                              <Badge className="bg-green/10 text-green border-green/20 mt-2">
                                수익률: +{investment.roi}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-blue-500">-{investment.amount.toLocaleString()}원</p>
                          <Badge variant="outline" className="mt-1">
                            {investment.status === "completed" ? "완료" : "진행중"}
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
                  <p className="text-gray font-medium">투자 내역이 없습니다</p>
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
                    className="flex items-center space-x-3 p-4 rounded-xl border border-gray/10 hover:bg-gray/5 transition-colors"
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
                <Label
                  htmlFor="chargeAmount"
                  className="text-sm font-semibold text-darkblue dark:text-light block mb-3"
                >
                  충전 금액
                </Label>
                <Input
                  type="number"
                  id="chargeAmount"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="충전할 금액을 입력하세요"
                  className="rounded-xl border-gray/20 bg-gray/5 focus:bg-white h-14 text-lg text-center font-semibold"
                />
              </div>

              <div>
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
              className="flex-1 rounded-xl bg-yellow hover:from-yellow/90 hover:to-green/90 text-white h-12 font-semibold"
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
                  <Wallet className="h-8 w-8 text-white" />
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
              className="flex-1 rounded-xl bg-yellow hover:from-yellow/90 hover:to-green/90 text-white h-12 font-semibold"
              onClick={handleCharge}
            >
              <Check className="h-5 w-5 mr-2" />
              충전 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
