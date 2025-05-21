"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

// 스플래시 스크린 컴포넌트
// 앱 시작 시 로고를 표시하고 4초 후 로그인 화면으로 자동 이동합니다.
// 이 화면은 사용자가 앱을 처음 방문할 때만 표시됩니다.
export function SplashScreen() {
  const router = useRouter()
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // 페이드인 효과 적용
    // 처음 로딩 시 opacity를 0에서 1로 변경하여 페이드인 효과 구현
    const fadeInTimeout = setTimeout(() => {
      setOpacity(1)
    }, 100)

    // 4초 후 페이드아웃 효과 적용
    // 페이드아웃 후 부모 컴포넌트에서 로그인 화면으로 전환됨
    const fadeOutTimeout = setTimeout(() => {
      setOpacity(0)
    }, 3500) // 4초보다 약간 일찍 페이드아웃 시작

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      clearTimeout(fadeInTimeout)
      clearTimeout(fadeOutTimeout)
    }
  }, [router])

  return (
    // 전체 화면을 차지하는 컨테이너
    // 라이트/다크 모드에 따라 배경색 자동 조정
    <div
      className="fixed inset-0 flex items-center justify-center bg-light dark:bg-dark z-50"
      style={{ transition: "opacity 0.5s ease-in-out", opacity }}
    >
      {/* 로고 중앙 배치 */}
      <div className="text-center">
        <Logo size="lg" />
        <p className="mt-4 text-sm text-gray dark:text-gray">웹툰 투자 플랫폼</p>
      </div>
    </div>
  )
}
