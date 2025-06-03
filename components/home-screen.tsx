"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, TrendingUp, Wallet, Play, Search, BookOpen, DollarSign } from "lucide-react"
import { Logo } from "@/components/logo"
import { getUserFromStorage, getUserProfileImage } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { featuredDramas, investmentWebtoons } from "@/data/webtoons"

export function HomeScreen() {
  const router = useRouter()
  const [userName, setUserName] = useState("사용자")
  const [profileImage, setProfileImage] = useState<string>("/images/guest-profile.jpeg")
  const [userBalance, setUserBalance] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)
  const [dynamicWebtoons, setDynamicWebtoons] = useState(investmentWebtoons)

  // 웹툰 진행 상황 업데이트 감지
  useEffect(() => {
    const updateWebtoonProgress = () => {
      const updatedWebtoons = investmentWebtoons.map((webtoon) => {
        const progressData = localStorage.getItem(`webtoon_progress_${webtoon.id}`)
        if (progressData) {
          const data = JSON.parse(progressData)
          const progress = (data.currentRaised / webtoon.goalAmount) * 100
          return {
            ...webtoon,
            currentRaised: data.currentRaised,
            totalInvestors: data.totalInvestors,
            fundingPercentage: Math.round(progress),
          }
        }
        return webtoon
      })
      setDynamicWebtoons(updatedWebtoons)
    }

    updateWebtoonProgress()

    // 웹툰 진행 상황 업데이트 이벤트 리스너
    const handleProgressUpdate = () => {
      updateWebtoonProgress()
    }

    window.addEventListener("webtoonProgressUpdate", handleProgressUpdate)
    window.addEventListener("storage", handleProgressUpdate)

    return () => {
      window.removeEventListener("webtoonProgressUpdate", handleProgressUpdate)
      window.removeEventListener("storage", handleProgressUpdate)
    }
  }, [])

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      const user = getUserFromStorage()
      if (user) {
        setUserName(user.name || "사용자")
        setProfileImage(getUserProfileImage(user))
        // 잔액이 undefined인 경우에만 기본값 설정
        if (user.balance === undefined) {
          user.balance = 150000
          localStorage.setItem("currentUser", JSON.stringify(user))
        }
        setUserBalance(user.balance)
      } else {
        // 사용자가 없는 경우 게스트 프로필 이미지 사용
        setProfileImage("/images/guest-profile.jpeg")
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
    }

    loadUserData()

    // 사용자 데이터 변경 감지
    const handleUserDataChange = () => {
      loadUserData()
    }

    window.addEventListener("userDataChanged", handleUserDataChange)
    window.addEventListener("storage", handleUserDataChange)
    window.addEventListener("investmentUpdate", handleUserDataChange)

    return () => {
      window.removeEventListener("userDataChanged", handleUserDataChange)
      window.removeEventListener("storage", handleUserDataChange)
      window.removeEventListener("investmentUpdate", handleUserDataChange)
    }
  }, [])

  // 금액 포맷팅 - 억과 만단위 처리
  const formatCurrency = (amount: number): string => {
    if (amount >= 100000000) {
      // 1억 이상
      const eok = Math.floor(amount / 100000000)
      const man = Math.floor((amount % 100000000) / 10000)
      if (man > 0) {
        return `${eok}억 ${man.toLocaleString()}만원`
      }
      return `${eok}억원`
    } else if (amount >= 10000) {
      // 1만원 이상
      return `${Math.floor(amount / 10000).toLocaleString()}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  // 진행 중인 투자 프로젝트 (상위 4개)
  const ongoingProjects = dynamicWebtoons.filter((webtoon) => webtoon.status === "ongoing").slice(0, 4)

  return (
    <div className="flex flex-col h-screen pb-20 bg-light dark:bg-dark overflow-hidden">
      {/* 헤더 */}
      <div className="h-16 flex justify-between items-center px-4 border-b border-gray/10 bg-light/80 dark:bg-dark/80 backdrop-blur-md sticky top-0 z-40 flex-shrink-0">
        <Logo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hover:bg-gray/10" onClick={() => router.push("/webtoons")}>
            <Search className="h-5 w-5 text-gray" />
          </Button>
          <Avatar
            className="h-10 w-10 cursor-pointer ring-2 ring-yellow/20 hover:ring-yellow/40 transition-all duration-200 shadow-sm"
            onClick={() => router.push("/mypage")}
          >
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} className="object-cover" />
            <AvatarFallback className="text-darkblue bg-gradient-to-br from-yellow/30 to-yellow/20 font-semibold text-sm">
              {userName.charAt(0)}
            </AvatarFallback>
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
                      <Badge className="bg-yellow/90 text-dark text-xs font-bold px-2 py-1">
                        {webtoon.daysLeft}일 남음
                      </Badge>
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
                              className="h-full bg-gradient-to-r from-green to-yellow transition-all duration-700 ease-out"
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
                          <span className="text-yellow font-medium">
                            최소 {formatCurrency(webtoon.minInvestment || 10000)}
                          </span>
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
