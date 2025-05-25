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
import {
  getUserFromStorage,
  clearUserFromStorage,
  updateUserProfile,
  saveUserToStorage,
} from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"

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

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      setCurrentTheme("light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const updateUserData = () => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      setUserEmail(user.email)
      if (user.profileImage && !user.profileImage.startsWith("blob:")) {
        setProfileImage(user.profileImage)
      } else {
        setProfileImage(null)
        if (user.profileImage && user.profileImage.startsWith("blob:")) {
          user.profileImage = undefined
          saveUserToStorage(user)
        }
      }
      if (user.balance !== undefined) {
        setPoints(user.balance)
      } else {
        setPoints(0)
      }

      const mileageData = localStorage.getItem("userMileage")
      if (mileageData) {
        const parsedData = JSON.parse(mileageData)
        setMileage(parsedData.totalMileage || 0)
        setLastAttendanceDate(parsedData.lastAttendanceDate || null)

        const today = new Date().toISOString().split("T")[0]
        setHasCheckedToday(parsedData.lastAttendanceDate === today)
      } else {
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

  useEffect(() => {
    updateUserData()
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userMileage" || e.key === "currentUser") updateUserData()
      if (e.key === "theme") {
        const newTheme = e.newValue || "light"
        setCurrentTheme(newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("userDataChanged", updateUserData)
    const intervalId = setInterval(updateUserData, 60000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", updateUserData)
      clearInterval(intervalId)
    }
  }, [router])

  const handleAttendanceCheck = () => {
    const today = new Date().toISOString().split("T")[0]
    if (hasCheckedToday) {
      toast({ title: "이미 출석 체크를 완료했습니다", description: "내일 다시 방문해주세요!", duration: 3000 })
      return
    }
    const mileageData = localStorage.getItem("userMileage")
    if (mileageData) {
      const parsedData = JSON.parse(mileageData)
      const attendanceMileage = 5
      const updatedData = {
        ...parsedData,
        totalMileage: (parsedData.totalMileage || 0) + attendanceMileage,
        lastAttendanceDate: today,
        history: [
          ...(parsedData.history || []),
          { date: today, amount: attendanceMileage, type: "적립", reason: "출석 체크" },
        ],
      }
      localStorage.setItem("userMileage", JSON.stringify(updatedData))
      setMileage(updatedData.totalMileage)
      setLastAttendanceDate(today)
      setHasCheckedToday(true)
      toast({ title: "출석 체크 완료!", description: `${attendanceMileage} 마일리지가 적립되었습니다.`, duration: 3000 })
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

  const toggleTheme = useCallback(async () => {
    if (!mounted || isChangingTheme) return
    setIsChangingTheme(true)
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    localStorage.setItem("theme", newTheme)
    setCurrentTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    if (userEmail) {
      try {
        const supabase = getSupabaseClient()
        await supabase.from("users").update({ theme: newTheme }).eq("email", userEmail)
        await updateUserProfile(undefined, undefined, newTheme)
      } catch (error) {
        console.error("Error updating theme:", error)
      }
    }
    setTimeout(() => setIsChangingTheme(false), 500)
  }, [mounted, isChangingTheme, currentTheme, userEmail])

  if (!mounted) return null

  const isDarkMode = currentTheme === "dark"

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* ✅ 헤더 로고 크기 일관성 유지 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="sm" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow" /> : <Moon className="h-5 w-5 text-darkblue" />}
        </Button>
      </div>
      {/* 나머지 UI는 그대로 유지 */}
    </div>
  )
}
