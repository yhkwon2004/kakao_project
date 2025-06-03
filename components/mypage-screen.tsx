"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ChevronRight,
  CreditCard,
  Gift,
  Settings,
  Star,
  Package,
  LogOut,
  Sun,
  Moon,
  Calendar,
  Plus,
} from "lucide-react"
import { Logo } from "@/components/logo"
import {
  getUserFromStorage,
  clearUserFromStorage,
  updateUserProfile,
  saveUserToStorage,
  getUserProfileImage,
} from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

// Supabase 클라이언트 싱글톤 패턴 적용
let supabaseInstance: ReturnType<typeof createClient> | null = null

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export function MyPageScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [points, setPoints] = useState(150000)
  const [mileage, setMileage] = useState(0)
  const [isChangingTheme, setIsChangingTheme] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [lastAttendanceDate, setLastAttendanceDate] = useState<string | null>(null)
  const [hasCheckedToday, setHasCheckedToday] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("light")

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)

    // 로컬 스토리지에서 테마 로드
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      // 기본 테마 설정
      setCurrentTheme("light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // 실시간 데이터 업데이트를 위한 함수
  const updateUserData = () => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      setUserEmail(user.email)
      if (user.profileImage && !user.profileImage.startsWith("blob:")) {
        setProfileImage(user.profileImage)
      } else {
        setProfileImage(null)
        // Clear invalid blob URL from storage
        if (user.profileImage && user.profileImage.startsWith("blob:")) {
          user.profileImage = undefined
          saveUserToStorage(user)
        }
      }
      if (user.balance !== undefined) {
        setPoints(user.balance)
      } else {
        // Only set default balance if user doesn't have balance property at all
        // Don't automatically charge when balance is 0
        setPoints(0)
      }

      // 마일리지 데이터 로드
      const mileageData = localStorage.getItem("userMileage")
      if (mileageData) {
        const parsedData = JSON.parse(mileageData)
        setMileage(parsedData.totalMileage || 0)
        setLastAttendanceDate(parsedData.lastAttendanceDate || null)

        // 오늘 출석 체크 여부 확인
        const today = new Date().toISOString().split("T")[0]
        setHasCheckedToday(parsedData.lastAttendanceDate === today)
      } else {
        // 초기 마일리지 데이터 설정
        const initialMileageData = {
          totalMileage: 0,
          history: [],
          lastAttendanceDate: null,
        }
        localStorage.setItem("userMileage", JSON.stringify(initialMileageData))
        setMileage(0)
      }
    } else {
      router.push("/")
    }
  }

  // Load user info and set up real-time updates
  useEffect(() => {
    // 초기 데이터 로드
    updateUserData()

    // 로컬 스토리지 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userMileage" || e.key === "currentUser") {
        updateUserData()
      }
      if (e.key === "theme") {
        const newTheme = e.newValue || "light"
        setCurrentTheme(newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // 커스텀 이벤트 리스너 추가 (다른 컴포넌트에서 발생시킨 이벤트 감지)
    const handleCustomEvent = () => {
      updateUserData()
    }

    window.addEventListener("userDataChanged", handleCustomEvent)
    window.addEventListener("mileageUpdated", handleCustomEvent)

    // 1분마다 데이터 새로고침 (실시간 업데이트 시뮬레이션)
    const intervalId = setInterval(updateUserData, 60000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
      window.removeEventListener("mileageUpdated", handleCustomEvent)
      clearInterval(intervalId)
    }
  }, [router])

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

    // 마일리지 데이터 가져오기
    const mileageData = localStorage.getItem("userMileage")
    let parsedData = {}

    if (mileageData) {
      parsedData = JSON.parse(mileageData)
    }

    const attendanceMileage = 5 // 출석 체크 시 지급할 마일리지

    // 새로운 마일리지 기록
    const newRecord = {
      id: Date.now().toString(),
      type: "earned",
      amount: attendanceMileage,
      description: "출석 체크 보상",
      date: today,
      source: "attendance",
    }

    // 마일리지 업데이트
    const updatedData = {
      totalMileage: (parsedData.totalMileage || 0) + attendanceMileage,
      lastAttendanceDate: today,
      attendanceStreak: (parsedData.attendanceStreak || 0) + 1,
      history: [newRecord, ...(parsedData.history || [])],
      exchangedItems: parsedData.exchangedItems || [],
    }

    // 로컬 스토리지에 저장
    localStorage.setItem("userMileage", JSON.stringify(updatedData))

    // 상태 업데이트
    setMileage(updatedData.totalMileage)
    setLastAttendanceDate(today)
    setHasCheckedToday(true)

    // 마일리지 업데이트 이벤트 발생
    window.dispatchEvent(new CustomEvent("mileageUpdated"))

    // 토스트 메시지 표시
    toast({
      title: "출석 체크 완료!",
      description: `${attendanceMileage} 마일리지가 적립되었습니다.`,
      duration: 3000,
    })
  }

  const menuItems = [
    {
      id: "payment",
      label: "결제 및 포인트 관리",
      icon: CreditCard,
      href: "/mypage/payment",
      description: "결제수단 추가/삭제, 충전 내역 및 사용 내역 조회, 보유 포인트 표시",
    },
    {
      id: "mileage",
      label: "마일리지 적립 확인",
      icon: Gift,
      href: "/mypage/mileage",
      description: "출석 체크, 마일리지 적립 내역, 굿즈 교환 및 혜택 확인",
    },
    {
      id: "account",
      label: "계정 설정",
      icon: Settings,
      href: "/mypage/settings",
      description: "이름 변경, 비밀번호 변경, 프로필 이미지 설정, 로그아웃",
    },
    {
      id: "favorites",
      label: "관심 웹툰",
      icon: Star,
      href: "/mypage/favorites",
      description: "관심 작품 추가/삭제, 투자 예정작 미리 보기, 알림 설정",
    },
    {
      id: "completed",
      label: "종료된 프로젝트 보기",
      icon: Package,
      href: "/mypage/completed",
      description: "완료된 투자 프로젝트 리스트, 투자 성과 요약, 피드백 남기기",
    },
  ]

  const handleLogout = () => {
    clearUserFromStorage()
    router.push("/")
  }

  // 테마 전환 함수
  const toggleTheme = useCallback(async () => {
    if (!mounted || isChangingTheme) return

    setIsChangingTheme(true)

    // 현재 테마 확인 및 새 테마 설정
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    console.log(`Changing theme from ${currentTheme} to ${newTheme}`)

    // 로컬 스토리지에 테마 저장
    localStorage.setItem("theme", newTheme)

    // 상태 업데이트
    setCurrentTheme(newTheme)

    // HTML 요소에 직접 클래스 적용
    document.documentElement.classList.toggle("dark", newTheme === "dark")

    // Save theme preference to database
    if (userEmail) {
      try {
        const supabase = getSupabaseClient()
        await supabase.from("users").update({ theme: newTheme }).eq("email", userEmail)

        // 사용자 프로필 업데이트
        await updateUserProfile(undefined, undefined, newTheme)

        console.log("Theme updated successfully:", newTheme)
      } catch (error) {
        console.error("Error updating theme:", error)
      }
    }

    // Reset animation state after transition
    setTimeout(() => {
      setIsChangingTheme(false)
    }, 500)
  }, [mounted, isChangingTheme, currentTheme, userEmail])

  // 클라이언트 사이드 렌더링 확인
  if (!mounted) {
    return null
  }

  // 현재 테마 확인
  const isDarkMode = currentTheme === "dark"

  return (
    <div
      className={`flex flex-col pb-20 bg-light dark:bg-dark transition-colors duration-300 ${isChangingTheme ? "theme-transition" : ""}`}
    >
      {/* Header - 로고 일관성을 위해 수정 */}
      <div className="flex justify-between items-center h-16 px-4 border-b border-gray/10 transition-colors duration-300 bg-light/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-40">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow" /> : <Moon className="h-5 w-5 text-darkblue" />}
        </Button>
      </div>

      {/* Profile section */}
      <div className="p-4">
        <Card className="rounded-2xl overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-darkblue/40 dark:to-darkblue/20 transition-colors duration-300">
          <CardHeader className="p-6 bg-gradient-to-r from-green/5 via-yellow/5 to-green/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green/10 to-yellow/10 opacity-50"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white dark:border-darkblue shadow-lg">
                  <AvatarImage
                    src={getUserProfileImage() || "/placeholder.svg"}
                    alt={userName}
                    onError={() => {
                      const user = getUserFromStorage()
                      if (user) {
                        user.profileImage = undefined
                        saveUserToStorage(user)
                        setProfileImage(null)
                      }
                    }}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-green to-yellow text-white text-xl">
                    <img
                      src="/images/guest-profile.jpeg"
                      alt="Guest Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green rounded-full border-2 border-white dark:border-darkblue flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-0 h-auto hover:bg-green/5 dark:hover:bg-green/10 rounded-lg transition-colors"
                onClick={() => router.push("/mypage/settings")}
              >
                <div className="text-left">
                  <h2 className="text-xl font-bold text-darkblue dark:text-light transition-colors duration-300">
                    {userName}
                  </h2>
                  <p className="text-gray transition-colors duration-300">투자자</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray transition-colors duration-300" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green/5 to-yellow/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray transition-colors duration-300">현재 잔액</p>
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green to-green/80 bg-clip-text text-transparent">
                  {points.toLocaleString()}원
                </p>
              </div>
              <Button
                className="rounded-2xl bg-gradient-to-r from-green to-green/90 hover:from-green/90 hover:to-green text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => router.push("/mypage/payment")}
              >
                <Plus className="h-4 w-4 mr-2" />
                충전하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 마일리지 및 출석 체크 섹션 (새로 추가) */}
      <div className="p-4 pt-0">
        <Card className="rounded-2xl mb-4 border-0 shadow-lg bg-gradient-to-br from-yellow/5 to-orange/5 dark:from-yellow/10 dark:to-orange/10 transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow to-orange rounded-2xl flex items-center justify-center shadow-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-darkblue dark:text-light transition-colors duration-300">마일리지</h3>
                  <p className="text-xs text-gray">포인트 적립 시스템</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-yellow/30 text-yellow hover:bg-yellow/10 hover:border-yellow/50 transition-all duration-300"
                onClick={() => router.push("/mypage/mileage")}
              >
                자세히 보기
              </Button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray">보유 마일리지</p>
                <p className="text-xl font-bold text-yellow">{mileage.toLocaleString()} P</p>
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

            <div className="text-xs text-gray">
              <p>• 매일 출석 체크로 5 마일리지를 적립하세요!</p>
              <p>• 투자 금액 1,000원당 1 마일리지가 적립됩니다.</p>
              <p>• 적립된 마일리지로 다양한 굿즈와 혜택을 받아보세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme setting */}
      <div className="p-4 pt-0">
        <Card
          className={`rounded-2xl mb-4 border-0 shadow-lg bg-gradient-to-br from-purple/5 to-blue/5 dark:from-purple/10 dark:to-blue/10 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${isChangingTheme ? "scale-[1.02]" : ""}`}
          onClick={() => {
            if (!isChangingTheme) {
              toggleTheme()
            }
          }}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple to-blue rounded-2xl flex items-center justify-center shadow-lg">
                  {isDarkMode ? (
                    <Moon className="h-6 w-6 text-white transition-transform duration-300" />
                  ) : (
                    <Sun className="h-6 w-6 text-white transition-transform duration-300" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-darkblue dark:text-light transition-colors duration-300">
                    🎨 테마 설정
                  </span>
                  <p className="text-sm text-gray mt-1 transition-colors duration-300">
                    현재: {isDarkMode ? "다크 모드" : "라이트 모드"}
                  </p>
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl bg-gradient-to-br from-purple/10 to-blue/10 transition-all duration-300 ${isChangingTheme ? "rotate-180" : ""}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-purple" /> : <Moon className="h-5 w-5 text-blue-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu section */}
      <div className="p-4 pt-0">
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-darkblue/30 transition-colors duration-300">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray/5">
              {menuItems.map((item, index) => (
                <li key={item.id}>
                  <button
                    className="flex items-center justify-between w-full p-6 text-left hover:bg-gradient-to-r hover:from-gray/5 hover:to-transparent dark:hover:from-darkblue/50 dark:hover:to-transparent transition-all duration-300 group"
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray/10 to-gray/5 dark:from-gray/20 dark:to-gray/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-6 w-6 text-gray group-hover:text-darkblue dark:group-hover:text-light transition-colors duration-300" />
                      </div>
                      <div>
                        <span className="font-bold text-darkblue dark:text-light transition-colors duration-300 group-hover:text-green">
                          {item.label}
                        </span>
                        <p className="text-sm text-gray mt-1 transition-colors duration-300">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray flex-shrink-0 transition-all duration-300 group-hover:text-green group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Logout button */}
      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          className="w-full rounded-xl border-green text-green hover:bg-green/10 transition-colors duration-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
