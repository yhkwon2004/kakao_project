"use client"

import { useEffect, useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { SplashScreen } from "@/components/splash-screen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  useEffect(() => {
    // 첫 방문 여부 확인 로직
    // localStorage를 사용하여 사용자가 이전에 앱을 방문했는지 확인
    // 'hasVisitedBefore' 키가 없으면 첫 방문으로 간주
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")

    if (hasVisitedBefore) {
      // 이전에 방문한 적이 있으면 스플래시 화면을 건너뜀
      setIsFirstVisit(false)
      setShowSplash(false)
    } else {
      // 첫 방문이면 localStorage에 방문 기록을 저장하고 스플래시 화면 표시
      localStorage.setItem("hasVisitedBefore", "true")
      setIsFirstVisit(true)

      // 4초 후에 스플래시 화면 숨기기
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [])

  // 첫 방문이 아니면 바로 로그인 화면 표시
  // 첫 방문이면 스플래시 화면을 먼저 보여주고 4초 후 로그인 화면으로 전환
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {isFirstVisit && showSplash ? <SplashScreen /> : <LoginScreen />}
    </main>
  )
}
