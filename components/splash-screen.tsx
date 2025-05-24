"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SplashScreen() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 페이드인 효과
    const fadeTimer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    // 페이지 이동
    const navigationTimer = setTimeout(() => {
      router.push("/home")
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(navigationTimer)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8">
      {/* 메인 컨텐츠 */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* 로고 아이콘 영역 */}
        <div className="mb-8">
          <div className="relative w-40 h-40 mb-6">
            {/* 로고 이미지 컨테이너 */}
            <div className="w-full h-full bg-white rounded-3xl shadow-lg overflow-hidden flex items-center justify-center p-4">
              <div className="relative w-32 h-32">
                <Image
                  src="/kakao-fanance-logo.jpg"
                  alt="The ARTINVSET - Kakao FANance Logo"
                  fill
                  className="object-contain scale-125"
                  style={{
                    filter: "contrast(1.1) brightness(1.05)",
                  }}
                  priority
                />
              </div>
            </div>

            {/* 성장을 나타내는 작은 인디케이터 */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 앱 이름 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Kakao FANance</h1>

        {/* 부제목 */}
        <p className="text-lg text-gray-700 mb-1 font-medium">웹툰 투자의 새로운 경험</p>

        {/* 설명 텍스트 */}
        <p className="text-sm text-gray-500 text-center leading-relaxed">좋아하는 웹툰부터 스마트한 투자까지</p>
      </div>

      {/* 하단 로딩 영역 */}
      <div className="absolute bottom-20">
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          {/* 로딩 인디케이터 */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>

          {/* 버전 정보 */}
          <p className="text-xs text-gray-400 text-center">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
