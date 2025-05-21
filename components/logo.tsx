"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getImageFromStorage } from "@/lib/auth"

/**
 * 로고 컴포넌트
 *
 * @param className - 추가 스타일 클래스
 * @param size - 로고 크기 (sm, md, lg)
 * @param showSubtitle - 부제목 표시 여부
 *
 * 이 컴포넌트는 앱 전체에서 일관된 로고 표시를 위해 사용됩니다.
 * 향후 이미지 로고로 교체할 경우를 대비하여 구조화되었습니다.
 */
interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showSubtitle?: boolean
}

export function Logo({ className, size = "md", showSubtitle = false }: LogoProps) {
  const router = useRouter()
  const [logoImage, setLogoImage] = useState<string | null>(null)

  // 저장된 로고 이미지가 있으면 로드
  useEffect(() => {
    const storedLogo = getImageFromStorage("app-logo")
    if (storedLogo) {
      setLogoImage(storedLogo)
    }
  }, [])

  // 크기별 클래스 정의
  // 향후 이미지 로고로 교체 시 일관된 크기를 유지하기 위한 설정
  const sizeClasses = {
    sm: "h-8", // 32px 높이
    md: "h-10", // 40px 높이
    lg: "h-16", // 64px 높이
  }

  // 텍스트 크기 클래스
  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  }

  const handleLogoClick = () => {
    router.push("/home")
  }

  return (
    <div
      className={cn("flex items-center cursor-pointer", className)}
      onClick={handleLogoClick}
      // 로고 위치 일관성을 위한 고정 마진 적용
      style={{ marginLeft: "0px", marginRight: "0px" }}
    >
      <div className="relative">
        {logoImage ? (
          // 이미지 로고가 있는 경우
          // 향후 이미지 로고로 교체 시 이 부분이 활성화됨
          <div className={cn("relative w-auto", sizeClasses[size])}>
            <Image
              src={logoImage || "/placeholder.svg"}
              alt="Kakao FANance Logo"
              width={sizeClasses[size] === "h-8" ? 96 : sizeClasses[size] === "h-10" ? 120 : 192}
              height={sizeClasses[size] === "h-8" ? 32 : sizeClasses[size] === "h-10" ? 40 : 64}
              className="object-contain"
            />
          </div>
        ) : (
          // 텍스트 로고 (기본)
          <div className="font-bold flex items-center">
            <span className={cn(textSizeClasses[size], "tracking-tight text-yellow")}>Kakao</span>
            <span className={cn(textSizeClasses[size], "tracking-tight text-darkblue dark:text-light")}>FANance</span>
            <div className="absolute -top-1 -right-2 w-2 h-2 bg-yellow rounded-full"></div>
          </div>
        )}
      </div>

      {/* 부제목 (선택적) */}
      {showSubtitle && <span className="ml-2 text-xs text-gray">웹툰 투자 플랫폼</span>}
    </div>
  )
}
