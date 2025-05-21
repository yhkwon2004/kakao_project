"use client"

import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Search, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { WebtoonCard } from "@/components/webtoon-card"
import { getUserFromStorage } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function HomeScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [progressFilter, setProgressFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name)
      if (user.profileImage) {
        setProfileImage(user.profileImage)
      }
    }
  }, [])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // 드라마화된 인기 웹툰 데이터
  // 사용자가 제공한 실제 이미지를 사용하도록 업데이트
  // 이미지 경로는 사용자가 제공한 이미지 URL로 설정
  const featuredDramas = [
    {
      id: "true-beauty",
      title: "여신강림",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%97%AC%EC%8B%A0%EA%B0%95%EB%A6%BC_%EB%93%9C%EB%9D%BC%EB%A7%88_%ED%8F%AC%EC%8A%A4%ED%84%B0.jpg-wiWvFhEiHgYlJpk1m3530szn1Dfvdv.jpeg", // 사용자가 제공한 이미지 URL
      year: "2020",
    },
    {
      id: "yumis-cells",
      title: "유미의 세포들",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/style_67ea22f475ba5-979x1400-tdEapD1etTYOtKnwXofMCOb6N1cwsN.webp", // 사용자가 제공한 이미지 URL
      year: "2021",
    },
    {
      id: "sweet-home",
      title: "스위트홈",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/joC9jLgox2rNOdrqI5eUvSFEzhKdz_xUTQOVIbABztVSJQ28-OfsRJpinIbYC01o_oV5jZXQI_yijVJKSaE9oQ-nLGgWspPX2F2vBXcKllueyD8hkQJdb.webp", // 사용자가 제공한 이미지 URL
      year: "2020",
    },
    {
      id: "itaewon-class",
      title: "이태원 클라쓰",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4c6aR0E32TLnWOD0kdhBsii9WF3XjHyWjKkeEmbVTRXMPrRbDNfFptd-FxOQ7d_fyQ6ahJwSQwOSlLwBFPI5ZQ-Zd6EQipgn4GR9Tmu6cv6ksjm1OwIq0.webp", // 사용자가 제공한 이미지 URL
      year: "2020",
    },
    {
      id: "uncanny-counter",
      title: "경이로운 소문",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EA%B2%BD%EC%9D%B4%EB%A1%9C%EC%9A%B4_%EC%86%8C%EB%AC%B8_%EB%93%9C%EB%9D%BC%EB%A7%88.jpg-nPUDLa6Bml0nVOzFOVNeuTdikEMb0N.jpeg", // 사용자가 제공한 이미지 URL
      year: "2020",
    },
  ]

  // Webtoon data (ongoing + completed projects)
  const allWebtoons = [
    {
      id: "1",
      title: "이번 생은 가주가 되겠습니다",
      daysLeft: 5,
      fundingPercentage: 72,
      category: "판타지",
      status: "ongoing" as const,
    },
    {
      id: "2",
      title: "토끼와 육포범의 공생관계",
      daysLeft: 3,
      fundingPercentage: 85,
      category: "로맨스",
      status: "ongoing" as const,
    },
    {
      id: "3",
      title: "황녀, 반역자를 각인시키다",
      daysLeft: 7,
      fundingPercentage: 65,
      category: "판타지",
      status: "ongoing" as const,
    },
    {
      id: "4",
      title: "나쁜 비서 [19세 완전판]",
      daysLeft: 0,
      fundingPercentage: 100,
      category: "로맨스",
      status: "completed" as const,
    },
    {
      id: "5",
      title: "검술명가 막내아들",
      daysLeft: 10,
      fundingPercentage: 45,
      category: "액션",
      status: "ongoing" as const,
    },
    {
      id: "6",
      title: "철혈검가 사냥개의 회귀",
      daysLeft: 0,
      fundingPercentage: 100,
      category: "액션",
      status: "completed" as const,
    },
  ]

  // Popular investment projects
  // 인기 투자 프로젝트 - 투자 금액 기준으로 정렬하여 상위 3개만 표시
  const popularInvestments = [
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
      totalInvestment: 325000000, // 총 투자 금액 (정렬 기준)
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
      totalInvestment: 360000000, // 총 투자 금액 (정렬 기준)
    },
    {
      id: "3",
      title: "이번 생은 가주가 되겠습니다",
      description: "영화 각색 진행 중",
      fundingGoal: "₩1,200,000,000",
      fundingPercentage: 100,
      daysLeft: 0,
      roiRange: "18-25%",
      category: "영화",
      status: "completed" as const,
      totalInvestment: 1200000000, // 총 투자 금액 (정렬 기준)
    },
    {
      id: "4",
      title: "나쁜 비서 [19세 완전판]",
      description: "웹드라마 제작 완료",
      fundingGoal: "₩300,000,000",
      fundingPercentage: 100,
      daysLeft: 0,
      roiRange: "10-15%",
      category: "웹드라마",
      status: "completed" as const,
      totalInvestment: 300000000, // 총 투자 금액 (정렬 기준)
    },
  ]

  // 인기 투자 프로젝트를 총 투자 금액 기준으로 정렬하고 상위 3개만 선택
  // 총 투자 금액이 높은 순으로 정렬하여 사용자에게 가장 인기 있는 프로젝트를 보여줌
  const top3Investments = [...popularInvestments].sort((a, b) => b.totalInvestment - a.totalInvestment).slice(0, 3)

  // Filtered webtoons based on search and filters
  const getFilteredWebtoons = () => {
    return allWebtoons.filter((webtoon) => {
      // Search filter
      if (searchQuery && !webtoon.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && webtoon.category !== categoryFilter) {
        return false
      }

      // Progress filter
      if (progressFilter === "high" && webtoon.fundingPercentage < 70) {
        return false
      } else if (progressFilter === "medium" && (webtoon.fundingPercentage < 40 || webtoon.fundingPercentage >= 70)) {
        return false
      } else if (progressFilter === "low" && webtoon.fundingPercentage >= 40) {
        return false
      }

      // Time filter
      if (timeFilter === "urgent" && webtoon.daysLeft > 3) {
        return false
      } else if (timeFilter === "soon" && (webtoon.daysLeft <= 3 || webtoon.daysLeft > 7)) {
        return false
      } else if (timeFilter === "plenty" && webtoon.daysLeft <= 7) {
        return false
      }

      // Status filter
      if (statusFilter === "ongoing" && webtoon.status !== "ongoing") {
        return false
      } else if (statusFilter === "completed" && webtoon.status !== "completed") {
        return false
      }

      return true
    })
  }

  // Filtered investments based on search and filters
  const getFilteredInvestments = () => {
    return top3Investments.filter((investment) => {
      // Search filter
      if (searchQuery && !investment.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && investment.category !== categoryFilter) {
        return false
      }

      // Progress filter
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

      // Time filter
      if (timeFilter === "urgent" && investment.daysLeft > 3) {
        return false
      } else if (timeFilter === "soon" && (investment.daysLeft <= 3 || investment.daysLeft > 7)) {
        return false
      } else if (timeFilter === "plenty" && investment.daysLeft <= 7) {
        return false
      }

      // Status filter
      if (statusFilter === "ongoing" && investment.status !== "ongoing") {
        return false
      } else if (statusFilter === "completed" && investment.status !== "completed") {
        return false
      }

      return true
    })
  }

  const filteredWebtoons = getFilteredWebtoons()
  const filteredInvestments = getFilteredInvestments()

  // View all buttons handlers
  const handleViewAllWebtoons = () => {
    router.push("/webtoons")
  }

  const handleViewAllInvestments = () => {
    router.push("/investments")
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSearch(!showSearch)}>
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="p-4 bg-light dark:bg-darkblue/10 border-b border-gray/10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
              <Input
                ref={searchInputRef}
                placeholder="웹툰 또는 키워드 검색"
                className="pl-9 pr-9 rounded-xl border-gray/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-gray" />
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSearch(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* 드라마화된 인기 웹툰 섹션 */}
      {/* 사용자가 제공한 실제 이미지를 사용하도록 업데이트 */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-darkblue dark:text-light">드라마화 된 인기 웹툰</h2>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {featuredDramas.map((drama) => (
              <div key={drama.id} className="w-[120px] flex-shrink-0">
                {/* 
                  웹툰 썸네일 표준화:
                  - 사용자가 제공한 이미지를 사용
                  - 이미지 경로는 나중에 사용자가 새 이미지를 제공할 경우 여기서 업데이트
                  - 모든 이미지는 동일한 비율(3:4)로 표시
                */}
                <div className="relative h-[160px] w-[120px] rounded-xl overflow-hidden mb-2">
                  <Image
                    src={drama.image || "/placeholder.svg"}
                    alt={drama.title}
                    fill
                    className="object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="font-medium text-sm text-darkblue dark:text-light truncate">{drama.title}</h3>
                <p className="text-xs text-gray">{drama.year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter section (only shown when filters are active) */}
      {showFilters && (
        <div className="p-4">
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
                  <SelectItem value="드라마">드라마</SelectItem>
                  <SelectItem value="애니메이션">애니메이션</SelectItem>
                  <SelectItem value="영화">영화</SelectItem>
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
        </div>
      )}

      {/* Popular Webtoons */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-darkblue dark:text-light">인기 웹툰</h2>
          <Button variant="ghost" size="sm" className="text-green" onClick={handleViewAllWebtoons}>
            전체보기 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {filteredWebtoons.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredWebtoons.slice(0, 6).map((webtoon) => (
              <WebtoonCard
                key={webtoon.id}
                id={webtoon.id}
                title={webtoon.title}
                daysLeft={webtoon.daysLeft}
                fundingPercentage={webtoon.fundingPercentage}
                status={webtoon.status}
                onClick={() => router.push(`/webtoon/${webtoon.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-light dark:bg-darkblue/20 rounded-xl">
            <p className="text-gray">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Popular Investments - 상위 3개만 표시 */}
      <div className="p-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-darkblue dark:text-light">인기 투자</h2>
          <Button variant="ghost" size="sm" className="text-green" onClick={handleViewAllInvestments}>
            전체보기 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {filteredInvestments.length > 0 ? (
          <div className="space-y-4">
            {/* 
              인기 투자 프로젝트 - 상위 3개만 표시
              - 총 투자 금액 기준으로 정렬하여 가장 인기 있는 프로젝트만 표시
              - 사용자에게 가장 관심도가 높은 프로젝트를 우선적으로 보여줌
            */}
            {filteredInvestments.map((investment) => (
              <Card
                key={investment.id}
                className="overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-shadow border-gray/20"
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
                            <Badge className="bg-green text-light hover:bg-green/90">완료됨</Badge>
                          ) : (
                            <Badge className="bg-yellow text-dark hover:bg-yellow/90">
                              {investment.daysLeft}일 남음
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray">{investment.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray">{investment.fundingPercentage}% 모집됨</span>
                          <span className="text-profit font-medium">
                            {investment.status === "completed" ? "수익률: " : "예상 수익률: "}
                            {investment.roiRange}
                          </span>
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

      {/* How to Use */}
      <div className="p-4 mt-4 bg-light dark:bg-darkblue/30 rounded-t-3xl">
        <h2 className="text-lg font-bold text-center mb-6 text-darkblue dark:text-light">이용 방법</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-yellow flex items-center justify-center mb-2">
              <span className="font-bold text-dark">1</span>
            </div>
            <p className="text-sm font-medium text-darkblue dark:text-light">웹툰 탐색</p>
            <p className="text-xs text-gray mt-1">다양한 인기 웹툰을 홈에서 둘러보세요.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green flex items-center justify-center mb-2">
              <span className="font-bold text-light">2</span>
            </div>
            <p className="text-sm font-medium text-darkblue dark:text-light">투자하기</p>
            <p className="text-xs text-gray mt-1">마음에 드는 작품에 포인트로 투자해 보세요.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-darkblue flex items-center justify-center mb-2">
              <span className="font-bold text-light">3</span>
            </div>
            <p className="text-sm font-medium text-darkblue dark:text-light">수익 확인</p>
            <p className="text-xs text-gray mt-1">마이페이지에서 수익률과 진행 상태를 실시간으로 확인하세요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
