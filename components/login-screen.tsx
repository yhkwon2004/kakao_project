"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { saveUserToStorage, getUserFromStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { SplashScreen } from "@/components/splash-screen"

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
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if already logged in
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      router.push("/home")
    }

    // 스플래시 화면을 표시하고 일정 시간 후에 로그인 화면으로 전환
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000) // 2초 후에 스플래시 화면 숨김

    return () => clearTimeout(timer)
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

        // Save guest user to storage
        saveUserToStorage({
          email: guestData.email,
          name: guestData.name,
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

      // Save user to storage
      saveUserToStorage({
        email: userData.email,
        name: userData.name,
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

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            email,
            name,
            role: "user",
            balance: 150000,
            theme: "light",
          },
        ])
        .select()

      if (createError) throw createError

      // Save user to storage and auto-login
      saveUserToStorage({
        email,
        name,
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

      // Save guest user to storage
      saveUserToStorage({
        email: guestData.email,
        name: guestData.name,
      })

      toast({
        title: `${platform} 로그인 성공`,
        description: "환영합니다!",
        duration: 300, // 0.3초 후 사라짐
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

  // 스플래시 화면이 표시되는 동안에는 스플래시 컴포넌트만 렌더링
  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          {/* 로고에서 부제목 제거 */}
          <Logo size="lg" showSubtitle={false} />
        </div>

        <Card className="w-full rounded-2xl shadow-md border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader>
            <div className="flex justify-end">
              <span className="text-xs bg-yellow text-dark px-2 py-1 rounded-full">베타 버전</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Login/Signup tabs */}
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-light dark:bg-darkblue/20 p-1 rounded-full">
                <TabsTrigger
                  value="login"
                  className={`rounded-full transition-all ${
                    activeTab === "login"
                      ? "bg-yellow text-dark font-medium"
                      : "text-gray hover:text-darkblue dark:hover:text-light"
                  }`}
                >
                  로그인
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className={`rounded-full transition-all ${
                    activeTab === "signup"
                      ? "bg-yellow text-dark font-medium"
                      : "text-gray hover:text-darkblue dark:hover:text-light"
                  }`}
                >
                  회원가입
                </TabsTrigger>
              </TabsList>

              {/* Login form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="이메일"
                      className="rounded-xl h-12 border-gray/20 bg-light dark:bg-darkblue/20"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        className="rounded-xl h-12 border-gray/20 bg-light dark:bg-darkblue/20 pr-10"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-green hover:bg-green/90 text-light">
                    로그인
                  </Button>
                </form>

                <p className="text-xs text-gray text-center mt-4">
                  * 베타 버전에서는 어떤 이메일/비밀번호 조합으로도 로그인이 가능합니다.
                </p>
              </TabsContent>

              {/* Signup form */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="이름"
                      className="rounded-xl h-12 border-gray/20 bg-light dark:bg-darkblue/20"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="이메일"
                      className="rounded-xl h-12 border-gray/20 bg-light dark:bg-darkblue/20"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호"
                        className="rounded-xl h-12 border-gray/20 bg-light dark:bg-darkblue/20 pr-10"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-green hover:bg-green/90 text-light">
                    회원가입
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social login section - 텍스트 제거 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray/20"></span>
                </div>
                {/* 소셜 계정으로 계속하기 텍스트 제거 */}
              </div>

              <div className="mt-6 space-y-3">
                {/* 카카오 로그인 버튼 */}
                <Button
                  onClick={() => handleSocialLogin("카카오")}
                  className="w-full h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#FEE500", color: "#000000" }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                      <span className="text-black font-bold text-sm">K</span>
                    </div>
                    <span className="text-black">카카오로 계속하기</span>
                  </div>
                </Button>

                {/* 네이버 로그인 버튼 */}
                <Button
                  onClick={() => handleSocialLogin("네이버")}
                  className="w-full h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#03C75A", color: "#FFFFFF" }}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-sm">N</span>
                    </div>
                    <span className="text-white">네이버로 계속하기</span>
                  </div>
                </Button>

                {/* 구글 로그인 버튼 */}
                <Button
                  onClick={() => handleSocialLogin("구글")}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-gray/20 bg-white text-darkblue hover:bg-gray-50 flex items-center justify-center"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
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
                    </div>
                    <span>구글로 계속하기</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
