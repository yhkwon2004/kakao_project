"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Gift, Calendar, Star, Trophy, Zap, CheckCircle, Clock } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"

interface MileageRecord {
  id: string
  type: "earned" | "used"
  amount: number
  description: string
  date: string
  source?: string
}

export function MileageScreen() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState("권용현")
  const [totalMileage, setTotalMileage] = useState(0)
  const [mileageHistory, setMileageHistory] = useState<MileageRecord[]>([])
  const [lastAttendanceDate, setLastAttendanceDate] = useState<string | null>(null)
  const [attendanceStreak, setAttendanceStreak] = useState(0)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const [exchangedItems, setExchangedItems] = useState<any[]>([])
  const [exchangeStep, setExchangeStep] = useState<"confirm" | "phone" | "success" | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [deliveryInfo, setDeliveryInfo] = useState({ name: "", address: "" })

  useEffect(() => {
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
    }

    // 마일리지 데이터 로드 함수
    const loadMileageData = () => {
      const mileageData = localStorage.getItem("userMileage")
      if (mileageData) {
        const data = JSON.parse(mileageData)
        setTotalMileage(data.totalMileage || 0)
        setMileageHistory(data.history || [])
        setLastAttendanceDate(data.lastAttendanceDate)
        setAttendanceStreak(data.attendanceStreak || 0)
        setExchangedItems(data.exchangedItems || [])
      } else {
        const initialData = {
          totalMileage: 0,
          history: [],
          lastAttendanceDate: null,
          attendanceStreak: 0,
          exchangedItems: [],
        }
        localStorage.setItem("userMileage", JSON.stringify(initialData))
      }
    }

    // 초기 로드
    loadMileageData()

    // 다른 페이지에서 마일리지 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userMileage") {
        loadMileageData()
      }
    }

    const handleCustomMileageEvent = () => {
      loadMileageData()
    }

    // 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("mileageUpdated", handleCustomMileageEvent)

    // 1초마다 마일리지 데이터 체크 (실시간 업데이트)
    const intervalId = setInterval(loadMileageData, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("mileageUpdated", handleCustomMileageEvent)
      clearInterval(intervalId)
    }
  }, [])

  const handleAttendance = () => {
    const today = new Date().toISOString().split("T")[0]

    if (lastAttendanceDate === today) {
      return
    }

    const earnedMileage = 5
    const newRecord: MileageRecord = {
      id: Date.now().toString(),
      type: "earned",
      amount: earnedMileage,
      description: "출석 체크 보상",
      date: today,
      source: "attendance",
    }

    const newTotalMileage = totalMileage + earnedMileage
    const newHistory = [newRecord, ...mileageHistory]
    const newStreak = attendanceStreak + 1

    setTotalMileage(newTotalMileage)
    setMileageHistory(newHistory)
    setLastAttendanceDate(today)
    setAttendanceStreak(newStreak)

    const updatedData = {
      totalMileage: newTotalMileage,
      history: newHistory,
      lastAttendanceDate: today,
      attendanceStreak: newStreak,
      exchangedItems,
    }
    localStorage.setItem("userMileage", JSON.stringify(updatedData))

    // 마일리지 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent("mileageUpdated"))
  }

  const canAttendToday = () => {
    const today = new Date().toISOString().split("T")[0]
    return lastAttendanceDate !== today
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const mileageRewards = [
    { points: 5000, reward: "웹툰 아트북", icon: "📚", available: totalMileage >= 5000 },
    { points: 15000, reward: "캐릭터 피규어", icon: "🎭", available: totalMileage >= 15000 },
    { points: 30000, reward: "작가 사인회 티켓", icon: "✍️", available: totalMileage >= 30000 },
    { points: 50000, reward: "OTT 이용권 (1개월)", icon: "📺", available: totalMileage >= 50000 },
  ]

  const handleExchange = (reward: any) => {
    if (totalMileage >= reward.points) {
      setExchangeStep("phone")
    }
  }

  const completeExchange = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("올바른 전화번호를 입력해주세요.")
      return
    }

    const newRecord: MileageRecord = {
      id: Date.now().toString(),
      type: "used",
      amount: selectedReward.points,
      description: `${selectedReward.reward} 교환`,
      date: new Date().toISOString().split("T")[0],
      source: "exchange",
    }

    const newTotalMileage = totalMileage - selectedReward.points
    const newHistory = [newRecord, ...mileageHistory]
    const newExchangedItems = [
      ...exchangedItems,
      {
        ...selectedReward,
        exchangeDate: new Date().toISOString(),
        phoneNumber: phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"),
      },
    ]

    setTotalMileage(newTotalMileage)
    setMileageHistory(newHistory)
    setExchangedItems(newExchangedItems)

    const updatedData = {
      totalMileage: newTotalMileage,
      history: newHistory,
      lastAttendanceDate,
      attendanceStreak,
      exchangedItems: newExchangedItems,
    }
    localStorage.setItem("userMileage", JSON.stringify(updatedData))

    setExchangeStep("success")

    // 3초 후 자동으로 모달 닫기
    setTimeout(() => {
      setExchangeStep(null)
      setSelectedReward(null)
      setPhoneNumber("")
    }, 3000)
  }

  const isEarnedMileage = (record: MileageRecord) => {
    // 명시적으로 earned 타입이거나, 출석/투자 소스이거나, 설명에 적립 관련 키워드가 포함된 경우
    if (record.type === "earned") return true
    if (record.source === "attendance" || record.source === "investment") return true
    if (
      record.description &&
      (record.description.includes("출석 체크") ||
        record.description.includes("투자 보상") ||
        record.description.includes("투자 마일리지") ||
        record.description.includes("웹툰 투자"))
    )
      return true

    // 사용 타입이면서 교환이 아닌 경우는 false
    if (record.type === "used" && record.source !== "exchange") return false

    return false
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
        {/* 마일리지 요약 카드 */}
        <Card className="bg-gradient-to-br from-[#F9DF52] to-[#F5C882] text-[#323233] border-0 shadow-xl shadow-[#C2BDAD]/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-[#323233]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">내 마일리지</h2>
                  <p className="text-[#323233]/80 text-sm">{currentUser}님의 포인트</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{totalMileage.toLocaleString()}</p>
                <p className="text-[#323233]/80 text-sm">포인트</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-[#323233]" />
                  <p className="text-[#323233]/80 text-xs font-medium">연속 출석</p>
                </div>
                <p className="text-lg font-bold">{attendanceStreak}일</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-[#323233]" />
                  <p className="text-[#323233]/80 text-xs font-medium">이번 달 적립</p>
                </div>
                <p className="text-lg font-bold">
                  {mileageHistory
                    .filter((record) => {
                      const recordDate = new Date(record.date)
                      const currentDate = new Date()
                      return (
                        record.type === "earned" &&
                        recordDate.getMonth() === currentDate.getMonth() &&
                        recordDate.getFullYear() === currentDate.getFullYear()
                      )
                    })
                    .reduce((sum, record) => sum + record.amount, 0)
                    .toLocaleString()}
                  P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 출석 체크 */}
        <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
          <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#5F859F]" />
              <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">출석 체크</h3>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-[#989898] mb-1">매일 출석하고 마일리지를 받아보세요!</p>
                <p className="text-xs text-[#989898]">연속 출석 시 보너스 포인트 지급</p>
              </div>
              <Button
                onClick={handleAttendance}
                disabled={!canAttendToday()}
                className={`px-6 py-3 rounded-xl font-medium ${
                  canAttendToday()
                    ? "bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233]"
                    : "bg-[#BCBCBC] text-[#989898] cursor-not-allowed"
                }`}
              >
                {canAttendToday() ? (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    출석 체크 (+5P)
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    출석 완료
                  </>
                )}
              </Button>
            </div>

            {/* 출석 달력 미니 버전 */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day} className="p-2 text-[#989898] font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - 6 + i)
                const dateString = date.toISOString().split("T")[0]
                const isToday = dateString === new Date().toISOString().split("T")[0]
                const hasAttended = lastAttendanceDate === dateString || (i < 6 && Math.random() > 0.3)

                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg ${
                      isToday
                        ? "bg-[#F9DF52] text-[#323233] font-bold"
                        : hasAttended
                          ? "bg-[#4F8F78]/20 text-[#4F8F78]"
                          : "text-[#989898]"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 마일리지 상점 */}
        <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
          <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#706FB9]" />
              <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">마일리지 상점</h3>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {mileageRewards.map((reward, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    reward.available
                      ? "border-[#4F8F78] bg-[#4F8F78]/5 hover:bg-[#4F8F78]/10"
                      : "border-[#BCBCBC] bg-[#E5E4DC]/30"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{reward.icon}</div>
                    <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52] mb-1">{reward.reward}</p>
                    <p className="text-xs text-[#989898] mb-3">{reward.points.toLocaleString()}P</p>
                    <Button
                      size="sm"
                      disabled={!reward.available}
                      onClick={() => {
                        setSelectedReward(reward)
                        setExchangeStep("confirm")
                      }}
                      className={`w-full text-xs ${
                        reward.available
                          ? "bg-[#4F8F78] hover:bg-[#4F8F78]/90 text-white"
                          : "bg-[#BCBCBC] text-[#989898] cursor-not-allowed"
                      }`}
                    >
                      {reward.available ? "교환하기" : "포인트 부족"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 마일리지 내역 */}
        <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
          <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
            <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">마일리지 내역</h3>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-3 mb-4 bg-[#E5E4DC] dark:bg-[#454858] p-1 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52]">
                  전체
                </TabsTrigger>
                <TabsTrigger value="earned" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52]">
                  적립
                </TabsTrigger>
                <TabsTrigger value="used" className="rounded-lg text-[#3F3F3F] dark:text-[#F9DF52]">
                  상점 교환
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {mileageHistory.length > 0 ? (
                  mileageHistory.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-[#E5E4DC]/30 dark:bg-[#454858]/30 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isEarnedMileage(record) ? "bg-[#4F8F78]/20" : "bg-[#D16561]/20"
                          }`}
                        >
                          {isEarnedMileage(record) ? (
                            <Zap className="h-4 w-4 text-[#4F8F78]" />
                          ) : (
                            <Gift className="h-4 w-4 text-[#D16561]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">{record.description}</p>
                          <p className="text-xs text-[#989898]">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isEarnedMileage(record) ? "text-[#4F8F78]" : "text-[#D16561]"}`}>
                          {isEarnedMileage(record) ? "+" : "-"}
                          {record.amount.toLocaleString()}P
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">마일리지 내역이 없습니다</p>
                    <p className="text-xs text-[#989898] mt-1">출석 체크로 마일리지를 적립해보세요!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="earned" className="space-y-3">
                {mileageHistory
                  .filter((record) => isEarnedMileage(record))
                  .slice(0, 10)
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-[#4F8F78]/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4F8F78]/20 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-[#4F8F78]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">{record.description}</p>
                          <p className="text-xs text-[#989898]">{formatDate(record.date)}</p>
                        </div>
                      </div>
                      <p className="font-bold text-[#4F8F78]">+{record.amount.toLocaleString()}P</p>
                    </div>
                  ))}
              </TabsContent>

              <TabsContent value="used" className="space-y-3">
                {mileageHistory.filter((record) => !isEarnedMileage(record) && record.type === "used").length > 0 ? (
                  mileageHistory
                    .filter((record) => !isEarnedMileage(record) && record.type === "used")
                    .slice(0, 10)
                    .map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-[#D16561]/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#D16561]/20 flex items-center justify-center">
                            <Gift className="h-4 w-4 text-[#D16561]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52]">
                              {record.description}
                            </p>
                            <p className="text-xs text-[#989898]">{formatDate(record.date)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-[#D16561]">-{record.amount.toLocaleString()}P</p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 mx-auto mb-3 text-[#989898]/50" />
                    <p className="text-[#989898]">사용 내역이 없습니다</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 교환된 상품 목록 */}
        {exchangedItems.length > 0 && (
          <Card className="border-[#BCBCBC]/20 shadow-lg shadow-[#C2BDAD]/20 bg-[#FAFAFA] dark:bg-[#3F3F3F]">
            <CardHeader className="p-4 border-b border-[#BCBCBC]/10">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-[#4F8F78]" />
                <h3 className="font-bold text-[#3F3F3F] dark:text-[#F9DF52]">교환 완료 상품</h3>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {exchangedItems.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border-2 border-[#4F8F78] bg-[#4F8F78]/5">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="font-medium text-sm text-[#3F3F3F] dark:text-[#F9DF52] mb-1">{item.reward}</p>
                      <p className="text-xs text-[#4F8F78] mb-2">교환 완료</p>
                      <p className="text-xs text-[#989898]">{formatDate(item.exchangeDate.split("T")[0])}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 교환 단계별 모달 */}
        {exchangeStep && selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FAFAFA] dark:bg-[#3F3F3F] rounded-2xl p-6 max-w-sm w-full">
              {/* 교환 확인 단계 */}
              {exchangeStep === "confirm" && (
                <div className="text-center">
                  <div className="text-4xl mb-3">{selectedReward.icon}</div>
                  <h3 className="text-lg font-bold text-[#3F3F3F] dark:text-[#F9DF52] mb-2">{selectedReward.reward}</h3>
                  <p className="text-sm text-[#989898] mb-4">
                    {selectedReward.points.toLocaleString()}P로 교환하시겠습니까?
                  </p>
                  <p className="text-xs text-[#989898] mb-6">
                    교환 후 잔여 포인트: {(totalMileage - selectedReward.points).toLocaleString()}P
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExchangeStep(null)
                        setSelectedReward(null)
                      }}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={() => setExchangeStep("phone")}
                      className="flex-1 bg-[#4F8F78] hover:bg-[#4F8F78]/90 text-white"
                    >
                      교환하기
                    </Button>
                  </div>
                </div>
              )}

              {/* 전화번호 입력 단계 */}
              {exchangeStep === "phone" && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#4F8F78]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-8 w-8 text-[#4F8F78]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3F3F3F] dark:text-[#F9DF52] mb-2">배송 정보 입력</h3>
                    <p className="text-sm text-[#989898]">{selectedReward.reward} 배송을 위한 정보를 입력해주세요</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#3F3F3F] dark:text-[#F9DF52] mb-2">
                        연락처 *
                      </label>
                      <input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "")
                          if (value.length <= 11) {
                            setPhoneNumber(value)
                          }
                        }}
                        className="w-full p-3 border border-[#BCBCBC]/30 rounded-xl bg-[#FAFAFA] dark:bg-[#454858] text-[#3F3F3F] dark:text-[#F9DF52] focus:outline-none focus:ring-2 focus:ring-[#4F8F78]"
                      />
                    </div>

                    <div className="bg-[#4F8F78]/5 p-3 rounded-xl">
                      <p className="text-xs text-[#4F8F78] font-medium mb-1">📦 배송 안내</p>
                      <p className="text-xs text-[#989898]">
                        • 교환 완료 후 3-5일 내 배송 예정
                        <br />• 배송 상태는 SMS로 안내드립니다
                        <br />• 문의: 1588-0000
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setExchangeStep("confirm")} className="flex-1">
                      이전
                    </Button>
                    <Button
                      onClick={completeExchange}
                      disabled={phoneNumber.length < 10}
                      className="flex-1 bg-[#4F8F78] hover:bg-[#4F8F78]/90 text-white disabled:bg-[#BCBCBC] disabled:cursor-not-allowed"
                    >
                      교환 완료
                    </Button>
                  </div>
                </div>
              )}

              {/* 교환 성공 단계 */}
              {exchangeStep === "success" && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#4F8F78] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#4F8F78] mb-2">교환 완료!</h3>
                  <p className="text-sm text-[#989898] mb-4">{selectedReward.reward} 교환이 완료되었습니다</p>

                  <div className="bg-[#4F8F78]/5 p-4 rounded-xl mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#989898]">상품명</span>
                      <span className="font-medium text-[#3F3F3F] dark:text-[#F9DF52]">{selectedReward.reward}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#989898]">사용 포인트</span>
                      <span className="font-medium text-[#D16561]">-{selectedReward.points.toLocaleString()}P</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#989898]">연락처</span>
                      <span className="font-medium text-[#3F3F3F] dark:text-[#F9DF52]">
                        {phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F9DF52]/10 p-3 rounded-xl">
                    <p className="text-xs text-[#989898]">🎉 교환 완료! 배송 정보는 SMS로 안내드립니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
