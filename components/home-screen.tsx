"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Clock, Users, Wallet, ChevronRight, Play, Sparkles, BarChart3 } from "lucide-react"
import { Logo } from "@/components/logo"
import { featuredDramas, investmentWebtoons } from "@/data/webtoons"
import { getUserFromStorage } from "@/lib/auth"

export function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)
  const [expectedReturns, setExpectedReturns] = useState(0)

  // 사용자 정보 및 투자 현황 로드
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name || "사용자")
      setProfileImage(user.profileImage || null)
      setUserBalance(user.balance || 150000)
    }

    // 투자 내역 로드
    const loadInvestmentSummary = () => {
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        try {
          const investments = JSON.parse(investmentsStr)
          const total = investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
          const projects = investments.length
          const avgROI =
            investments.length > 0
              ? investments.reduce((sum: number, inv: any) => sum + (inv.expectedROI || 0), 0) / investments.length
              : 0
          const expected = total * (1 + avgROI / 100)

          setTotalInvested(total)
          setTotalProjects(projects)
          setExpectedReturns(expected)
        } catch (error) {
          console.error("투자 데이터 로드 오류:", error)
          setTotalInvested(0)
          setTotalProjects(0)
          setExpectedReturns(0)
        }
      } else {
        setTotalInvested(0)
        setTotalProjects(0)
        setExpectedReturns(0)
      }
    }

    loadInvestmentSummary()

    // 데이터 변경 감지
    const handleDataChange = () => {
      const user = getUserFromStorage()
      if (user) {
        setUserBalance(user.balance || 150000)
      }
      loadInvestmentSummary()
    }

    window.addEventListener("storage", handleDataChange)
    window.addEventListener("userDataChanged", handleDataChange)

    return () => {
      window.removeEventListener("storage", handleDataChange)
      window.removeEventListener("userDataChanged", handleDataChange)
    }
  }, [])

  // 금액 포맷팅 함수
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  // 진행 중인 투자 프로젝트 (상위 3개)
  const ongoingProjects = investmentWebtoons.filter((webtoon) => webtoon.status === "ongoing").slice(0, 3)

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={true} />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
          <Avatar className="h-8 w-8 bg-light border border-gray/20">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="text-darkblue dark:text-light bg-yellow/20">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* 환영 메시지 */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-yellow/10 to-green/10 rounded-2xl p-6 border border-yellow/20">
          <h1 className="text-2xl font-bold text-darkblue dark:text-light mb-2">안녕하세요, {userName}님! 👋</h1>
          <p className="text-gray mb-4">오늘도 좋은 투자 기회를 찾아보세요</p>

          {/* 사용자 잔액 */}
          <div className="flex items-center justify-between bg-white/50 dark:bg-darkblue/30 rounded-xl p-4">
            <div className="flex items-center">
              <div className="bg-green/20 p-2 rounded-lg mr-3">
                <Wallet className="h-5 w-5 text-green" />
              </div>
              <span className="text-sm font-medium text-darkblue dark:text-light">내 잔액</span>
            </div>
            <span className="font-bold text-green text-lg">{formatCurrency(userBalance)}</span>
          </div>
        </div>
      </div>

      {/* 투자 현황 요약 */}
      {totalProjects > 0 && (
        <div className="p-4 pt-0">
          <Card className="rounded-2xl border-gray/20 bg-white dark:bg-darkblue/30">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-darkblue dark:text-light">내 투자 현황</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green hover:text-green/80"
                  onClick={() => router.push("/asset")}
                >
                  자세히 보기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue/10 to-blue/5 p-3 rounded-xl">
                  <p className="text-xs text-gray mb-1">총 투자액</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="bg-gradient-to-br from-green/10 to-green/5 p-3 rounded-xl">
                  <p className="text-xs text-gray mb-1">예상 수익</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(Math.round(expectedReturns))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 드라마화된 인기 웹툰 */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-yellow mr-2" />
            <h2 className="font-bold text-darkblue dark:text-light">드라마화된 인기 웹툰</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-green hover:text-green/80"
            onClick={() => router.push("/webtoons")}
          >
            전체 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {featuredDramas.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {featuredDramas.slice(0, 4).map((drama) => (
              <Card
                key={drama.id}
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-white dark:bg-darkblue/30"
                onClick={() => router.push(`/webtoon/${drama.id}`)}
              >
                <div className="relative h-32 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  {drama.thumbnail && (
                    <img
                      src={drama.thumbnail || "/placeholder.svg"}
                      alt={drama.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-green/90 text-white text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      드라마화
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm text-darkblue dark:text-light mb-1 line-clamp-1">{drama.title}</h3>
                  <p className="text-xs text-gray line-clamp-1">{drama.distributor}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            <p>드라마화된 웹툰이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 투자 가능한 웹툰 */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green mr-2" />
            <h2 className="font-bold text-darkblue dark:text-light">투자 가능한 웹툰</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-green hover:text-green/80"
            onClick={() => router.push("/investments")}
          >
            전체 보기
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {ongoingProjects.length > 0 ? (
          <div className="space-y-4">
            {ongoingProjects.map((webtoon) => (
              <Card
                key={webtoon.id}
                className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-white dark:bg-darkblue/30"
                onClick={() => router.push(`/webtoon/${webtoon.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-darkblue dark:text-light mb-1">{webtoon.title}</h3>
                      <p className="text-sm text-gray">{webtoon.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {webtoon.daysLeft && webtoon.daysLeft > 0 && (
                        <Badge className="bg-yellow/20 text-yellow border-yellow/30">
                          <Clock className="h-3 w-3 mr-1" />
                          {webtoon.daysLeft}일
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray">목표 금액</p>
                      <p className="font-medium text-darkblue dark:text-light">{webtoon.fundingGoal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray">예상 수익률</p>
                      <p className="font-medium text-profit">{webtoon.expectedROI}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray">모집 진행률</p>
                      <p className="text-xs text-darkblue dark:text-light">{webtoon.fundingPercentage || 0}%</p>
                    </div>
                    <Progress
                      value={webtoon.fundingPercentage || 0}
                      className="h-2 bg-gray/20"
                      indicatorClassName="bg-green"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray">
            <p>현재 투자 가능한 웹툰이 없습니다.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-xl border-green text-green hover:bg-green/10"
              onClick={() => router.push("/webtoons")}
            >
              웹툰 둘러보기
            </Button>
          </div>
        )}
      </div>

      {/* 빠른 액션 버튼들 */}
      <div className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-16 rounded-xl border-green/30 bg-green/5 hover:bg-green/10 flex flex-col items-center justify-center"
            onClick={() => router.push("/investments")}
          >
            <BarChart3 className="h-6 w-6 text-green mb-1" />
            <span className="text-sm font-medium text-green">투자 프로젝트</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 rounded-xl border-yellow/30 bg-yellow/5 hover:bg-yellow/10 flex flex-col items-center justify-center"
            onClick={() => router.push("/community")}
          >
            <Users className="h-6 w-6 text-yellow mb-1" />
            <span className="text-sm font-medium text-yellow">커뮤니티</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
