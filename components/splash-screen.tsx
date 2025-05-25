"use client"

import React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SplashScreen() {
  const router = useRouter()
  const [logoVisible, setLogoVisible] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  // 컴포넌트 마운트 후 로고 표시 (useEffect 대신 직접 호출)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLogoVisible(true)
    }, 500)

    // 컴포넌트 언마운트 시 타이머 정리 (네비게이션 타이머는 없음)
    return () => clearTimeout(timer)
  }, [])

  const handleNavigation = useCallback(() => {
    if (hasNavigated) return

    setHasNavigated(true)
    setFadeOut(true)

    // 페이드아웃 애니메이션 후 페이지 이동
    setTimeout(() => {
      router.push("/login")
    }, 800) // 0.8초 후 이동
  }, [hasNavigated, router])

  const handleInteraction = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleNavigation()
    },
    [handleNavigation],
  )

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col cursor-pointer select-none overflow-hidden transition-opacity duration-800 ease-out"
      onTouchEnd={handleInteraction}
      onClick={handleInteraction}
      style={{
        touchAction: "manipulation",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* 로고 영역 */}
          <div className="mb-6 sm:mb-8">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mb-6 sm:mb-8">
              <div
                className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000 ease-in-out border border-gray-100"
                style={{
                  opacity: logoVisible ? 1 : 0,
                  transform: `scale(${logoVisible ? 1 : 0.9})`,
                  boxShadow: logoVisible ? "0 25px 50px -12px rgba(0, 0, 0, 0.15)" : "none",
                }}
              >
                <div className="relative w-full h-full max-w-56 max-h-56 sm:max-w-64 sm:max-h-64 lg:max-w-72 lg:max-h-72">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KakaoTalk_20250523_161505275_03.jpg-AdX1SWFiQwrIJf2sHFFRkFTZTZYPCQ.jpeg"
                    alt="Kakao FANance Logo"
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
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-xl transition-all duration-1000 ease-in-out"
                style={{
                  opacity: logoVisible ? 1 : 0,
                  transform: `scale(${logoVisible ? 1 : 0.8})`,
                }}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 브랜드 로고 이미지 */}
          <div
            className="transition-all duration-1000 ease-in-out flex flex-col items-center justify-center"
            style={{
              opacity: logoVisible ? 1 : 0,
              transform: `translateY(${logoVisible ? 0 : 20}px)`,
            }}
          >
            {/* Kakao FANance 로고 이미지 */}
            <div className="mb-6 flex items-center justify-center">
              <Image
                src="/images/kakao-fanance-logo.png"
                alt="Kakao FANance"
                width={320}
                height={64}
                className="object-contain w-80 h-16 sm:w-96 sm:h-20 lg:w-[400px] lg:h-20"
                style={{
                  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
                }}
                priority
              />
            </div>

            <p
              className="text-base sm:text-lg lg:text-xl font-medium text-gray-600 leading-relaxed mb-8 text-center"
              style={{
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              좋아하는 웹툰부터 스마트한 투자까지
            </p>

            {/* 터치 안내 */}
            <div
              className="transition-all duration-1000 ease-in-out flex flex-col items-center"
              style={{
                opacity: logoVisible ? 1 : 0,
                transform: `translateY(${logoVisible ? 0 : 10}px)`,
              }}
            >
              <div className="flex justify-center mb-4">
                <div className="flex space-x-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse [animation-delay:0.2s] shadow-lg"></div>
                </div>
              </div>
              <p
                className="text-sm sm:text-base font-semibold animate-pulse text-center"
                style={{
                  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                화면을 터치하여 시작하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버전 정보 */}
      <div className="pb-8 px-8">
        <div
          className="transition-all duration-1000 ease-in-out text-center"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: `translateY(${logoVisible ? 0 : 10}px)`,
          }}
        >
          <p
            className="text-sm font-bold tracking-wider"
            style={{
              background: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            Version 1.9.9
          </p>
        </div>
      </div>
    </div>
  )
}
