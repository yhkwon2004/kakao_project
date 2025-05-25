"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showSubtitle?: boolean
}

export function Logo({ className, size = "sm", showSubtitle = false }: LogoProps) {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/home")
  }

  // 로고 고정 이미지
  const logoSrc = "/images/logo_bar.png"

  // 로고 크기 고정 (size와 관계없이 동일)
  const width = 140
  const height = 40

  return (
    <div
      className={cn("flex items-center cursor-pointer", className)}
      onClick={handleLogoClick}
      style={{ minWidth: `${width}px` }}
    >
      <Image
        src={logoSrc}
        alt="Kakao FANance 로고"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showSubtitle && <span className="ml-2 text-xs text-gray">웹툰 투자 플랫폼</span>}
    </div>
  )
}
