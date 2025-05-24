"use client"

import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp, Wallet, Play, Search, BookOpen, DollarSign } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { featuredDramas, investmentWebtoons } from "@/data/webtoons"

export function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState(150000)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)

  // 사용자 정보 로드
  useEffect(() => {
    const user = getUserFromStorage()
    if (user) {
      setUserName(user.name || "사용자")
      setProfileImage(user.profileImage || null)
      setUserBalance(user.balance || 150000)
    }

    // 투자 내역 로드
    const investmentsStr = localStorage.getItem("userInvestments")
    if (investmentsStr) {
      try {
        const investments = JSON.parse(investmentsStr)
        const total = investments.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0)
        setTotalInvested(total)
        setTotalProjects(investments.length)
      } catch (error) {
        setTotalInvested(0)
        setTotalProjects(0)
      }
    }
  }, [])

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  // 진행 중인 투자 프로젝트 (상위 4개)
  const ongoingProjects = investmentWebtoons.filter((webtoon) => webtoon.status === "ongoing").slice(0, 4)

  return (
    <div className="flex flex-col h-screen pb-20 bg-light dark:bg-dark overflow-hidden">
      {/* 헤더 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10 flex-shrink-0">
        <Logo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/webtoons")}>
            <Search className="h-5 w-5 text-gray" />
          </Button>
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push("/mypage")}>
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="text-darkblue bg-yellow/20">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 환영 메시지 & 잔액 */}
        <div className="p-4">
          <div className="bg-gradient-to-r from-green/10 to-yellow/10 rounded-2xl p-4 border border-green/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-bold text-darkblue dark:text-light">안녕하세요, {userName}님!</h1>
                <p className="text-sm text-gray">오늘의 투자 기회를 확인해보세요</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray">내 잔액</p>
                <p className="text-lg font-bold text-green">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 투자 현황 (투자한 경우만 표시) */}
        {totalProjects > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-white dark:bg-darkblue/30 rounded-xl p-4 border border-gray/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">내 투자</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/asset")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-gray">투자 프로젝트</p>
                  <p className="font-bold text-darkblue dark:text-light">{totalProjects}개</p>
                </div>
                <div>
                  <p className="text-xs text-gray">총 투자액</p>
                  <p className="font-bold text-blue-600">{formatCurrency(totalInvested)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 드라마화된 인기 웹툰 - 가로 스크롤 */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Play className="h-4 w-4 text-green mr-2" />
              <h2 className="font-bold text-darkblue dark:text-light">드라마화 웹툰</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {featuredDramas.slice(0, 6).map((drama) => (
                <div
                  key={drama.id}
                  className="flex-shrink-0 w-20 cursor-pointer"
                  onClick={() => router.push(`/webtoon/${drama.id}`)}
                >
                  <div className="relative h-28 w-20 rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={drama.thumbnail || "/placeholder.svg"}
                      alt={drama.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-green/90 text-white text-xs px-1 py-0">
                        <Play className="h-2 w-2" />
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-darkblue dark:text-light line-clamp-2 leading-tight">
                    {drama.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 투자 가능한 웹툰 - 카드 형태 */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-yellow mr-2" />
              <h2 className="font-bold text-darkblue dark:text-light">투자 가능한 웹툰</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-green" onClick={() => router.push("/webtoons")}>
              전체 웹툰
            </Button>
          </div>

          {ongoingProjects.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {ongoingProjects.map((webtoon) => (
                <Card
                  key={webtoon.id}
                  className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray/20 bg-white dark:bg-darkblue/30"
                  onClick={() => router.push(`/webtoon/${webtoon.id}`)}
                >
                  <div className="relative h-32 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={webtoon.thumbnail || "/placeholder.svg"}
                      alt={webtoon.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow/90 text-dark text-xs">{webtoon.daysLeft}일</Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="text-white">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span>{webtoon.fundingPercentage || 0}%</span>
                          <span>{webtoon.expectedROI}</span>
                        </div>
                        <Progress
                          value={webtoon.fundingPercentage || 0}
                          className="h-1 bg-white/30"
                          indicatorClassName="bg-green"
                        />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm text-darkblue dark:text-light line-clamp-1 mb-1">
                      {webtoon.title}
                    </h3>
                    <p className="text-xs text-gray line-clamp-1">{webtoon.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray">
              <p className="text-sm">현재 투자 가능한 웹툰이 없습니다</p>
            </div>
          )}
        </div>

        {/* 이용 방법 */}
        <div className="px-4 pb-4">
          <h2 className="font-bold text-darkblue dark:text-light mb-3 text-center">이용 방법</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow/20 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="h-6 w-6 text-yellow" />
              </div>
              <p className="text-xs font-medium text-darkblue dark:text-light">웹툰 탐색</p>
              <p className="text-xs text-gray mt-1">인기 웹툰 둘러보기</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green/20 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-green" />
              </div>
              <p className="text-xs font-medium text-darkblue dark:text-light">투자하기</p>
              <p className="text-xs text-gray mt-1">마음에 드는 작품에 투자</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue/20 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-darkblue dark:text-light">수익 확인</p>
              <p className="text-xs text-gray mt-1">실시간 수익률 체크</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
