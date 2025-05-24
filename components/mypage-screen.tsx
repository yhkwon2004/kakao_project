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
  User,
  Sun,
  Moon,
  Calendar,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage, clearUserFromStorage, updateUserProfile, saveUserToStorage } from "@/lib/auth"
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
      if (user.profileImage) {
        setProfileImage(user.profileImage)
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

    // 1분마다 데이터 새로고침 (실시간 업데이트 시뮬레이션)
    const intervalId = setInterval(updateUserData, 60000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleCustomEvent)
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
    if (mileageData) {
      const parsedData = JSON.parse(mileageData)
      const attendanceMileage = 5 // 출석 체크 시 지급할 마일리지

      // 마일리지 업데이트
      const updatedData = {
        ...parsedData,
        totalMileage: (parsedData.totalMileage || 0) + attendanceMileage,
        lastAttendanceDate: today,
        history: [
          ...(parsedData.history || []),
          {
            date: today,
            amount: attendanceMileage,
            type: "적립",
            reason: "출석 체크",
          },
        ],
      }

      // 로컬 스토리지에 저장
      localStorage.setItem("userMileage", JSON.stringify(updatedData))

      // 상태 업데이트
      setMileage(updatedData.totalMileage)
      setLastAttendanceDate(today)
      setHasCheckedToday(true)

      // 토스트 메시지 표시
      toast({
        title: "출석 체크 완료!",
        description: `${attendanceMileage} 마일리지가 적립되었습니다.`,
        duration: 3000,
      })
    }
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
      <div className="flex justify-between items-center p-4 border-b border-gray/10 transition-colors duration-300">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow" /> : <Moon className="h-5 w-5 text-darkblue" />}
        </Button>
      </div>

      {/* Profile section */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden border-gray/20 bg-light dark:bg-darkblue/30 transition-colors duration-300">
          <CardHeader className="p-6 bg-gradient-to-r from-green/10 to-yellow/10 transition-colors duration-300">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-light relative">
                {profileImage ? (
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt={userName}
                    onError={(e) => {
                      // Handle image loading error by falling back to default
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      // Clear invalid profile image from storage
                      const user = getUserFromStorage()
                      if (user) {
                        user.profileImage = undefined
                        saveUserToStorage(user)
                        setProfileImage(null)
                      }
                    }}
                  />
                ) : null}
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
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
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray transition-colors duration-300">잔액</p>
                <p className="text-2xl font-bold text-green transition-colors duration-300">
                  {points.toLocaleString()}원
                </p>
              </div>
              <Button
                className="rounded-xl bg-green hover:bg-green/90 text-light"
                onClick={() => router.push("/mypage/payment")}
              >
                충전하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 마일리지 및 출석 체크 섹션 (새로 추가) */}
      <div className="p-4 pt-0">
        <Card className="rounded-xl mb-4 border-gray/20 bg-light dark:bg-darkblue/30 transition-colors duration-300">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow" />
                <h3 className="font-medium text-darkblue dark:text-light transition-colors duration-300">마일리지</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-green text-green hover:bg-green/10"
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
          className={`rounded-xl mb-4 border-gray/20 bg-light dark:bg-darkblue/30 transition-colors duration-300 cursor-pointer hover:bg-green/5 dark:hover:bg-green/10 ${isChangingTheme ? "scale-[1.02]" : ""}`}
          onClick={() => {
            if (!isChangingTheme) {
              toggleTheme()
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-yellow transition-transform duration-300" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow transition-transform duration-300" />
                )}
                <div>
                  <span className="font-medium text-darkblue dark:text-light transition-colors duration-300">
                    🎨 테마 설정
                  </span>
                  <p className="text-xs text-gray mt-1 transition-colors duration-300">
                    현재 테마: {isDarkMode ? "다크 모드" : "라이트 모드"}
                  </p>
                </div>
              </div>
              <div
                className={`p-2 rounded-full bg-green/10 text-green transition-all duration-300 ${isChangingTheme ? "rotate-180" : ""}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu section */}
      <div className="p-4 pt-0">
        <Card className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30 transition-colors duration-300">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray/10">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className="flex items-center justify-between w-full p-4 text-left hover:bg-light dark:hover:bg-darkblue/50 transition-colors duration-300"
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray transition-colors duration-300" />
                      <div>
                        <span className="font-medium text-darkblue dark:text-light transition-colors duration-300">
                          {item.label}
                        </span>
                        <p className="text-xs text-gray mt-1 transition-colors duration-300">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray flex-shrink-0 transition-colors duration-300" />
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
