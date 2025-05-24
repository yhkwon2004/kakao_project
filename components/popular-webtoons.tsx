"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"
import { webtoons } from "@/data/webtoons"
import Image from "next/image"

export function PopularWebtoons() {
  const router = useRouter()

  // 인기 웹툰 데이터 (펀딩률 기준으로 정렬)
  const popularWebtoons = webtoons
    .filter((webtoon) => webtoon.fundingPercentage && webtoon.fundingPercentage > 0)
    .sort((a, b) => (b.fundingPercentage || 0) - (a.fundingPercentage || 0))

  const handleWebtoonClick = (webtoon: any) => {
    // slug가 있으면 slug를 사용하고, 없으면 id를 사용
    const identifier = webtoon.slug || webtoon.id
    router.push(`/webtoon/${identifier}`)
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-profit" />
          <Logo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* 제목 */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-darkblue dark:text-light mb-2">인기 투자</h1>
        <p className="text-gray">현재 가장 인기 있는 웹툰 투자 프로젝트들입니다</p>
      </div>

      {/* 인기 웹툰 목록 */}
      <div className="px-4 space-y-4">
        {popularWebtoons.map((webtoon, index) => (
          <Card
            key={webtoon.id}
            className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border-gray/20 bg-light dark:bg-darkblue/30"
            onClick={() => handleWebtoonClick(webtoon)}
          >
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* 순위 표시 */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow flex items-center justify-center">
                  <span className="text-sm font-bold text-dark">{index + 1}</span>
                </div>

                {/* 썸네일 */}
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray/10 border border-gray/20">
                  <Image
                    src={webtoon.thumbnail || "/placeholder.svg"}
                    alt={webtoon.title}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 웹툰 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-darkblue dark:text-light text-sm truncate">{webtoon.title}</h3>
                      <p className="text-xs text-gray mt-0.5">{webtoon.genre}</p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray">펀딩률</p>
                      <p className="font-bold text-profit">{webtoon.fundingPercentage}%</p>
                    </div>
                  </div>

                  {/* 펀딩 진행률 */}
                  <div className="mb-2">
                    <Progress value={webtoon.fundingPercentage} className="h-2 bg-gray/20" />
                  </div>

                  {/* 투자 정보 */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray">현재 모금액</p>
                      <p className="font-medium text-darkblue dark:text-light">
                        ₩{(webtoon.currentRaised || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray">목표 금액</p>
                      <p className="font-medium text-darkblue dark:text-light">
                        ₩{(webtoon.goalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* 예상 수익률 */}
                  {webtoon.expectedROI && (
                    <div className="mt-2 pt-2 border-t border-gray/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray">예상 수익률</span>
                        <span className="text-sm font-bold text-profit">+{webtoon.expectedROI}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {popularWebtoons.length === 0 && (
          <div className="text-center py-12 text-gray">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">인기 투자 프로젝트가 없습니다</p>
            <p className="text-sm">새로운 투자 기회를 기다려주세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
