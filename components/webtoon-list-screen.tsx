"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Search, Filter } from "lucide-react"
import { Logo } from "@/components/logo"
import { WebtoonCard } from "@/components/webtoon-card"
import { investmentWebtoons } from "@/data/webtoons"

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
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {/* 검색 및 필터 */}
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
            <Input
              placeholder="웹툰 검색"
              className="pl-9 rounded-xl border-gray/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl border-gray/20"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 text-gray" />
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-light dark:bg-darkblue/20 rounded-xl border border-gray/10">
            <div>
              <label className="text-xs text-gray mb-1 block">카테고리</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-lg border-gray/20 h-9">
                  <SelectValue placeholder="모든 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="판타지">판타지</SelectItem>
                  <SelectItem value="로맨스">로맨스</SelectItem>
                  <SelectItem value="액션">액션</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray mb-1 block">진행률</label>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="rounded-lg border-gray/20 h-9">
                  <SelectValue placeholder="모든 진행률" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 진행률</SelectItem>
                  <SelectItem value="high">높음 (70% 이상)</SelectItem>
                  <SelectItem value="medium">중간 (40-70%)</SelectItem>
                  <SelectItem value="low">낮음 (40% 미만)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray mb-1 block">남은 시간</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="rounded-lg border-gray/20 h-9">
                  <SelectValue placeholder="모든 기간" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 기간</SelectItem>
                  <SelectItem value="urgent">긴급 (3일 이하)</SelectItem>
                  <SelectItem value="soon">곧 마감 (4-7일)</SelectItem>
                  <SelectItem value="plenty">여유 (7일 초과)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray mb-1 block">상태</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg border-gray/20 h-9">
                  <SelectValue placeholder="모든 상태" />
                </SelectTrigger>
                <SelectContent>
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
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-darkblue dark:text-light">전체 웹툰 ({filteredWebtoons.length})</h2>

        {filteredWebtoons.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredWebtoons.map((webtoon) => (
              <WebtoonCard key={webtoon.id} webtoon={webtoon} onClick={() => router.push(`/webtoon/${webtoon.id}`)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-light dark:bg-darkblue/20 rounded-xl">
            <p className="text-gray">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
