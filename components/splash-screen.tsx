"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SplashScreen() {
  const router = useRouter()
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [screenOpacity, setScreenOpacity] = useState(1)

  useEffect(() => {
// 0.5초 후 로고 페이드인
const fadeInTimer = setTimeout(() => {
  setLogoOpacity(1)
}, 500)

// 5초 후 로고 페이드아웃 시작
const fadeOutTimer = setTimeout(() => {
  setLogoOpacity(0)
}, 5000)

// 5.8초 후 전체 화면 페이드아웃
const screenFadeOutTimer = setTimeout(() => {
  setScreenOpacity(0)
}, 5800)

// 6초 후 로그인 페이지로 이동
const navigationTimer = setTimeout(() => {
  router.push("/login")
}, 6000)


    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(screenFadeOutTimer)
      clearTimeout(navigationTimer)
    }
  }, [router])

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 transition-opacity duration-1000 ease-in-out"
      style={{ opacity: screenOpacity }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="mb-8">
          <div className="relative w-60 h-60 mb-6">
            <div
              className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden flex items-center justify-center p-6 transition-all duration-1000 ease-in-out"
              style={{
                opacity: logoOpacity,
                transform: `scale(${logoOpacity * 0.1 + 0.9})`,
              }}
            >
              <div className="relative w-48 h-48">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250523_161505275_03.jpg-AdX1SWFiQwrIJf2sHFFRkFTZTZYPCQ.jpeg"
                  alt="The ARTINVSET - Kakao FANance Logo"
                  fill
                  className="object-contain scale-110"
                  style={{
                    filter: "contrast(1.1) brightness(1.05)",
                  }}
                  priority
                />
              </div>
            </div>

            <div
              className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-1000 ease-in-out"
              style={{
                opacity: logoOpacity,
                transform: `scale(${logoOpacity * 0.2 + 0.8})`,
              }}
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          className="transition-all duration-1000 ease-in-out text-center"
          style={{
            opacity: logoOpacity,
            transform: `translateY(${(1 - logoOpacity) * 20}px)`,
          }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Kakao FANance</h1>
          <p className="text-xl text-gray-700 mb-2 font-medium">웹툰 투자의 새로운 경험</p>
          <p className="text-base text-gray-500 text-center leading-relaxed">좋아하는 웹툰부터 스마트한 투자까지</p>
        </div>
      </div>

      <div className="absolute bottom-20">
        <div
          className="transition-all duration-1000 ease-in-out"
          style={{
            opacity: logoOpacity,
            transform: `translateY(${(1 - logoOpacity) * 10}px)`,
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
          <p className="text-sm text-gray-400 text-center">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
