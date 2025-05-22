"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Gift, Calendar, ShoppingBag, History, AlertCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import Image from "next/image"

// 마일리지 내역 타입
interface MileageHistory {
  date: string
  amount: number
  type: "적립" | "사용"
  reason: string
}

// 마일리지 데이터 타입
interface MileageData {
  totalMileage: number
  history: MileageHistory[]
  lastAttendanceDate: string | null
}

// 굿즈 아이템 타입
interface GoodsItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
}

export function MileageScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("history")
  const [mileageData, setMileageData] = useState<MileageData>({
    totalMileage: 0,
    history: [],
    lastAttendanceDate: null,
  })
  const [userName, setUserName] = useState("사용자")
  const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false)
  const [selectedGoods, setSelectedGoods] = useState<GoodsItem | null>(null)
  const [attendanceStreak, setAttendanceStreak] = useState(0)
  const [hasCheckedToday, setHasCheckedToday] = useState(false)

  // 굿즈 아이템 목록
  const goodsItems: GoodsItem[] = [
    {
      id: "goods1",
      name: "웹툰 캐릭터 피규어",
      description: "인기 웹툰 캐릭터의 한정판 피규어입니다.",
      price: 5000,
      image: "/webtoon-character-figure.png",
      stock: 10,
    },
    {
      id: "goods2",
      name: "웹툰 아트북",
      description: "인기 웹툰의 아트워크와 제작 과정을 담은 아트북입니다.",
      price: 3000,
      image: "/webtoon-artbook.png",
      stock: 15,
    },
    {
      id: "goods3",
      name: "웹툰 OST 앨범",
      description: "드라마화된 웹툰의 OST 앨범입니다.",
      price: 2000,
      image: "/webtoon-ost-album.png",
      stock: 20,
    },
    {
      id: "goods4",
      name: "웹툰 키링 세트",
      description: "인기 웹툰 캐릭터들의 키링 세트입니다.",
      price: 1500,
      image: "/placeholder.svg?height=200&width=200&query=웹툰 키링 세트",
      stock: 30,
    },
    {
      id: "goods5",
      name: "투자 수수료 할인권",
      description: "다음 투자 시 수수료를 50% 할인받을 수 있는 쿠폰입니다.",
      price: 1000,
      image: "/placeholder.svg?height=200&width=200&query=할인 쿠폰",
      stock: 50,
    },
  ]

  // 마일리지 데이터 로드
  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
    }

    // 마일리지 데이터 로드
    const loadMileageData = () => {
      const storedData = localStorage.getItem("userMileage")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setMileageData(parsedData)

        // 오늘 출석 체크 여부 확인
        const today = new Date().toISOString().split("T")[0]
        setHasCheckedToday(parsedData.lastAttendanceDate === today)

        // 연속 출석 일수 계산
        calculateAttendanceStreak(parsedData.history)
      } else {
        // 초기 마일리지 데이터 설정
        const initialData = {
          totalMileage: 0,
          history: [],
          lastAttendanceDate: null,
        }
        localStorage.setItem("userMileage", JSON.stringify(initialData))
        setMileageData(initialData)
      }
    }

    loadMileageData()

    // 로컬 스토리지 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userMileage") {
        loadMileageData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 커스텀 이벤트 리스너 추가
    const handleCustomEvent = () => {
      loadMileageData()
    }

    window.addEventListener("userDataChanged", handleCustomEvent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
    }
  }, [])

  // 연속 출석 일수 계산
  const calculateAttendanceStreak = (history: MileageHistory[]) => {
    // 출석 체크 기록만 필터링
    const attendanceHistory = history
      .filter((item) => item.reason === "출석 체크")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 최신순 정렬

    if (attendanceHistory.length === 0) {
      setAttendanceStreak(0)
      return
    }

    let streak = 1
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    // 가장 최근 출석이 오늘이나 어제가 아니면 연속 출석 끊김
    if (attendanceHistory[0].date !== today && attendanceHistory[0].date !== yesterdayStr) {
      setAttendanceStreak(0)
      return
    }

    // 연속 출석 일수 계산
    for (let i = 0; i < attendanceHistory.length - 1; i++) {
      const currentDate = new Date(attendanceHistory[i].date)
      const prevDate = new Date(attendanceHistory[i + 1].date)

      // 날짜 차이가 1일이면 연속 출석
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    setAttendanceStreak(streak)
  }

  // 출석 체크 처리 함수
  const handleAttendanceCheck = () => {
    const today = new Date().toISOString().split("T")[0]

    // 이미 오늘 출석 체크를 했는지 확인
    if (hasCheckedToday) {
      toast({
        title: "이미 출석 체크를 완료했습니다",
        description: "내일 다시 방문해주세요!",
        duration: 3000,
      })
      return
    }

    // 기본 마일리지
    const attendanceMileage = 5

    // 연속 출석 보너스 (5일 연속마다 추가 보너스)
    let bonusMileage = 0
    if (attendanceStreak > 0 && (attendanceStreak + 1) % 5 === 0) {
      bonusMileage = 25
    }

    const totalAddedMileage = attendanceMileage + bonusMileage

    // 마일리지 업데이트
    const updatedData = {
      ...mileageData,
      totalMileage: mileageData.totalMileage + totalAddedMileage,
      lastAttendanceDate: today,
      history: [
        {
          date: today,
          amount: totalAddedMileage,
          type: "적립" as const,
          reason:
            bonusMileage > 0
              ? `출석 체크 (${attendanceStreak + 1}일 연속 출석 보너스 +${bonusMileage}P 포함)`
              : "출석 체크",
        },
        ...mileageData.history,
      ],
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("userMileage", JSON.stringify(updatedData))

    // 상태 업데이트
    setMileageData(updatedData)
    setHasCheckedToday(true)
    setAttendanceStreak(attendanceStreak + 1)

    // 토스트 메시지 표시
    toast({
      title: "출석 체크 완료!",
      description:
        bonusMileage > 0
          ? `${totalAddedMileage}P가 적립되었습니다. (연속 출석 보너스 +${bonusMileage}P 포함)`
          : `${totalAddedMileage}P가 적립되었습니다.`,
      duration: 3000,
    })

    // 커스텀 이벤트 발생 (다른 컴포넌트에 변경 알림)
    window.dispatchEvent(new Event("userDataChanged"))
  }

  // 굿즈 교환 처리 함수
  const handleExchangeGoods = () => {
    if (!selectedGoods) return

    // 마일리지가 부족한 경우
    if (mileageData.totalMileage < selectedGoods.price) {
      toast({
        title: "마일리지 부족",
        description: `교환에 필요한 마일리지가 부족합니다. (필요: ${selectedGoods.price}P)`,
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // 마일리지 차감 및 내역 추가
    const updatedData = {
      ...mileageData,
      totalMileage: mileageData.totalMileage - selectedGoods.price,
      history: [
        {
          date: new Date().toISOString().split("T")[0],
          amount: selectedGoods.price,
          type: "사용" as const,
          reason: `굿즈 교환: ${selectedGoods.name}`,
        },
        ...mileageData.history,
      ],
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("userMileage", JSON.stringify(updatedData))

    // 상태 업데이트
    setMileageData(updatedData)
    setIsExchangeDialogOpen(false)

    // 토스트 메시지 표시
    toast({
      title: "굿즈 교환 완료!",
      description: `${selectedGoods.name} 교환이 완료되었습니다. 배송 정보는 이메일로 발송됩니다.`,
      duration: 3000,
    })

    // 커스텀 이벤트 발생 (다른 컴포넌트에 변경 알림)
    window.dispatchEvent(new Event("userDataChanged"))
  }

  // 굿즈 교환 다이얼로그 열기
  const openExchangeDialog = (goods: GoodsItem) => {
    setSelectedGoods(goods)
    setIsExchangeDialogOpen(true)
  }

  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`
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

      {/* 마일리지 요약 */}
      <div className="p-4">
        <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 bg-gradient-to-r from-yellow/10 to-green/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow" />
                <h2 className="font-bold text-darkblue dark:text-light">마일리지 적립 확인</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray">보유 마일리지</p>
                <p className="text-2xl font-bold text-yellow">{mileageData.totalMileage.toLocaleString()} P</p>
              </div>
              <Button
                className={`rounded-xl ${hasCheckedToday ? "bg-gray hover:bg-gray/90" : "bg-yellow hover:bg-yellow/90"} text-dark`}
                onClick={handleAttendanceCheck}
                disabled={hasCheckedToday}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {hasCheckedToday ? "출석 완료" : "오늘 출석 체크"}
              </Button>
            </div>

            <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl mb-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-darkblue dark:text-light">연속 출석 일수</p>
                <p className="text-sm font-bold text-yellow">{attendanceStreak}일</p>
              </div>
              <div className="mt-2 text-xs text-gray">
                <p>• 매일 출석 시 5P 적립</p>
                <p>• 5일 연속 출석 시 보너스 25P 추가 적립</p>
                <p>• 하루라도 놓치면 연속 출석 일수가 초기화됩니다</p>
              </div>
            </div>

            <div className="text-xs text-gray">
              <p>• 투자 금액 1,000원당 1P가 적립됩니다.</p>
              <p>• 적립된 마일리지는 다양한 굿즈로 교환할 수 있습니다.</p>
              <p>• 마일리지 유효기간은 적립일로부터 1년입니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4 pt-0">
        <Tabs defaultValue="history" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
            <TabsTrigger
              value="history"
              className={`rounded-full transition-all ${
                activeTab === "history"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              적립/사용 내역
            </TabsTrigger>
            <TabsTrigger
              value="goods"
              className={`rounded-full transition-all ${
                activeTab === "goods"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              굿즈 교환
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-gray" />
                  <h3 className="font-bold text-darkblue dark:text-light">마일리지 내역</h3>
                </div>

                {mileageData.history.length > 0 ? (
                  <div className="space-y-3">
                    {mileageData.history.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-light dark:bg-darkblue/20 rounded-lg border border-gray/10"
                      >
                        <div>
                          <p className="font-medium text-sm text-darkblue dark:text-light">{item.reason}</p>
                          <p className="text-xs text-gray">{formatDate(item.date)}</p>
                        </div>
                        <p className={`font-bold ${item.type === "적립" ? "text-yellow" : "text-red-500"}`}>
                          {item.type === "적립" ? "+" : "-"}
                          {item.amount.toLocaleString()} P
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray">
                    <p>마일리지 내역이 없습니다.</p>
                    <p className="text-sm mt-2">출석 체크와 투자로 마일리지를 적립해보세요!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goods">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-5 w-5 text-green" />
                  <h3 className="font-bold text-darkblue dark:text-light">굿즈 교환</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goodsItems.map((goods) => (
                    <div
                      key={goods.id}
                      className="border border-gray/20 rounded-xl overflow-hidden bg-light dark:bg-darkblue/20"
                    >
                      <div className="relative h-40 w-full">
                        <Image
                          src={`/placeholder.svg?height=200&width=200&query=${goods.name}`}
                          alt={goods.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-darkblue dark:text-light">{goods.name}</h4>
                          <p className="font-bold text-yellow">{goods.price.toLocaleString()} P</p>
                        </div>
                        <p className="text-xs text-gray mb-3">{goods.description}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray">재고: {goods.stock}개</p>
                          <Button
                            size="sm"
                            className={`rounded-full ${
                              mileageData.totalMileage >= goods.price
                                ? "bg-green hover:bg-green/90 text-light"
                                : "bg-gray hover:bg-gray/90 text-dark"
                            }`}
                            onClick={() => openExchangeDialog(goods)}
                            disabled={mileageData.totalMileage < goods.price}
                          >
                            교환하기
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 굿즈 교환 확인 다이얼로그 */}
      {selectedGoods && (
        <Dialog open={isExchangeDialogOpen} onOpenChange={setIsExchangeDialogOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">굿즈 교환 확인</DialogTitle>
              <DialogDescription>선택한 굿즈로 마일리지를 교환하시겠습니까?</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={`/placeholder.svg?height=100&width=100&query=${selectedGoods.name}`}
                    alt={selectedGoods.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-darkblue dark:text-light">{selectedGoods.name}</h4>
                  <p className="text-xs text-gray">{selectedGoods.description}</p>
                  <p className="font-bold text-yellow mt-1">{selectedGoods.price.toLocaleString()} P</p>
                </div>
              </div>

              <div className="bg-yellow/10 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow flex-shrink-0 mt-0.5" />
                <div className="text-sm text-darkblue dark:text-light">
                  <p>교환 후에는 취소가 불가능합니다.</p>
                  <p className="mt-1">
                    교환 후 남은 마일리지:{" "}
                    <span className="font-bold">
                      {(mileageData.totalMileage - selectedGoods.price).toLocaleString()} P
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl border-gray/20 text-gray"
                onClick={() => setIsExchangeDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-xl bg-green hover:bg-green/90 text-light"
                onClick={handleExchangeGoods}
              >
                교환하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
