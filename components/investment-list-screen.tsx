"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Search, Filter } from "lucide-react"
import { Logo } from "@/components/logo"
import { Switch } from "@/components/ui/switch"

export function InvestmentListScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  // 완료된 항목 표시 여부를 제어하는 상태 (기본값: true - 완료된 항목 표시)
  const [showCompleted, setShowCompleted] = useState(true)

  // 투자 프로젝트 데이터 (실제로는 API에서 가져와야 함)
  const allInvestments = [
    {
      id: "1",
      title: "황녀, 반역자를 각인시키다",
      description: "드라마 제작 진행 중",
      fundingGoal: "₩500,000,000",
      fundingPercentage: 65,
      daysLeft: 7,
      roiRange: "12-18%",
      category: "드라마",
      status: "ongoing" as const,
    },
    {
      id: "2",
      title: "검술명가 막내아들",
      description: "애니메이션 프로젝트",
      fundingGoal: "₩800,000,000",
      fundingPercentage: 45,
      daysLeft: 10,
      roiRange: "15-22%",
      category: "애니메이션",
      status: "ongoing" as const,
    },
    {
      id: "3",
      title: "이번 생은 가주가 되겠습니다",
      description: "영화 각색 진행 중",
      fundingGoal: "₩1,200,000,000",
      fundingPercentage: 72,
      daysLeft: 5,
      roiRange: "18-25%",
      category: "영화",
      status: "ongoing" as const,
    },
    {
      id: "4",
      title: "토끼와 육포범의 공생관계",
      description: "드라마 제작 기획",
      fundingGoal: "₩600,000,000",
      fundingPercentage: 85,
      daysLeft: 3,
      roiRange: "14-20%",
      category: "드라마",
      status: "ongoing" as const,
    },
    {
      id: "5",
      title: "나쁜 비서 [19세 완전판]",
      description: "웹드라마 제작",
      fundingGoal: "₩300,000,000",
      fundingPercentage: 95,
      daysLeft: 0,
      roiRange: "10-15%",
      category: "웹드라마",
      status: "completed" as const,
    },
    {
      id: "6",
      title: "철혈검가 사냥개의 회귀",
      description: "애니메이션 제작",
      fundingGoal: "₩700,000,000",
      fundingPercentage: 60,
      daysLeft: 0,
      roiRange: "16-23%",
      category: "애니메이션",
      status: "completed" as const,
    },
    {
      id: "7",
      title: "계약 남편이 남자 주인공과 달았다",
      description: "웹드라마 제작",
      fundingGoal: "₩400,000,000",
      fundingPercentage: 30,
      daysLeft: 0,
      roiRange: "12-18%",
      category: "웹드라마",
      status: "completed" as const,
    },
    {
      id: "8",
      title: "흑막 범고래 아기님",
      description: "애니메이션 제작",
      fundingGoal: "₩900,000,000",
      fundingPercentage: 55,
      daysLeft: 12,
      roiRange: "18-25%",
      category: "애니메이션",
      status: "ongoing" as const,
    },
  ]

  // 필터링된 투자 프로젝트 가져오기
  const getFilteredInvestments = () => {
    return allInvestments.filter((investment) => {
      // 완료된 항목 필터링 - showCompleted가 false일 경우 완료된 항목 제외
      // 상태 변경 시 실시간으로 목록이 업데이트됨
      if (!showCompleted && investment.status === "completed") {
        return false
      }

      // 검색어 필터링
      if (searchQuery && !investment.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // 카테고리 필터링
      if (categoryFilter !== "all" && investment.category !== categoryFilter) {
        return false
      }

      // 진행률 필터링
      if (progressFilter === "high" && investment.fundingPercentage < 70) {
        return false
      } else if (
        progressFilter === "medium" &&
        (investment.fundingPercentage < 40 || investment.fundingPercentage >= 70)
      ) {
        return false
      } else if (progressFilter === "low" && investment.fundingPercentage >= 40) {
        return false
      }

      // 남은 시간 필터링
      if (timeFilter === "urgent" && investment.daysLeft > 3) {
        return false
      } else if (timeFilter === "soon" && (investment.daysLeft <= 3 || investment.daysLeft > 7)) {
        return false
      } else if (timeFilter === "plenty" && investment.daysLeft <= 7) {
        return false
      }

      return true
    })
  }

  const filteredInvestments = getFilteredInvestments()

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
              placeholder="투자 프로젝트 검색"
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

        {/* 완료된 항목 표시 여부 토글 스위치 */}
        {/* 
          완료된 항목 표시 여부를 제어하는 토글 스위치
          - 기본값: ON (완료된 항목 표시)
          - OFF: 완료된 항목 숨김
          - 상태 변경 시 실시간으로 목록이 업데이트됨
          - 사용자가 원하는 항목만 필터링하여 볼 수 있도록 함
        */}
        <div className="flex items-center justify-between p-3 mb-4 bg-light dark:bg-darkblue/20 rounded-xl border border-gray/10">
          <span className="text-sm text-darkblue dark:text-light">
            {showCompleted ? "완료된 항목 보기" : "완료된 항목 숨기기"}
          </span>
          <Switch
            checked={showCompleted}
            onCheckedChange={setShowCompleted}
            className="data-[state=checked]:bg-green"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-light dark:bg-darkblue/20 rounded-xl border border-gray/10">
            <div>
              <label className="text-xs text-gray mb-1 block">카테고리</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-lg border-gray/20 h-9">
                  <SelectValue placeholder="모든 카테고리" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 카테고리</SelectItem>
                  <SelectItem value="드라마">드라마</SelectItem>
                  <SelectItem value="웹드라마">웹드라마</SelectItem>
                  <SelectItem value="영화">영화</SelectItem>
                  <SelectItem value="애니메이션">애니메이션</SelectItem>
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
          </div>
        )}
      </div>

      {/* 투자 프로젝트 목록 */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 text-darkblue dark:text-light">
          전체 투자 프로젝트 ({filteredInvestments.length})
        </h2>

        {filteredInvestments.length > 0 ? (
          <div className="space-y-4">
            {filteredInvestments.map((investment) => (
              <Card
                key={investment.id}
                className="overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-light dark:bg-darkblue/30"
                onClick={() => router.push(`/webtoon/${investment.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative h-32 w-full">
                    <div className="absolute inset-0 bg-light dark:bg-darkblue/30" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-darkblue dark:text-light">{investment.title}</h3>
                          {investment.status === "completed" ? (
                            <span className="bg-green text-light text-xs px-2 py-1 rounded-full">완료됨</span>
                          ) : (
                            <span className="bg-yellow text-dark text-xs px-2 py-1 rounded-full">
                              {investment.daysLeft}일 남음
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray">{investment.description}</p>
                        <p className="text-xs text-darkblue dark:text-light mt-1">목표: {investment.fundingGoal}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray">{investment.fundingPercentage}% 모집됨</span>
                          <span className="text-profit font-medium">예상 수익률: {investment.roiRange}</span>
                        </div>
                        <Progress
                          value={investment.fundingPercentage}
                          className="h-1.5 bg-gray/20"
                          indicatorClassName={investment.status === "completed" ? "bg-green" : "bg-yellow"}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
