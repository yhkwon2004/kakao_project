"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { saveUserToStorage, getUserFromStorage, clearUserFromStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function LoginScreen() {
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const router = useRouter()
  const { toast } = useToast()

  // Check if already logged in - 스플래시 로직 완전 제거
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      router.push("/home")
    }
  }, [router])

  // 자동 로그아웃 기능을 위한 useEffect
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      setLastActivity(Date.now())
      clearTimeout(inactivityTimer)

      inactivityTimer = setTimeout(
        () => {
          // 30분(1800000ms) 후 자동 로그아웃
          const user = getUserFromStorage()
          if (user) {
            clearUserFromStorage()
            toast({
              title: "자동 로그아웃",
              description: "30분간 활동이 없어 자동으로 로그아웃되었습니다.",
              duration: 5000,
            })
            router.push("/")
          }
        },
        30 * 60 * 1000,
      ) // 30분
    }

    const handleActivity = () => {
      resetTimer()
    }

    // 사용자 활동 감지 이벤트들
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true)
    })

    // 초기 타이머 설정
    resetTimer()

    return () => {
      clearTimeout(inactivityTimer)
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [router, toast])

  // 스플래시에서 바로 게스트 로그인 처리
  useEffect(() => {
    const autoGuestLogin = async () => {
      try {
        // Reset guest data
        await resetGuestData()

        // Get guest user data
        const { data: guestData, error: guestError } = await supabase
          .from("users")
          .select("*")
          .eq("email", "guest_social@guest.fake")
          .single()

        if (guestError) throw guestError

        // 게스트 계정에 초기 데이터 설정
        const initialInvestments = [
          {
            id: "bad-secretary",
            title: "나쁜 비서",
            amount: 500000,
            date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "완료됨",
            expectedROI: 10,
            progress: 100,
            slug: "bad-secretary",
            thumbnail: "/images/나쁜-비서-cover.png",
          },
          {
            id: "blood-sword-family-hunting-dog",
            title: "철혈검가 사냥개의 회귀",
            amount: 750000,
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "완료됨",
            expectedROI: 16,
            progress: 100,
            slug: "blood-sword-family-hunting-dog",
            thumbnail: "/images/철혈검가-사냥개의-회귀.png",
          },
        ]

        const initialFavorites = [
          {
            id: "moving",
            title: "무빙",
            genre: "액션, 판타지",
            status: "투자 가능",
            notification: true,
            slug: "moving",
            invested: false,
          },
          {
            id: "hospital-playlist",
            title: "슬기로운 의사생활",
            genre: "의료드라마",
            status: "투자 가능",
            notification: true,
            slug: "hospital-playlist",
            invested: false,
          },
        ]

        // 로컬 스토리지에 초기 데이터 저장
        if (typeof window !== "undefined") {
          localStorage.setItem("userInvestments", JSON.stringify(initialInvestments))
          localStorage.setItem("favoriteWebtoons", JSON.stringify(initialFavorites))

          const completedProjects = [
            {
              id: "bad-secretary",
              title: "나쁜 비서",
              genre: "로맨스, 드라마",
              investedAmount: 500000,
              returnAmount: 550000,
              roi: 10,
              completionDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              investors: 342,
              hasFeedback: false,
              thumbnail: "/images/나쁜-비서.jpg",
              slug: "bad-secretary",
              feedback: "",
              adaptationInterest: "",
              investmentDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
            {
              id: "blood-sword-family-hunting-dog",
              title: "철혈검가 사냥개의 회귀",
              genre: "액션, 판타지",
              investedAmount: 750000,
              returnAmount: 870000,
              roi: 16,
              completionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              investors: 256,
              hasFeedback: true,
              thumbnail: "/images/철혈검가-사냥개의-회귀.png",
              slug: "blood-sword-family-hunting-dog",
              feedback:
                "캐릭터의 성장 과정과 액션 장면이 인상적이었습니다. 특히 주인공의 복수 스토리가 드라마틱하게 전개되어 몰입감이 뛰어났습니다.",
              adaptationInterest: "high",
              investmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            },
          ]
          localStorage.setItem("completedProjects", JSON.stringify(completedProjects))

          const initialMileage = {
            totalMileage: 0,
            history: [],
            lastAttendanceDate: null,
          }
          localStorage.setItem("userMileage", JSON.stringify(initialMileage))
        }

        // Save guest user to storage
        saveUserToStorage({
          email: guestData.email,
          name: "홍길동",
          balance: guestData.balance,
        })

        router.push("/home")
      } catch (error) {
        console.error("Auto guest login error:", error)
      }
    }

    // 스플래시에서 온 경우 자동 게스트 로그인
    const fromSplash = sessionStorage.getItem("fromSplash")
    if (fromSplash) {
      sessionStorage.removeItem("fromSplash")
      autoGuestLogin()
    }
  }, [router])

  const resetGuestData = async () => {
    try {
      // Get guest user ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", "guest_social@guest.fake")
        .single()

      if (userError) throw userError

      const userId = userData.id

      // Delete all guest data
      await supabase.from("favorites").delete().eq("user_id", userId)
      await supabase.from("investments").delete().eq("user_id", userId)
      await supabase.from("charts").delete().eq("user_id", userId)
      await supabase.from("user_preferences").delete().eq("user_id", userId)

      // Reset guest balance and theme
      await supabase.from("users").update({ balance: 150000, theme: "light" }).eq("id", userId)

      return true
    } catch (error) {
      console.error("Error resetting guest data:", error)
      return false
    }
  }

  // handleSignup 함수 수정 - 신규 계정의 초기 잔액을 65만원으로 설정
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase.from("users").select("email").eq("email", email).single()

      if (existingUser) {
        toast({
          title: "회원가입 실패",
          description: "이미 사용 중인 이메일입니다.",
          variant: "destructive",
        })
        return
      }

      // Create new user with 650,000 initial balance
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email,
            name,
            role: "user",
            balance: 650000, // 65만원으로 초기 잔액 설정
            theme: "light",
          },
        ])
        .select()

      if (createError) throw createError

      // Save user to storage and auto-login
      saveUserToStorage({
        email,
        name,
        balance: 650000, // 로컬 스토리지에도 65만원으로 저장
      })

      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다.",
        duration: 300, // 0.3초 후 사라짐
      })

      router.push("/home")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "회원가입 실패",
        description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // handleLogin 함수 수정 - 일반 계정 로그인 시 종료된 프로젝트 데이터 제거
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if this is a guest login
      if (email === "guest_social@guest.fake" && password === "SecureDummy123!") {
        // Reset guest data
        await resetGuestData()

        // Get guest user data
        const { data: guestData, error: guestError } = await supabase
          .from("users")
          .select("*")
          .eq("email", "guest_social@guest.fake")
          .single()

        if (guestError) throw guestError

        // Save guest user to storage with name "홍길동"
        saveUserToStorage({
          email: guestData.email,
          name: "홍길동",
          balance: guestData.balance,
        })

        toast({
          title: "Guest account initialized",
        })

        router.push("/home")
        return
      }

      // Regular login
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

      if (userError) {
        toast({
          title: "로그인 실패",
          description: "이메일 또는 비밀번호가 올바르지 않습니다.",
          variant: "destructive",
        })
        return
      }

      // 일반 계정 로그인 시 종료된 프로젝트 데이터 제거
      if (email !== "guest_social@guest.fake") {
        localStorage.removeItem("completedProjects")

        // 투자 데이터에서도 종료된 프로젝트 관련 데이터 제거
        const existingInvestments = JSON.parse(localStorage.getItem("userInvestments") || "[]")
        const defaultCompletedProjectIds = ["bad-secretary", "blood-sword-family-hunting-dog"]
        const filteredInvestments = existingInvestments.filter((inv) => !defaultCompletedProjectIds.includes(inv.id))

        localStorage.setItem("userInvestments", JSON.stringify(filteredInvestments))
      }

      // Save user to storage
      saveUserToStorage({
        email: userData.email,
        name: userData.name,
        balance: userData.balance,
      })

      toast({
        title: "로그인 성공",
        description: "환영합니다!",
        duration: 300, // 0.3초 후 사라짐
      })

      router.push("/home")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "로그인 실패",
        description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  // handleSocialLogin 함수 수정 - 소셜 로그인도 게스트 계정으로 처리
  const handleSocialLogin = async (platform: string) => {
    try {
      // Reset guest data
      await resetGuestData()

      // Get guest user data
      const { data: guestData, error: guestError } = await supabase
        .from("users")
        .select("*")
        .eq("email", "guest_social@guest.fake")
        .single()

      if (guestError) throw guestError

      // 게스트 계정에 초기 데이터 설정
      const initialInvestments = [
        {
          id: "bad-secretary",
          title: "나쁜 비서",
          amount: 500000,
          date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "완료됨",
          expectedROI: 10,
          progress: 100,
          slug: "bad-secretary",
          thumbnail: "/images/나쁜-비서-cover.png",
        },
        {
          id: "blood-sword-family-hunting-dog",
          title: "철혈검가 사냥개의 회귀",
          amount: 750000,
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "완료됨",
          expectedROI: 16,
          progress: 100,
          slug: "blood-sword-family-hunting-dog",
          thumbnail: "/images/철혈검가-사냥개의-회귀.png",
        },
      ]

      const initialFavorites = [
        {
          id: "moving",
          title: "무빙",
          genre: "액션, 판타지",
          status: "투자 가능",
          notification: true,
          slug: "moving",
          invested: false,
        },
        {
          id: "hospital-playlist",
          title: "슬기로운 의사생활",
          genre: "의료드라마",
          status: "투자 가능",
          notification: true,
          slug: "hospital-playlist",
          invested: false,
        },
      ]

      // 로컬 스토리지에 초기 데이터 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("userInvestments", JSON.stringify(initialInvestments))
        localStorage.setItem("favoriteWebtoons", JSON.stringify(initialFavorites))

        // 완료된 프로젝트 데이터도 추가
        const completedProjects = [
          {
            id: "bad-secretary",
            title: "나쁜 비서",
            genre: "로맨스, 드라마",
            investedAmount: 500000,
            returnAmount: 550000, // 10% 수익
            roi: 10,
            completionDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            investors: 342,
            hasFeedback: false,
            thumbnail: "/images/나쁜-비서.jpg",
            slug: "bad-secretary",
            feedback: "",
            adaptationInterest: "",
            investmentDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
          {
            id: "blood-sword-family-hunting-dog",
            title: "철혈검가 사냥개의 회귀",
            genre: "액션, 판타지",
            investedAmount: 750000,
            returnAmount: 870000, // 16% 수익
            roi: 16,
            completionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            investors: 256,
            hasFeedback: true,
            thumbnail: "/images/철혈검가-사냥개의-회귀.png",
            slug: "blood-sword-family-hunting-dog",
            feedback:
              "캐릭터의 성장 과정과 액션 장면이 인상적이었습니다. 특히 주인공의 복수 스토리가 드라마틱하게 전개되어 몰입감이 뛰어났습니다.",
            adaptationInterest: "high",
            investmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          },
        ]
        localStorage.setItem("completedProjects", JSON.stringify(completedProjects))

        // 마일리지 초기 데이터 (0P)
        const initialMileage = {
          totalMileage: 0,
          history: [],
          lastAttendanceDate: null,
        }
        localStorage.setItem("userMileage", JSON.stringify(initialMileage))
      }

      // Save guest user to storage
      saveUserToStorage({
        email: guestData.email,
        name: "홍길동",
        balance: guestData.balance,
      })

      toast({
        title: `${platform} 로그인 성공`,
        description: "환영합니다!",
        duration: 300,
      })

      router.push("/home")
    } catch (error) {
      console.error("Social login error:", error)
      toast({
        title: "로그인 실패",
        description: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-darkblue dark:via-darkblue/90 dark:to-darkblue/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* 로고 섹션 */}
        <div className="flex flex-col items-center mb-10">
          <Logo size="lg" showSubtitle={false} />
        </div>

        {/* 메인 카드 */}
        <Card className="w-full rounded-3xl shadow-xl border-0 bg-white/80 dark:bg-darkblue/40 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-darkblue dark:text-light">환영합니다</h1>
              <span className="text-xs bg-yellow text-dark px-3 py-1 rounded-full font-medium">베타</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Login/Signup tabs */}
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 dark:bg-darkblue/30 p-1 rounded-2xl h-12">
                <TabsTrigger
                  value="login"
                  className={`rounded-xl transition-all font-medium ${
                    activeTab === "login"
                      ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                      : "text-gray-500 hover:text-darkblue dark:hover:text-light"
                  }`}
                >
                  로그인
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className={`rounded-xl transition-all font-medium ${
                    activeTab === "signup"
                      ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                      : "text-gray-500 hover:text-darkblue dark:hover:text-light"
                  }`}
                >
                  회원가입
                </TabsTrigger>
              </TabsList>

              {/* Login form */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="rounded-2xl h-14 border-gray-200 dark:border-gray-600 bg-white dark:bg-darkblue/20 text-base px-4 focus:ring-2 focus:ring-yellow focus:border-transparent"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        className="rounded-2xl h-14 border-gray-200 dark:border-gray-600 bg-white dark:bg-darkblue/20 text-base px-4 pr-12 focus:ring-2 focus:ring-yellow focus:border-transparent"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-green to-green/80 hover:from-green/90 hover:to-green/70 text-white font-medium text-base shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    로그인
                  </Button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4 px-4">
                  베타 버전에서는 어떤 이메일/비밀번호 조합으로도 로그인이 가능합니다.
                </p>
              </TabsContent>

              {/* Signup form */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="이름을 입력하세요"
                      className="rounded-2xl h-14 border-gray-200 dark:border-gray-600 bg-white dark:bg-darkblue/20 text-base px-4 focus:ring-2 focus:ring-yellow focus:border-transparent"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="이메일을 입력하세요"
                      className="rounded-2xl h-14 border-gray-200 dark:border-gray-600 bg-white dark:bg-darkblue/20 text-base px-4 focus:ring-2 focus:ring-yellow focus:border-transparent"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        className="rounded-2xl h-14 border-gray-200 dark:border-gray-600 bg-white dark:bg-darkblue/20 text-base px-4 pr-12 focus:ring-2 focus:ring-yellow focus:border-transparent"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-green to-green/80 hover:from-green/90 hover:to-green/70 text-white font-medium text-base shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    회원가입
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* 구분선 */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-darkblue/40 px-4 text-gray-500 dark:text-gray-400">
                  또는 소셜 계정으로 계속하기
                </span>
              </div>
            </div>

            {/* 소셜 로그인 버튼들 - 원형 가로 배치, 텍스트 제거 */}
            <div className="flex justify-center items-center space-x-6">
              {/* 카카오 로그인 */}
              <button
                onClick={() => handleSocialLogin("카카오")}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#FEE500" }}
                aria-label="카카오로 로그인"
              >
                <span className="text-black font-bold text-xl">K</span>
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={() => handleSocialLogin("네이버")}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#03C75A" }}
                aria-label="네이버로 로그인"
              >
                <span className="text-white font-bold text-xl">N</span>
              </button>

              {/* 구글 로그인 */}
              <button
                onClick={() => handleSocialLogin("구글")}
                className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="구글로 로그인"
              >
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 하단 정보 */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-gray-500">
            계속 진행하면 <span className="text-blue-600 hover:underline cursor-pointer">이용약관</span> 및{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">개인정보처리방침</span>에 동의하는 것으로
            간주됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
