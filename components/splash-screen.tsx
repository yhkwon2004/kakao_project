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
          {/* WX WEEK 로고 */}
          <div
            className="transition-all duration-1000 ease-in-out flex flex-col items-center justify-center mb-8"
            style={{
              opacity: logoVisible ? 1 : 0,
              transform: `translateY(${logoVisible ? 0 : 20}px)`,
            }}
          >
            <div className="mb-8 flex items-center justify-center">
              <Image
                src="/images/wx-week-logo-transparent.png"
                alt="WX WEEK"
                width={400}
                height={300}
                className="object-contain w-80 h-60 sm:w-96 sm:h-72 lg:w-[400px] lg:h-80"
                style={{
                  filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))",
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
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="w-4 h-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full animate-pulse [animation-delay:0.2s] shadow-lg"></div>
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
