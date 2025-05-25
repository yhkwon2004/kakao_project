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

  useEffect(() => {
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
    }

    const mileageData = localStorage.getItem("userMileage")
    if (mileageData) {
      const data = JSON.parse(mileageData)
      setTotalMileage(data.totalMileage || 0)
      setMileageHistory(data.history || [])
      setLastAttendanceDate(data.lastAttendanceDate)
      setAttendanceStreak(data.attendanceStreak || 0)
    } else {
      const initialData = {
        totalMileage: 0,
        history: [],
        lastAttendanceDate: null,
        attendanceStreak: 0,
      }
      localStorage.setItem("userMileage", JSON.stringify(initialData))
    }
  }, [])

  const handleAttendance = () => {
    const today = new Date().toISOString().split("T")[0]

    if (lastAttendanceDate === today) {
      return
    }

    const earnedMileage = 100
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
    }
    localStorage.setItem("userMileage", JSON.stringify(updatedData))
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
    { points: 1000, reward: "웹툰 아트북", icon: "📚", available: totalMileage >= 1000 },
    { points: 2000, reward: "캐릭터 피규어", icon: "🎭", available: totalMileage >= 2000 },
    { points: 3000, reward: "한정판 굿즈", icon: "🎁", available: totalMileage >= 3000 },
    { points: 5000, reward: "작가 사인회 티켓", icon: "✍️", available: totalMileage >= 5000 },
  ]

  return (
    <div className="flex flex-col pb-20 bg-gradient-to-br from-[#FAFAFA] to-[#F9F9F9] dark:from-[#323233] dark:to-[#3F3F3F]">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-[#BCBCBC]/20 bg-[#FAFAFA]/80 dark:bg-[#3F3F3F]/80 backdrop-blur-sm sticky top-0 z-40">
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
                    출석 체크 (+100P)
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
                  사용
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
                            record.type === "earned" ? "bg-[#4F8F78]/20" : "bg-[#D16561]/20"
                          }`}
                        >
                          {record.type === "earned" ? (
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
                        <p className={`font-bold ${record.type === "earned" ? "text-[#4F8F78]" : "text-[#D16561]"}`}>
                          {record.type === "earned" ? "+" : "-"}
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
                  .filter((record) => record.type === "earned")
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
                {mileageHistory.filter((record) => record.type === "used").length > 0 ? (
                  mileageHistory
                    .filter((record) => record.type === "used")
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
      </div>
    </div>
  )
}
