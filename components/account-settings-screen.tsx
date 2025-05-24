"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, User, Camera, Mail, Lock, LogOut, AlertCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import {
  getUserFromStorage,
  clearUserFromStorage,
  updateUserProfile,
  saveImageToStorage,
  changeUserPassword,
  isGuestAccount,
} from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export function AccountSettingsScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [userName, setUserName] = useState("")
  const [email, setEmail] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isGuest, setIsGuest] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // 사용자 정보 불러오기
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      setEmail(user.email)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
      setIsGuest(isGuestAccount(user.email))
    } else {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    clearUserFromStorage()
    router.push("/")
  }

  const handleSaveChanges = () => {
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

  const handlePasswordChangeClick = () => {
    if (isGuest) {
      toast({
        title: "비밀번호 변경 불가",
        description: "게스트 계정은 비밀번호를 변경할 수 없습니다.",
        variant: "destructive",
      })
      return
    }
    setShowPasswordDialog(true)
  }

  const handlePasswordChange = async () => {
    setPasswordError("")

    if (!currentPassword) {
      setPasswordError("현재 비밀번호를 입력해주세요.")
      return
    }

    if (!newPassword) {
      setPasswordError("새 비밀번호를 입력해주세요.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    setIsChangingPassword(true)

    try {
      const success = await changeUserPassword(currentPassword, newPassword)

      if (success) {
        toast({
          title: "비밀번호 변경 완료",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        })
        setShowPasswordDialog(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordError("현재 비밀번호가 일치하지 않습니다.")
      }
    } catch (error) {
      setPasswordError("비밀번호 변경 중 오류가 발생했습니다.")
      console.error("Password change error:", error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)

    try {
      // 모든 사용자 데이터 삭제
      clearUserFromStorage()
      localStorage.removeItem("investments")
      localStorage.removeItem("user-profile")
      localStorage.removeItem("favorites")
      localStorage.removeItem("mileage")
      localStorage.removeItem("community-posts")

      toast({
        title: "계정 삭제 완료",
        description: "계정이 성공적으로 삭제되었습니다.",
      })

      // 로그인 페이지로 리다이렉트
      router.push("/")
    } catch (error) {
      toast({
        title: "계정 삭제 실패",
        description: "계정 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      console.error("Account deletion error:", error)
    } finally {
      setIsDeletingAccount(false)
      setShowDeleteDialog(false)
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
              {isGuest ? (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gray/10 text-gray">
                  <AlertCircle className="h-4 w-4 text-gray" />
                  <p className="text-sm">게스트 계정은 비밀번호를 변경할 수 없습니다</p>
                </div>
              ) : (
                <Button
                  onClick={handlePasswordChangeClick}
                  className="w-full rounded-xl border-green text-green hover:bg-green/10"
                  variant="outline"
                >
                  비밀번호 변경하기
                </Button>
              )}
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
          {!isGuest && (
            <Button
              variant="outline"
              className="w-full rounded-xl border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => setShowDeleteDialog(true)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              계정 삭제
            </Button>
          )}
          {isGuest && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray/10 text-gray">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">게스트 계정은 삭제할 수 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md rounded-xl bg-light dark:bg-darkblue/90">
          <DialogHeader>
            <DialogTitle className="text-darkblue dark:text-light">비밀번호 변경</DialogTitle>
            <DialogDescription className="text-gray">
              비밀번호를 변경하려면 현재 비밀번호를 입력한 후 새 비밀번호를 설정하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium text-darkblue dark:text-light">
                현재 비밀번호
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-darkblue dark:text-light">
                새 비밀번호
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-darkblue dark:text-light">
                비밀번호 확인
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {passwordError}
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl border-gray/20 text-gray">
                취소
              </Button>
            </DialogClose>
            <Button
              onClick={handlePasswordChange}
              className="rounded-xl bg-yellow hover:bg-yellow/90 text-dark font-medium"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 계정 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md rounded-xl bg-light dark:bg-darkblue/90">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              계정 삭제
            </DialogTitle>
            <DialogDescription className="text-gray">
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 투자 내역과 데이터가 영구적으로
              삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">삭제될 데이터:</h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• 모든 투자 내역</li>
                <li>• 프로필 정보</li>
                <li>• 즐겨찾기 목록</li>
                <li>• 마일리지 포인트</li>
                <li>• 커뮤니티 활동 기록</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl border-gray/20 text-gray">
                취소
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteAccount}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "삭제 중..." : "계정 삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
