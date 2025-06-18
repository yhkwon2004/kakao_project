"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, Users, Target, Calendar, BarChart3, PieChart, Info, Star, Flame, Crown } from "lucide-react"
import { investmentWebtoons } from "@/data/webtoons"
import { formatKoreanCurrency } from "@/lib/format-currency"

interface WebtoonData {
  id: string
  title: string
  thumbnail: string
  fundingGoal: string
  currentRaised: number
  goalAmount: number
  totalInvestors: number
  fundingPercentage: number
  expectedROI: string
  currentROI: number
  status: string
  category: string
  daysLeft: number
}

export function InvestmentDashboard() {
  const [sortBy, setSortBy] = useState<"roi" | "funding" | "investors">("roi")
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart")

  // 데이터 정렬
  const sortedWebtoons = [...investmentWebtoons].sort((a, b) => {
    switch (sortBy) {
      case "roi":
        return (b.currentROI || 0) - (a.currentROI || 0)
      case "funding":
        return b.fundingPercentage - a.fundingPercentage
      case "investors":
        return b.totalInvestors - a.totalInvestors
      default:
        return 0
    }
  })

  // ROI에 따른 색상 그라데이션
  const getROIColor = (roi: number) => {
    if (roi >= 12) return "from-emerald-500 to-green-600"
    if (roi >= 10) return "from-blue-500 to-emerald-500"
    if (roi >= 8) return "from-yellow-500 to-blue-500"
    if (roi >= 6) return "from-orange-500 to-yellow-500"
    return "from-red-400 to-orange-500"
  }

  // 인기도 아이콘
  const getPopularityIcon = (investors: number) => {
    if (investors >= 5000) return <Crown className="h-4 w-4 text-yellow-500" />
    if (investors >= 4000) return <Flame className="h-4 w-4 text-orange-500" />
    if (investors >= 3000) return <Star className="h-4 w-4 text-blue-500" />
    return null
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          K-콘텐츠 투자 현황
        </h1>
        <p className="text-gray-600 dark:text-gray-400">웹툰 기반 콘텐츠 투자 대시보드</p>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">총 모집금액</p>
                <p className="text-2xl font-bold">
                  {formatKoreanCurrency(sortedWebtoons.reduce((sum, w) => sum + w.goalAmount, 0))}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">총 모금액</p>
                <p className="text-2xl font-bold">
                  {formatKoreanCurrency(sortedWebtoons.reduce((sum, w) => sum + w.currentRaised, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">총 참여자</p>
                <p className="text-2xl font-bold">
                  {sortedWebtoons.reduce((sum, w) => sum + w.totalInvestors, 0).toLocaleString()}명
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">평균 수익률</p>
                <p className="text-2xl font-bold">
                  {(sortedWebtoons.reduce((sum, w) => sum + (w.currentROI || 0), 0) / sortedWebtoons.length).toFixed(1)}
                  %
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 컨트롤 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={sortBy === "roi" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("roi")}
            className="rounded-full"
          >
            수익률순
          </Button>
          <Button
            variant={sortBy === "funding" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("funding")}
            className="rounded-full"
          >
            진행률순
          </Button>
          <Button
            variant={sortBy === "investors" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("investors")}
            className="rounded-full"
          >
            참여자순
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("chart")}
            className="rounded-full"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            차트
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-full"
          >
            <PieChart className="h-4 w-4 mr-1" />
            테이블
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "chart" | "table")}>
        <TabsContent value="chart" className="space-y-4">
          {sortedWebtoons.map((webtoon, index) => (
            <Card
              key={webtoon.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* 썸네일 */}
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <img
                      src={webtoon.thumbnail || "/placeholder.svg"}
                      alt={webtoon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs font-bold">
                        #{index + 1}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">{getPopularityIcon(webtoon.totalInvestors)}</div>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">{webtoon.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="outline" className="text-xs">
                            {webtoon.category}
                          </Badge>
                          {webtoon.daysLeft > 0 && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{webtoon.daysLeft}일 남음</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full bg-gradient-to-r ${getROIColor(webtoon.currentROI || 0)} text-white font-bold text-lg shadow-lg`}
                      >
                        {webtoon.currentROI?.toFixed(1)}%
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">모금 진행률</span>
                        <span className="font-semibold">{webtoon.fundingPercentage}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={webtoon.fundingPercentage} className="h-3" />
                        <div
                          className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${getROIColor(webtoon.currentROI || 0)} rounded-full transition-all duration-500`}
                          style={{ width: `${webtoon.fundingPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* 상세 정보 그리드 */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">목표금액</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {formatKoreanCurrency(webtoon.goalAmount)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">모금액</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatKoreanCurrency(webtoon.currentRaised)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400 mb-1">참여자</p>
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {webtoon.totalInvestors.toLocaleString()}명
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="table">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                투자 현황 테이블
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">순위</th>
                      <th className="text-left p-3 font-semibold">작품명</th>
                      <th className="text-right p-3 font-semibold">목표금액</th>
                      <th className="text-right p-3 font-semibold">모금액</th>
                      <th className="text-right p-3 font-semibold">진행률</th>
                      <th className="text-right p-3 font-semibold">참여자</th>
                      <th className="text-right p-3 font-semibold">현재수익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedWebtoons.map((webtoon, index) => (
                      <tr key={webtoon.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            {getPopularityIcon(webtoon.totalInvestors)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={webtoon.thumbnail || "/placeholder.svg"}
                              alt={webtoon.title}
                              className="w-10 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-semibold">{webtoon.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{webtoon.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold">{formatKoreanCurrency(webtoon.goalAmount)}</td>
                        <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400">
                          {formatKoreanCurrency(webtoon.currentRaised)}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getROIColor(webtoon.currentROI || 0)} transition-all duration-500`}
                                style={{ width: `${webtoon.fundingPercentage}%` }}
                              />
                            </div>
                            <span className="font-semibold">{webtoon.fundingPercentage}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold text-purple-600 dark:text-purple-400">
                          {webtoon.totalInvestors.toLocaleString()}명
                        </td>
                        <td className="p-3 text-right">
                          <div
                            className={`px-3 py-1 rounded-full bg-gradient-to-r ${getROIColor(webtoon.currentROI || 0)} text-white font-bold text-sm inline-block`}
                          >
                            {webtoon.currentROI?.toFixed(1)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 수익률 계산 방식 설명 */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 border-0">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">현재 수익률 계산 방식</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                현재 수익률은 단순 진행률이 아닌, <strong>참여자 수와 인기도(흥행성)</strong>를 종합적으로 반영하여
                계산됩니다. 진행률이 100%여도 참여자 수가 적으면 수익률이 낮고, 참여자 수가 많고 진행률이 높을수록 최대
                15%까지 도달할 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  5000명+ 초인기작
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  4000명+ 인기작
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  3000명+ 주목작
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
