"use client"

import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"

// 스플래시 스크린 컴포넌트
export function SplashScreen() {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // 페이드인 효과 적용
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1)
    }, 100)

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(fadeInTimeout)
    }
  }, [])

  return (
    // 전체 화면을 차지하는 컨테이너
    <div
      className="fixed inset-0 flex items-center justify-center bg-light dark:bg-dark z-50"
      style={{ transition: "opacity 0.5s ease-in-out", opacity }}
    >
      {/* 로고 중앙 배치 - 부제목 제거 */}
      <div className="text-center">
        <Logo size="lg" showSubtitle={false} />
      </div>
    </div>
  )
}
