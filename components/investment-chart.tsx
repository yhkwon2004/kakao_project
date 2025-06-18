"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Target, Info, ArrowUpDown } from "lucide-react"
import { investmentWebtoons } from "@/data/webtoons"
import { formatKoreanCurrency } from "@/lib/format-currency"

export function InvestmentChart() {
  const [sortBy, setSortBy] = useState<"roi" | "funding" | "name">("roi")

  // 데이터 정렬
  const sortedWebtoons = [...investmentWebtoons].sort((a, b) => {
    switch (sortBy) {
      case "roi":
        return (b.currentROI || 0) - (a.currentROI || 0)
      case "funding":
        return b.fundingPercentage - a.fundingPercentage
      case "name":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // 수익률에 따른 색상 분류
  const getROIColor = (roi: number) => {
    if (roi >= 12) return "bg-blue-600" // 진한 파랑 (12~15%)
    if (roi >= 9) return "bg-blue-800" // 짙은 남색 (9~12%)
    if (roi >= 6) return "bg-gray-500" // 중간 회색 (6~9%)
    return "bg-gray-300" // 연한 회색 (3~6%)
  }

  const getROIColorText = (roi: number) => {
    if (roi >= 12) return "text-blue-600"
    if (roi >= 9) return "text-blue-800"
    if (roi >= 6) return "text-gray-600"
    return "text-gray-500"
  }

  // 최대값 계산 (차트 스케일링용)
  const maxGoalAmount = Math.max(...sortedWebtoons.map((w) => w.goalAmount))
  const maxROI = Math.max(...sortedWebtoons.map((w) => w.currentROI || 0))

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          웹툰 투자 현황 차트
        </h1>
        <p className="text-gray-600 dark:text-gray-400">9개 작품별 투자 정보 시각화</p>
      </div>

      {/* 정렬 컨트롤 */}
      <div className="flex justify-center gap-2">
        <Button
          variant={sortBy === "roi" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("roi")}
          className="rounded-full"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          수익률순
        </Button>
        <Button
          variant={sortBy === "funding" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("funding")}
          className="rounded-full"
        >
          <Target className="h-4 w-4 mr-1" />
          진행률순
        </Button>
        <Button
          variant={sortBy === "name" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("name")}
          className="rounded-full"
        >
          <ArrowUpDown className="h-4 w-4 mr-1" />
          가나다순
        </Button>
      </div>

      {/* 메인 차트 */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            투자 현황 막대그래프
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 범례 */}
            <div className="flex flex-wrap justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span className="text-sm">목표금액</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">모금액</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm">3~6% 수익률</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm">6~9% 수익률</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-800 rounded"></div>
                <span className="text-sm">9~12% 수익률</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-sm">12~15% 수익률</span>
              </div>
            </div>

            {/* 차트 영역 */}
            <div className="space-y-8">
              {sortedWebtoons.map((webtoon, index) => (
                <div key={webtoon.id} className="space-y-3">
                  {/* 작품명 */}
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <h3 className="font-bold text-lg">{webtoon.title}</h3>
                    <div
                      className={`px-3 py-1 rounded-full text-white font-bold text-sm ${getROIColor(webtoon.currentROI || 0)}`}
                    >
                      {webtoon.currentROI?.toFixed(1)}%
                    </div>
                  </div>

                  {/* 막대그래프 */}
                  <div className="relative">
                    {/* 목표금액 배경 바 */}
                    <div className="w-full h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg relative overflow-hidden">
                      {/* 모금액 바 */}
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all duration-1000 ease-out"
                        style={{ width: `${(webtoon.currentRaised / maxGoalAmount) * 100}%` }}
                      />
                      {/* 목표금액 표시선 */}
                      <div
                        className="absolute top-0 h-full w-1 bg-blue-600 opacity-70"
                        style={{ left: `${(webtoon.goalAmount / maxGoalAmount) * 100}%` }}
                      />
                    </div>

                    {/* 금액 라벨 */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          모금: {formatKoreanCurrency(webtoon.currentRaised)}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          목표: {formatKoreanCurrency(webtoon.goalAmount)}
                        </span>
                      </div>
                      <div className={`font-bold text-lg ${getROIColorText(webtoon.currentROI || 0)}`}>
                        {webtoon.currentROI?.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>진행률: {webtoon.fundingPercentage}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>참여자: {webtoon.totalInvestors.toLocaleString()}명</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {webtoon.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {formatKoreanCurrency(sortedWebtoons.reduce((sum, w) => sum + w.goalAmount, 0))}
            </div>
            <div className="text-blue-100 text-sm">총 목표금액</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {formatKoreanCurrency(sortedWebtoons.reduce((sum, w) => sum + w.currentRaised, 0))}
            </div>
            <div className="text-green-100 text-sm">총 모금액</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {sortedWebtoons.reduce((sum, w) => sum + w.totalInvestors, 0).toLocaleString()}명
            </div>
            <div className="text-purple-100 text-sm">총 참여자</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {(sortedWebtoons.reduce((sum, w) => sum + (w.currentROI || 0), 0) / sortedWebtoons.length).toFixed(1)}%
            </div>
            <div className="text-orange-100 text-sm">평균 수익률</div>
          </CardContent>
        </Card>
      </div>

      {/* 수익률 계산 방식 설명 */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">수익률 계산 방식 안내</h4>
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                현재 수익률은 진행률뿐 아니라 <strong>참여자 수와 흥행 지표</strong>를 기반으로 추정된 값입니다.
                진행률이 100%라도 흥행성에 따라 수익률은 유동적입니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span className="text-xs font-medium">3~6%</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span className="text-xs font-medium">6~9%</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-3 h-3 bg-blue-800 rounded"></div>
                  <span className="text-xs font-medium">9~12%</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-xs font-medium">12~15%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
