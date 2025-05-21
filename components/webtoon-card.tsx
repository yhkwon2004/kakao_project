"use client"

// 웹툰 카드 컴포넌트
// 이 컴포넌트는 메인 페이지에서 웹툰 목록을 표시하는 데 사용됩니다.
// 클릭 시 해당 웹툰의 상세 페이지로 이동합니다.

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface WebtoonCardProps {
  id: string
  title: string
  daysLeft?: number
  fundingPercentage?: number
  status?: "ongoing" | "completed"
  onClick?: () => void
}

export function WebtoonCard({ id, title, daysLeft, fundingPercentage, status, onClick }: WebtoonCardProps) {
  // 완료된 웹툰 여부 확인
  // fundingPercentage가 100%이거나 status가 'completed'인 경우 완료된 웹툰으로 간주
  const isCompleted = status === "completed" || fundingPercentage === 100

  return (
    <div className="cursor-pointer" onClick={onClick}>
      <Card
        className={`overflow-hidden transition-all hover:shadow-md 
          ${
            isCompleted
              ? "border-green/50 dark:border-green/30 shadow-sm" // 완료된 웹툰에 특별한 테두리 색상 적용
              : "border-gray/20 bg-light dark:bg-darkblue/30"
          }`}
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
            src={`/abstract-geometric-shapes.png?height=300&width=225&query=${encodeURIComponent(title)}`}
            alt={title}
            fill
            className="object-cover object-center rounded-t-xl transition-transform duration-300 hover:scale-105"
          />

          {/* 완료된 웹툰인 경우 어두운 오버레이 적용 */}
          {isCompleted && <div className="absolute inset-0 bg-dark/10 dark:bg-dark/20"></div>}

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
          {fundingPercentage !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-dark/80 p-2 backdrop-blur-sm">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-light">{fundingPercentage}% 모집됨</span>
              </div>
              <div className="h-1 bg-gray/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isCompleted ? "bg-green" : "bg-yellow"
                  }`}
                  style={{ width: `${fundingPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <CardContent className={`p-3 ${isCompleted ? "bg-light/80 dark:bg-darkblue/40" : ""}`}>
          <h3 className="font-medium text-sm text-darkblue dark:text-light line-clamp-2">{title}</h3>
        </CardContent>
      </Card>
    </div>
  )
}
