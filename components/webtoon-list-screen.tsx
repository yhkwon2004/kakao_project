"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Search, Filter } from "lucide-react"
import { Logo } from "@/components/logo"
import { investmentWebtoons } from "@/data/webtoons"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import Image from "next/image"

export function WebtoonListScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // 웹툰 데이터 (진행 중 + 완료된 프로젝트 혼합)
  const allWebtoons = investmentWebtoons

  // 필터링된 웹툰 가져오기
  const getFilteredWebtoons = () => {
    return investmentWebtoons.filter((webtoon) => {
      // 검색어 필터링
      if (searchQuery && !webtoon.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // 카테고리 필터링
      if (categoryFilter !== "all" && webtoon.category !== categoryFilter) {
        return false
      }

      // 진행률 필터링
      if (progressFilter === "high" && (webtoon.fundingPercentage || 0) < 70) {
        return false
      } else if (
        progressFilter === "medium" &&
        ((webtoon.fundingPercentage || 0) < 40 || (webtoon.fundingPercentage || 0) >= 70)
      ) {
        return false
      } else if (progressFilter === "low" && (webtoon.fundingPercentage || 0) >= 40) {
        return false
      }

      // 남은 시간 필터링
      if (timeFilter === "urgent" && (webtoon.daysLeft || 0) > 3) {
        return false
      } else if (timeFilter === "soon" && ((webtoon.daysLeft || 0) <= 3 || (webtoon.daysLeft || 0) > 7)) {
        return false
      } else if (timeFilter === "plenty" && (webtoon.daysLeft || 0) <= 7) {
        return false
      }

      // 상태 필터링
      if (statusFilter === "ongoing" && webtoon.status !== "ongoing") {
        return false
      } else if (statusFilter === "completed" && webtoon.status !== "completed") {
        return false
      }

      return true
    })
  }

  const filteredWebtoons = getFilteredWebtoons()

  return (
    <div className="flex flex-col pb-20 bg-[#FAFAFA] dark:bg-[#323233]">
      {/* 헤더 */}
      <div className="h-16 flex items-center px-4 border-b border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] sticky top-0 z-40 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 검색 및 필터 */}
      <div className="p-6 bg-gradient-to-b from-[#F9F9F9] to-[#FAFAFA] dark:from-[#3F3F3F] dark:to-[#323233]">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#989898]" />
            <Input
              placeholder="웹툰 검색"
              className="pl-12 h-12 rounded-2xl border-[#C2BDAD] dark:border-[#454858] bg-white dark:bg-[#3F3F3F] text-[#323233] dark:text-[#F5D949] focus:border-[#5F859F] shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-2xl border-[#C2BDAD] dark:border-[#454858] text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858] bg-white dark:bg-[#3F3F3F] shadow-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-white dark:bg-[#383B4B]/30 rounded-2xl border border-[#C2BDAD] dark:border-[#454858] shadow-sm backdrop-blur-sm">
            <div>
              <label className="text-sm font-medium text-[#323233] dark:text-[#F5D949] mb-2 block">카테고리</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl border-[#C2BDAD] dark:border-[#454858] h-10 bg-[#F9F9F9] dark:bg-[#3F3F3F] text-[#323233] dark:text-[#F5D949]">
                  <SelectValue placeholder="모든 카테고리" />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-[#C2BDAD] dark:border-[#454858]">
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="판타지">판타지</SelectItem>
                  <SelectItem value="로맨스">로맨스</SelectItem>
                  <SelectItem value="액션">액션</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#323233] dark:text-[#F5D949] mb-2 block">진행률</label>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="rounded-xl border-[#C2BDAD] dark:border-[#454858] h-10 bg-[#F9F9F9] dark:bg-[#3F3F3F] text-[#323233] dark:text-[#F5D949]">
                  <SelectValue placeholder="모든 진행률" />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-[#C2BDAD] dark:border-[#454858]">
                  <SelectItem value="all">모든 진행률</SelectItem>
                  <SelectItem value="high">높음 (70% 이상)</SelectItem>
                  <SelectItem value="medium">중간 (40-70%)</SelectItem>
                  <SelectItem value="low">낮음 (40% 미만)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#323233] dark:text-[#F5D949] mb-2 block">남은 시간</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="rounded-xl border-[#C2BDAD] dark:border-[#454858] h-10 bg-[#F9F9F9] dark:bg-[#3F3F3F] text-[#323233] dark:text-[#F5D949]">
                  <SelectValue placeholder="모든 기간" />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-[#C2BDAD] dark:border-[#454858]">
                  <SelectItem value="all">모든 기간</SelectItem>
                  <SelectItem value="urgent">긴급 (3일 이하)</SelectItem>
                  <SelectItem value="soon">곧 마감 (4-7일)</SelectItem>
                  <SelectItem value="plenty">여유 (7일 초과)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#323233] dark:text-[#F5D949] mb-2 block">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl border-[#C2BDAD] dark:border-[#454858] h-10 bg-[#F9F9F9] dark:bg-[#3F3F3F] text-[#323233] dark:text-[#F5D949]">
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-[#C2BDAD] dark:border-[#454858]">
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="ongoing">진행중</SelectItem>
                  <SelectItem value="completed">완료됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* 웹툰 목록 */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#323233] dark:text-[#F5D949]">전체 웹툰</h2>
          <div className="bg-[#5F859F]/10 dark:bg-[#F5D949]/10 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-[#5F859F] dark:text-[#F5D949]">{filteredWebtoons.length}개</span>
          </div>
        </div>

        {filteredWebtoons.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredWebtoons.map((webtoon) => {
              const isCompleted = webtoon.status === "completed" || webtoon.fundingPercentage === 100
              const formatCurrency = (amount: number): string => {
                if (amount >= 100000000) {
                  const eok = Math.floor(amount / 100000000)
                  const man = Math.floor((amount % 100000000) / 10000)
                  if (man > 0) {
                    return `${eok}억 ${man.toLocaleString()}만원`
                  }
                  return `${eok}억원`
                } else if (amount >= 10000) {
                  return `${Math.floor(amount / 10000).toLocaleString()}만원`
                }
                return `${amount.toLocaleString()}원`
              }

              return (
                <Card
                  key={webtoon.id}
                  className="rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray/10 bg-gradient-to-b from-white to-gray-50/50 dark:from-darkblue/30 dark:to-darkblue/20 hover:scale-[1.03] hover:border-green/20 backdrop-blur-sm"
                  onClick={() => router.push(`/webtoon/${webtoon.id}`)}
                >
                  <div className="relative h-32 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={webtoon.thumbnail || "/placeholder.svg"}
                      alt={webtoon.title}
                      fill
                      className="object-cover"
                    />
                    {/* 상단 배지들 */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      {isCompleted ? (
                        <Badge className="bg-green/90 text-white text-xs font-bold px-2 py-1">완료됨</Badge>
                      ) : (
                        <Badge className="bg-yellow/90 text-dark text-xs font-bold px-2 py-1">
                          {webtoon.daysLeft}일 남음
                        </Badge>
                      )}
                    </div>

                    {/* 하단 진행도 오버레이 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
                      <div className="text-white space-y-2">
                        {/* 진행률과 목표 금액 */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/80">
                            {formatCurrency(webtoon.currentRaised || 0)} / {formatCurrency(webtoon.goalAmount)}
                          </span>
                        </div>

                        {/* 진행도 바 */}
                        <div className="relative">
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r from-green to-yellow transition-all duration-700 ease-out ${
                                isCompleted ? "bg-green" : ""
                              }`}
                              style={{ width: `${Math.min(webtoon.fundingPercentage || 0, 100)}%` }}
                            />
                          </div>
                          {/* 진행도 바 위 작은 인디케이터 */}
                          <div
                            className="absolute top-0 w-1 h-2 bg-white rounded-full transition-all duration-700"
                            style={{ left: `${Math.min(webtoon.fundingPercentage || 0, 100)}%` }}
                          />
                        </div>

                        {/* 투자자 수 */}
                        <div className="flex justify-between items-center text-xs text-white/90">
                          <span>{webtoon.totalInvestors || 0}명 참여</span>
                          <span className="text-yellow font-medium">현재 {webtoon.currentROI}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 bg-white/80 dark:bg-darkblue/40 backdrop-blur-sm">
                    <h3 className="font-bold text-sm text-darkblue dark:text-light line-clamp-1 mb-3 tracking-tight">
                      {webtoon.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-start">
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green/10 to-green/5 px-3 py-1.5 rounded-full border border-green/20 shadow-sm">
                          <TrendingUp className="h-3 w-3 text-green" />
                          <span className="text-xs font-medium text-green">예상 수익률: {webtoon.expectedROI}</span>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 shadow-sm"
                        >
                          {webtoon.category}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 bg-gradient-to-b from-[#E5E4DC]/50 to-[#E5E4DC]/20 dark:from-[#383B4B]/20 dark:to-[#383B4B]/10 rounded-2xl border border-dashed border-[#C2BDAD] dark:border-[#454858]">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-[#989898] font-medium">검색 결과가 없습니다</p>
            <p className="text-sm text-[#989898] mt-1">다른 검색어를 시도해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
