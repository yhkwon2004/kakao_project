"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, CreditCard, Plus, Wallet } from "lucide-react"
import { useState } from "react"
import { Logo } from "@/components/logo"

export function PaymentScreen() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("payment")

  // 결제 수단 데이터
  const paymentMethods = [
    {
      id: "1",
      type: "신용카드",
      name: "신한카드",
      number: "****-****-****-1234",
      expiry: "12/25",
    },
    {
      id: "2",
      type: "신용카드",
      name: "국민카드",
      number: "****-****-****-5678",
      expiry: "09/24",
    },
  ]

  // 포인트 내역 데이터
  const pointHistory = [
    {
      id: "1",
      type: "충전",
      amount: 50000,
      date: "2023-05-15",
      status: "완료",
    },
    {
      id: "2",
      type: "사용",
      amount: -20000,
      date: "2023-05-10",
      status: "완료",
      description: "황녀, 반역자를 각인시키다 투자",
    },
    {
      id: "3",
      type: "충전",
      amount: 100000,
      date: "2023-05-01",
      status: "완료",
    },
  ]

  // 포인트 성장 그래프 렌더링
  const renderPointGrowthGraph = () => {
    // 월별 포인트 데이터
    const monthlyPoints = [
      { month: "1월", points: 50000 },
      { month: "2월", points: 120000 },
      { month: "3월", points: 80000 },
      { month: "4월", points: 150000 },
      { month: "5월", points: 130000 },
    ]

    return (
      <div className="relative h-48 border border-gray/20 rounded-xl p-4 bg-light dark:bg-darkblue/20">
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray py-6">
          <span>20만</span>
          <span>15만</span>
          <span>10만</span>
          <span>5만</span>
          <span>0</span>
        </div>

        {/* 그래프 영역 */}
        <div className="ml-12 h-full relative">
          {/* 가로 그리드 라인 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute w-full border-t border-gray/10" style={{ top: `${i * 25}%` }}></div>
          ))}

          {/* 포인트 라인 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={monthlyPoints
                .map((d, i) => `${(i / (monthlyPoints.length - 1)) * 100}% ${100 - (d.points / 200000) * 100}%`)
                .join(" ")}
              fill="none"
              stroke="#F9DF52"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {monthlyPoints.map((d, i) => (
              <circle
                key={i}
                cx={`${(i / (monthlyPoints.length - 1)) * 100}%`}
                cy={`${100 - (d.points / 200000) * 100}%`}
                r="4"
                fill="#F9DF52"
              />
            ))}
          </svg>

          {/* X축 레이블 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between">
            {monthlyPoints.map((d, i) => (
              <span key={i} className="text-xs text-gray">
                {d.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 포인트 요약 */}
      <div className="p-4">
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 bg-gradient-to-r from-green/10 to-yellow/10">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yellow" />
              <h2 className="font-bold text-darkblue dark:text-light">포인트 요약</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray">현재 보유 포인트</p>
                <p className="text-2xl font-bold text-profit">₩130,000</p>
              </div>
              <Button className="rounded-xl bg-yellow hover:bg-yellow/90 text-dark font-medium">포인트 충전</Button>
            </div>

            {renderPointGrowthGraph()}
          </CardContent>
        </Card>
      </div>

      {/* 결제 수단 및 포인트 내역 */}
      <div className="p-4">
        <Tabs defaultValue="payment" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
            <TabsTrigger
              value="payment"
              className={`rounded-full transition-all ${
                activeTab === "payment"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              결제 수단
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={`rounded-full transition-all ${
                activeTab === "history"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              포인트 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-green" />
                        <div>
                          <p className="font-medium text-darkblue dark:text-light">{method.name}</p>
                          <p className="text-sm text-gray">{method.number}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray">만료: {method.expiry}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button className="w-full rounded-xl border-dashed border-2 border-gray/30 h-16 bg-transparent hover:bg-light dark:hover:bg-darkblue/20 text-gray">
                <Plus className="h-5 w-5 mr-2" />
                결제 수단 추가
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              {pointHistory.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-darkblue dark:text-light">{item.type}</p>
                        {item.description && <p className="text-sm text-gray">{item.description}</p>}
                        <p className="text-xs text-gray mt-1">{item.date}</p>
                      </div>
                      <p className={`font-bold ${item.amount > 0 ? "text-profit" : "text-gray"}`}>
                        {item.amount > 0 ? "+" : ""}₩{Math.abs(item.amount).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
