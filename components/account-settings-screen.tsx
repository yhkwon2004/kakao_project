"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, User, Lock, Moon, Sun, LogOut, HelpCircle, FileText, Shield, Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { getTheme, setTheme } from "@/lib/theme"
import Link from "next/link"

export function AccountSettingsScreen() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<any>({})

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordErrors, setPasswordErrors] = useState<any>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    const userData = getUserFromStorage()
    if (userData) {
      setUser(userData)
      setEditedUser({ ...userData })
    }

    // Initialize theme
    const currentTheme = getTheme()
    setIsDarkMode(currentTheme === "dark")
  }, [])

  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    setTheme(newTheme)
    setIsDarkMode(!isDarkMode)
    toast({
      title: "테마 변경됨",
      description: `${newTheme === "dark" ? "다크" : "라이트"} 모드로 변경되었습니다.`,
    })
  }

  const handleSaveProfile = () => {
    if (editedUser.name && editedUser.phone) {
      localStorage.setItem("currentUser", JSON.stringify(editedUser))
      setUser(editedUser)
      setIsEditing(false)
      toast({
        title: "프로필 수정 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      })
    }
  }

  const validatePassword = () => {
    const errors: any = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = "현재 비밀번호를 입력해주세요"
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "새 비밀번호를 입력해주세요"
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "비밀번호는 8자 이상이어야 합니다"
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = () => {
    if (validatePassword()) {
      // In a real app, this would make an API call
      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setPasswordErrors({})
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("userInvestments")
    localStorage.removeItem("userMileage")
    toast({
      title: "로그아웃 완료",
      description: "성공적으로 로그아웃되었습니다.",
    })
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] dark:bg-[#323233]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F9DF52] mx-auto mb-4"></div>
          <p className="text-[#989898]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#323233] overflow-y-auto">
      {/* Header */}
      <div className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-b border-[#BCBCBC] dark:border-[#454858] sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-3 hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
            >
              <ChevronLeft className="h-5 w-5 text-[#323233] dark:text-[#F5D949]" />
            </Button>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">계정 설정</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 pb-24 space-y-6 max-w-2xl mx-auto">
        {/* Profile Section */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949]">
              <User className="h-5 w-5 text-[#5F859F]" />
              프로필 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name" className="text-[#3F4458] dark:text-[#F5C882]">
                  이름
                </Label>
                <Input
                  id="name"
                  value={isEditing ? editedUser.name : user.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] disabled:opacity-60"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#3F4458] dark:text-[#F5C882]">
                  이메일
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-[#E5E4DC] dark:bg-[#454858] border-[#BCBCBC] dark:border-[#454858] text-[#989898] cursor-not-allowed"
                />
                <p className="text-xs text-[#989898] mt-1">이메일은 변경할 수 없습니다</p>
              </div>

              <div>
                <Label htmlFor="phone" className="text-[#3F4458] dark:text-[#F5C882]">
                  전화번호
                </Label>
                <Input
                  id="phone"
                  value={isEditing ? editedUser.phone : user.phone}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                  disabled={!isEditing}
                  className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-semibold"
                >
                  수정하기
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-[#4F8F78] hover:bg-[#848954] text-white font-semibold"
                  >
                    저장
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedUser({ ...user })
                    }}
                    variant="outline"
                    className="border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
                  >
                    취소
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949]">
              <Lock className="h-5 w-5 text-[#5F859F]" />
              비밀번호 변경
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-[#3F4458] dark:text-[#F5C882]">
                현재 비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-[#989898]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#989898]" />
                  )}
                </Button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-[#D16561] mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-[#3F4458] dark:text-[#F5C882]">
                새 비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-[#989898]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#989898]" />
                  )}
                </Button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-[#D16561] mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-[#3F4458] dark:text-[#F5C882]">
                새 비밀번호 확인
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-[#989898]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#989898]" />
                  )}
                </Button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-[#D16561] mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              onClick={handlePasswordChange}
              className="w-full bg-[#5F859F] hover:bg-[#58678C] text-white font-semibold"
            >
              비밀번호 변경
            </Button>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#323233] dark:text-[#F5D949]">앱 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="h-5 w-5 text-[#5F859F]" /> : <Sun className="h-5 w-5 text-[#F9DF52]" />}
                <div>
                  <p className="font-medium text-[#323233] dark:text-[#F5D949]">다크 모드</p>
                  <p className="text-sm text-[#989898]">어두운 테마로 변경</p>
                </div>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
                className="data-[state=checked]:bg-[#F9DF52] data-[state=unchecked]:bg-[#BCBCBC]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-[#D16561] dark:border-[#DD8369] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full bg-[#D16561] hover:bg-[#DD8369] text-white font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Link href="/support">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
                >
                  <HelpCircle className="h-4 w-4 mr-3 text-[#5F859F]" />
                  고객 지원
                </Button>
              </Link>

              <Separator className="bg-[#BCBCBC] dark:bg-[#454858]" />

              <Link href="/terms">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
                >
                  <FileText className="h-4 w-4 mr-3 text-[#5F859F]" />
                  이용약관
                </Button>
              </Link>

              <Link href="/privacy">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
                >
                  <Shield className="h-4 w-4 mr-3 text-[#5F859F]" />
                  개인정보처리방침
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
