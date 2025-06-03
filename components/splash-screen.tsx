"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const router = useRouter()

  const handleTouch = () => {
    setFadeOut(true)

    // 스플래시에서 온 것을 표시하는 플래그 설정
    if (typeof window !== "undefined") {
      sessionStorage.setItem("fromSplash", "true")
    }

    setTimeout(() => {
      setIsVisible(false)
      router.push("/login")
    }, 500)
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-green-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      onClick={handleTouch}
      onTouchStart={handleTouch}
    >
      <div className="flex flex-col items-center space-y-8 animate-fade-in-up">
        <div className="relative">
          <Image
            src="/images/main-logo-new.png"
            alt="WX WEEK"
            width={400}
            height={300}
            className="w-96 h-72 sm:w-[28rem] sm:h-84 lg:w-[32rem] lg:h-96 object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="flex space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>

        {/* 터치 안내 문구 수정 */}
        <div className="mt-6 text-center">
          <p className="text-black text-sm font-light tracking-wider animate-pulse drop-shadow-md">
            터치하여 시작하세요
          </p>
          <p className="text-black text-xs font-light opacity-70 mt-1">게스트 계정으로 자동 로그인됩니다</p>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-black text-sm font-medium opacity-70">v1.11.8</p>
        </div>
      </div>
    </div>
  )
}
