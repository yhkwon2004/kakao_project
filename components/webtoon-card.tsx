"use client"

import type React from "react"

// 웹툰 카드 컴포넌트
// 이 컴포넌트는 메인 페이지에서 웹툰 목록을 표시하는 데 사용됩니다.
// 클릭 시 해당 웹툰의 상세 페이지로 이동합니다.

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { Webtoon } from "@/data/webtoons"
import { useState, useEffect } from "react"

interface WebtoonCardProps {
  webtoon: Webtoon
  onClick?: () => void
}

export function WebtoonCard({ webtoon, onClick }: WebtoonCardProps) {
  // 웹툰 데이터에서 필요한 정보 추출
  const { id, title, daysLeft, fundingPercentage, status, thumbnail } = webtoon

  const [dynamicFundingPercentage, setDynamicFundingPercentage] = useState(fundingPercentage)
  const [dynamicCurrentRaised, setDynamicCurrentRaised] = useState(webtoon.currentRaised)

  // 동적 웹툰 데이터 업데이트 감지
  useEffect(() => {
    const handleWebtoonDataChange = () => {
      const storedWebtoons = localStorage.getItem("webtoonsData")
      if (storedWebtoons) {
        const webtoonsData = JSON.parse(storedWebtoons)
        if (webtoonsData[webtoon.id]) {
          const updatedData = webtoonsData[webtoon.id]
          setDynamicFundingPercentage(updatedData.progress || fundingPercentage)
          setDynamicCurrentRaised(updatedData.currentRaised || webtoon.currentRaised)
        }
      }
    }

    // 초기 로드 시 업데이트된 데이터 확인
    handleWebtoonDataChange()

    window.addEventListener("webtoonDataChanged", handleWebtoonDataChange)
    window.addEventListener("storage", handleWebtoonDataChange)

    return () => {
      window.removeEventListener("webtoonDataChanged", handleWebtoonDataChange)
      window.removeEventListener("storage", handleWebtoonDataChange)
    }
  }, [webtoon.id, fundingPercentage, webtoon.currentRaised])

  // 완료된 웹툰 여부 확인 - 동적 데이터 사용
  const isCompleted = status === "completed" || dynamicFundingPercentage === 100

  // 클릭 애니메이션을 위한 상태
  const [isClicked, setIsClicked] = useState(false)
  const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({})
  const [showRipple, setShowRipple] = useState(false)

  // 클릭 효과가 끝난 후 상태 초기화
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isClicked])

  // 리플 효과가 끝난 후 상태 초기화
  useEffect(() => {
    if (showRipple) {
      const timer = setTimeout(() => {
        setShowRipple(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [showRipple])

  // 클릭 핸들러
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 클릭 위치 계산
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 리플 스타일 설정
    setRippleStyle({
      left: `${x}px`,
      top: `${y}px`,
    })

    // 애니메이션 상태 활성화
    setIsClicked(true)
    setShowRipple(true)

    // 원래 onClick 핸들러 호출
    if (onClick) onClick()
  }

  return (
    <div
      className={`cursor-pointer group relative ${isClicked ? "scale-95" : "scale-100"} transition-transform duration-300`}
      onClick={handleClick}
    >
      <Card
        className={`overflow-hidden transition-all hover:shadow-md 
          ${
            isCompleted
              ? "border-green/50 dark:border-green/30 shadow-sm" // 완료된 웹툰에 특별한 테두리 색상 적용
              : "border-gray/20 bg-light dark:bg-darkblue/30"
          } ${isClicked ? "shadow-inner" : ""}`}
      >
        {/* 
          웹툰 썸네일 이미지 컨테이너
          - aspect-[3/4]: 모든 썸네일에 3:4 비율 적용 (웹툰 표준 비율)
          - relative: 절대 위치 지정을 위한 상대적 컨테이너
          - overflow-hidden: 이미지가 컨테이너를 벗어나지 않도록 함
          - 완료된 웹툰의 경우 약간 어두운 오버레이 적용
        */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {/* 
            이미지 표시 로직
            - fill: 부모 컨테이너를 채우도록 이미지 크기 조정
            - object-cover: 이미지 비율을 유지하면서 컨테이너를 채움 (잘릴 수 있음)
            - object-center: 이미지가 중앙에 위치하도록 함
            - 이미지 소스가 다양해도 일관된 모양을 유지함
          */}
          <Image
            src={thumbnail || `/gray-placeholder.png`}
            alt={title}
            fill
            className={`object-cover object-center rounded-t-xl transition-all duration-300 hover:scale-105 ${isClicked ? "brightness-90" : "brightness-100"}`}
          />

          {/* 완료된 웹툰인 경우 어두운 오버레이 적용 */}
          {isCompleted && <div className="absolute inset-0 bg-dark/10 dark:bg-dark/20"></div>}

          {/* 호버 효과 오버레이 - 모든 웹툰에 적용 */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
            <span className="text-light text-sm font-medium truncate w-full text-center pb-1">{title}</span>
          </div>

          {/* 상태 표시 (완료 또는 남은 일수) */}
          {isCompleted ? (
            <div className="absolute top-2 right-2 bg-green text-light text-xs px-2 py-1 rounded-full shadow-sm">
              완료됨
            </div>
          ) : (
            daysLeft !== undefined && (
              <div className="absolute top-2 right-2 bg-yellow text-dark text-xs px-2 py-1 rounded-full shadow-sm">
                {daysLeft}일 남음
              </div>
            )
          )}

          {/* 펀딩 진행률 표시 */}
          {dynamicFundingPercentage !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-dark/80 p-2 backdrop-blur-sm">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-light">{Math.round(dynamicFundingPercentage)}% 모집됨</span>
              </div>
              <div className="h-1 bg-gray/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isCompleted ? "bg-green" : "bg-yellow"
                  }`}
                  style={{ width: `${Math.min(dynamicFundingPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <CardContent
          className={`p-3 ${isCompleted ? "bg-light/80 dark:bg-darkblue/40" : ""} ${isClicked ? "bg-gray-100 dark:bg-darkblue/60" : ""}`}
        >
          <h3 className="font-medium text-sm text-darkblue dark:text-light line-clamp-2">{title}</h3>
        </CardContent>
      </Card>

      {/* 리플 효과 */}
      {showRipple && (
        <div
          className="absolute rounded-full bg-white/30 dark:bg-white/20 animate-ripple pointer-events-none"
          style={{
            ...rippleStyle,
            width: "200px",
            height: "200px",
            marginLeft: "-100px",
            marginTop: "-100px",
          }}
        />
      )}
    </div>
  )
}

// 리플 애니메이션을 위한 스타일 추가
// tailwind.config.ts에 이 애니메이션을 추가해야 합니다
// 이 코드는 이미 있다고 가정하고 주석으로 남겨둡니다
/*
extend: {
  keyframes: {
    ripple: {
      '0%': { transform: 'scale(0)', opacity: '0.6' },
      '100%': { transform: 'scale(1)', opacity: '0' },
    },
  },
  animation: {
    ripple: 'ripple 0.6s linear',
  },
},
*/
