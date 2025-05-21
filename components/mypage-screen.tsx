"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronRight, CreditCard, BarChart3, Settings, Star, Package, LogOut, User, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Logo } from "@/components/logo"
import { getUserFromStorage, clearUserFromStorage } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function MyPageScreen() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [points, setPoints] = useState(150000)

  // Load user info
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      setUserEmail(user.email)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }

      // Fetch user data from Supabase
      const fetchUserData = async () => {
        if (user.email) {
          const { data, error } = await supabase.from("users").select("balance, theme").eq("email", user.email).single()

          if (!error && data) {
            setPoints(Number(data.balance) || 150000)

            // Apply saved theme
            if (data.theme && data.theme !== theme) {
              setTheme(data.theme)
            }
          }
        }
      }

      fetchUserData()
    } else {
      router.push("/")
    }
  }, [router, setTheme, theme])

  const menuItems = [
    {
      id: "payment",
      label: "결제 및 포인트 관리",
      icon: CreditCard,
      href: "/mypage/payment",
      description: "결제수단 추가/삭제, 충전 내역 및 사용 내역 조회, 보유 포인트 표시",
    },
    {
      id: "investment",
      label: "투자 내역 및 차트 조회",
      icon: BarChart3,
      href: "/mypage/investment",
      description: "내가 투자한 웹툰 목록, 실시간 수익률 차트 확인, 회수 예정일 안내",
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

  const toggleTheme = async () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setTheme(newTheme)

    // Save theme preference to database
    if (userEmail) {
      await supabase.from("users").update({ theme: newTheme }).eq("email", userEmail)
    }
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header - 로고 일관성을 위해 수정 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="h-5 w-5 text-yellow" /> : <Moon className="h-5 w-5 text-darkblue" />}
        </Button>
      </div>

      {/* Profile section */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-6 bg-gradient-to-r from-green/10 to-yellow/10">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-light relative">
                {profileImage ? (
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
                ) : (
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                variant="ghost"
                className="flex items-center justify-between w-full p-0 h-auto hover:bg-green/5 dark:hover:bg-green/10 rounded-lg transition-colors"
                onClick={() => router.push("/mypage/settings")}
              >
                <div className="text-left">
                  <h2 className="text-xl font-bold text-darkblue dark:text-light">{userName}</h2>
                  <p className="text-gray">투자자</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray">사용 가능 포인트</p>
                <p className="text-2xl font-bold text-green">₩{points.toLocaleString()}</p>
              </div>
              <Button className="rounded-xl bg-green hover:bg-green/90 text-light">포인트 충전</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme setting */}
      <div className="p-4">
        <Card className="rounded-xl mb-4 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="h-5 w-5 text-yellow" /> : <Sun className="h-5 w-5 text-yellow" />}
                <div>
                  <span className="font-medium text-darkblue dark:text-light">🎨 테마 설정</span>
                  <p className="text-xs text-gray mt-1">현재 테마: {isDarkMode ? "다크 모드" : "라이트 모드"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl border-green text-green hover:bg-green/10"
                onClick={toggleTheme}
              >
                {isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu section */}
      <div className="p-4">
        <Card className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray/10">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className="flex items-center justify-between w-full p-4 text-left hover:bg-light dark:hover:bg-darkblue/50"
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray" />
                      <div>
                        <span className="font-medium text-darkblue dark:text-light">{item.label}</span>
                        <p className="text-xs text-gray mt-1">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray flex-shrink-0" />
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
          className="w-full rounded-xl border-green text-green hover:bg-green/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
