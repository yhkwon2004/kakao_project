"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, User, Camera, Mail, Lock, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage, clearUserFromStorage, updateUserProfile, saveImageToStorage } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

export function AccountSettingsScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // 사용자 정보 불러오기
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      setEmail(user.email)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    clearUserFromStorage()
    router.push("/")
  }

  const handleSaveChanges = () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    // 프로필 정보 업데이트
    updateUserProfile(userName, profileImage || undefined)

    toast({
      title: "변경사항 저장 완료",
      description: "프로필 정보가 업데이트되었습니다.",
    })
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
      saveImageToStorage("user-profile", imageUrl)
    }
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

      {/* 프로필 이미지 */}
      <div className="p-4 flex flex-col items-center">
        <div className="relative">
          <Avatar className="h-24 w-24 mb-4 bg-light border-2 border-yellow">
            {profileImage ? (
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
            ) : (
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
            <label
              htmlFor="profile-upload"
              className="absolute bottom-4 right-0 flex items-center justify-center w-8 h-8 bg-yellow text-dark rounded-full cursor-pointer hover:bg-yellow/90"
            >
              <Camera className="h-4 w-4" />
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </label>
          </Avatar>
        </div>
        <label
          htmlFor="profile-upload"
          className="inline-flex items-center justify-center rounded-xl border border-green text-green hover:bg-green/10 px-4 py-2 text-sm font-medium cursor-pointer"
        >
          프로필 이미지 변경
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
          />
        </label>
      </div>

      {/* 계정 설정 폼 */}
      <div className="p-4">
        <Card className="rounded-xl mb-4 border-gray/20 bg-light dark:bg-darkblue/30">
          <CardHeader className="p-4 border-b border-gray/10">
            <h2 className="font-bold text-darkblue dark:text-light">계정 정보</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="text-sm font-medium block mb-1 text-darkblue dark:text-light flex items-center gap-2"
              >
                <User className="h-4 w-4 text-gray" />
                이름
              </label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium block mb-1 text-darkblue dark:text-light flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-gray" />
                이메일
              </label>
              <Input id="email" value={email} disabled className="rounded-xl bg-gray/10 text-gray" />
              <p className="text-xs text-gray mt-1">이메일은 변경할 수 없습니다</p>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium block mb-1 text-darkblue dark:text-light flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-gray" />
                비밀번호 변경
              </label>
              <Input
                id="password"
                type="password"
                placeholder="새 비밀번호"
                className="rounded-xl mb-2 border-gray/20 bg-light dark:bg-darkblue/20"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="비밀번호 확인"
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full rounded-xl bg-yellow hover:bg-yellow/90 text-dark font-medium"
            onClick={handleSaveChanges}
          >
            변경사항 저장
          </Button>
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
    </div>
  )
}
