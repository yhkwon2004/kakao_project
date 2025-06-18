"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, TrendingUp, Calendar, CheckCircle, Star, Play, Award, Download, Eye } from "lucide-react"
import { Logo } from "@/components/logo"
import { formatKoreanCurrency } from "@/lib/format-currency"
import { getWebtoonById } from "@/data/webtoons"
import { getUserFromStorage } from "@/lib/auth"

interface CompletedProject {
  id: string
  title: string
  thumbnail: string
  investmentAmount: number
  currentValue: number
  returnAmount: number
  returnRate: number
  completedDate: string
  status: "completed" | "distributed"
  category: string
  totalEpisodes?: number
  viewCount?: number
  rating?: number
}

export function CompletedProjectsScreen() {
  const router = useRouter()
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalReturn, setTotalReturn] = useState(0)
  const [totalMyReturn, setTotalMyReturn] = useState(0)

  const getFontSizeForAmount = (amount: number) => {
    const amountStr = formatKoreanCurrency(amount)
    if (amountStr.length > 12) return "text-sm"
    if (amountStr.length > 10) return "text-base"
    if (amountStr.length > 8) return "text-lg"
    return "text-xl"
  }

  useEffect(() => {
    const loadCompletedProjects = () => {
      const user = getUserFromStorage()
      if (!user) return

      // 실제로는 서버에서 완료된 프로젝트 데이터를 가져와야 함
      // 여기서는 localStorage의 투자 내역 중 완료된 것들을 필터링
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        const investments = JSON.parse(investmentsStr)
        const completed = investments
          .filter((inv: any) => inv.status === "완료")
          .map((inv: any) => {
            const webtoonData = getWebtoonById(inv.id)
            const returnRate = inv.expectedROI || 25 // 예상 수익률
            const currentValue = Math.round(inv.amount * (1 + returnRate / 100))
            const returnAmount = currentValue - inv.amount

            return {
              id: inv.id,
              title: webtoonData?.title || inv.title,
              thumbnail: webtoonData?.thumbnail || inv.thumbnail,
              investmentAmount: inv.amount,
              currentValue,
              returnAmount,
              returnRate,
              completedDate: inv.completedDate || "2024-01-20",
              status: inv.distributionStatus || "completed",
              category: webtoonData?.category || "드라마",
              totalEpisodes: 12,
              viewCount: Math.floor(Math.random() * 1000000) + 500000,
              rating: 4.2 + Math.random() * 0.6,
            }
          })

        setCompletedProjects(completed)

        // 총계 계산
        const totalInv = completed.reduce((sum: number, proj: CompletedProject) => sum + proj.investmentAmount, 0)
        const totalRet = completed.reduce((sum: number, proj: CompletedProject) => sum + proj.currentValue, 0)
        const totalMyRet = completed.reduce((sum: number, proj: CompletedProject) => sum + proj.returnAmount, 0)

        setTotalInvestment(totalInv)
        setTotalReturn(totalRet)
        setTotalMyReturn(totalMyRet)
      }
    }

    loadCompletedProjects()

    // 데이터 변경 감지
    const handleDataChange = () => {
      loadCompletedProjects()
    }

    window.addEventListener("storage", handleDataChange)
    window.addEventListener("investmentUpdate", handleDataChange)

    return () => {
      window.removeEventListener("storage", handleDataChange)
      window.removeEventListener("investmentUpdate", handleDataChange)
    }
  }, [])

  const averageReturnRate =
    completedProjects.length > 0
      ? completedProjects.reduce((sum, proj) => sum + proj.returnRate, 0) / completedProjects.length
      : 0

  const handleProjectClick = (projectId: string) => {
    router.push(`/webtoon/${projectId}`)
  }

  const handleDownloadReport = (project: CompletedProject) => {
    // 실제로는 PDF 리포트 생성 및 다운로드
    alert(`${project.title} 투자 리포트를 다운로드합니다.`)
  }

  return (
    <div className="flex flex-col pb-20 bg-gradient-to-br from-[#FAFAFA] to-[#F0F0F0] dark:from-[#323233] dark:to-[#2A2A2B]">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-[#C2BDAD]/20 bg-[#FAFAFA]/80 dark:bg-[#3F3F3F]/80 backdrop-blur-sm sticky top-0 z-40 h-16">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5 text-[#58678C]" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      <div className="p-4 space-y-6">
        {/* 투자 성과 요약 */}
        <Card className="bg-gradient-to-br from-[#4F8F78] to-[#6CB9B1] text-white border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">완료된 투자 성과</h2>
                <p className="text-white/80 text-sm">성공적으로 완료된 프로젝트들</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-white/80 text-xs mb-1">총 투자금</p>
                <p className={`${getFontSizeForAmount(totalInvestment)} font-bold truncate`}>
                  {formatKoreanCurrency(totalInvestment)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-xs mb-1">총 수익</p>
                <p className={`${getFontSizeForAmount(totalMyReturn)} font-bold text-[#F9DF52] truncate`}>
                  +{formatKoreanCurrency(totalMyReturn)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/80 text-xs mb-1">평균 수익률</p>
                <p className={`${getFontSizeForAmount(Math.abs(averageReturnRate))} font-bold text-[#F9DF52] truncate`}>
                  +{averageReturnRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">총 현재 가치</span>
                <span className={`${getFontSizeForAmount(totalReturn)} font-bold truncate`}>
                  {formatKoreanCurrency(totalReturn)}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F9DF52] to-[#F5C882] transition-all duration-1000"
                  style={{ width: `${Math.min((totalMyReturn / totalInvestment) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 완료된 프로젝트 목록 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">완료된 프로젝트</h3>
            <Badge className="bg-[#4F8F78]/10 text-[#4F8F78] border-[#4F8F78]/20">
              {completedProjects.length}개 완료
            </Badge>
          </div>

          {completedProjects.length > 0 ? (
            <div className="space-y-4">
              {completedProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F] shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* 썸네일 */}
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <img
                          src={project.thumbnail || "/placeholder.svg?height=128&width=96"}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <div className="bg-[#4F8F78] text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-[#F9DF52] to-[#F5C882] text-[#323233] px-2 py-1 rounded-full shadow-lg">
                          <span className="text-xs font-bold">+{project.returnRate}%</span>
                        </div>
                      </div>

                      {/* 프로젝트 정보 */}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-[#323233] dark:text-[#F5D949] mb-1 text-base leading-tight">
                              {project.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-[#989898] mb-2">
                              <Calendar className="h-3 w-3" />
                              <span>완료일: {project.completedDate}</span>
                            </div>
                          </div>
                          <Badge
                            className={`ml-2 ${
                              project.status === "distributed"
                                ? "bg-[#4F8F78]/10 text-[#4F8F78] border-[#4F8F78]/20"
                                : "bg-[#5F859F]/10 text-[#5F859F] border-[#5F859F]/20"
                            }`}
                          >
                            {project.status === "distributed" ? "수익 분배됨" : "완료"}
                          </Badge>
                        </div>

                        {/* 투자 성과 */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-[#E5E4DC]/50 dark:bg-[#454858]/30 p-3 rounded-lg">
                            <p className="text-xs text-[#989898] mb-1">투자 금액</p>
                            <p
                              className={`${getFontSizeForAmount(project.investmentAmount)} font-bold text-[#323233] dark:text-[#F5D949] truncate`}
                            >
                              {formatKoreanCurrency(project.investmentAmount)}
                            </p>
                          </div>
                          <div className="bg-[#4F8F78]/10 dark:bg-[#4F8F78]/20 p-3 rounded-lg">
                            <p className="text-xs text-[#989898] mb-1">현재 가치</p>
                            <p
                              className={`${getFontSizeForAmount(project.currentValue)} font-bold text-[#4F8F78] truncate`}
                            >
                              {formatKoreanCurrency(project.currentValue)}
                            </p>
                          </div>
                        </div>

                        {/* 수익 정보 */}
                        <div className="bg-gradient-to-r from-[#F9DF52]/10 to-[#F5C882]/10 p-3 rounded-lg mb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-[#F9DF52]" />
                              <span className="text-xs text-[#989898]">수익</span>
                            </div>
                            <div className="text-right">
                              <p
                                className={`${getFontSizeForAmount(project.returnAmount)} font-bold text-[#F9DF52] truncate`}
                              >
                                +{formatKoreanCurrency(project.returnAmount)}
                              </p>
                              <p className="text-xs text-[#F9DF52]">+{project.returnRate}%</p>
                            </div>
                          </div>
                        </div>

                        {/* 프로젝트 성과 */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center bg-[#5F859F]/10 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Play className="h-3 w-3 text-[#5F859F]" />
                              <span className="text-xs text-[#989898]">에피소드</span>
                            </div>
                            <p className="text-sm font-bold text-[#5F859F]">{project.totalEpisodes}화</p>
                          </div>
                          <div className="text-center bg-[#706FB9]/10 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Eye className="h-3 w-3 text-[#706FB9]" />
                              <span className="text-xs text-[#989898]">조회수</span>
                            </div>
                            <p className="text-sm font-bold text-[#706FB9]">
                              {project.viewCount ? `${Math.floor(project.viewCount! / 10000)}만` : "0"}
                            </p>
                          </div>
                          <div className="text-center bg-[#F9DF52]/10 p-2 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Star className="h-3 w-3 text-[#F9DF52]" />
                              <span className="text-xs text-[#989898]">평점</span>
                            </div>
                            <p className="text-sm font-bold text-[#F9DF52]">{project.rating?.toFixed(1)}</p>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadReport(project)
                            }}
                            className="flex-1 border-[#C2BDAD] text-[#989898] hover:bg-[#E5E4DC] dark:hover:bg-[#454858] text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            리포트
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleProjectClick(project.id)
                            }}
                            className="flex-1 bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] text-xs"
                          >
                            상세보기
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-[#C2BDAD]/20 bg-white dark:bg-[#3F3F3F]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-[#E5E4DC] dark:bg-[#454858] rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-[#989898]" />
                </div>
                <h3 className="text-lg font-bold text-[#323233] dark:text-[#F5D949] mb-2">
                  완료된 프로젝트가 없습니다
                </h3>
                <p className="text-[#989898] text-center mb-4">투자한 프로젝트가 완료되면 여기에 표시됩니다.</p>
                <Button
                  onClick={() => router.push("/webtoons")}
                  className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233]"
                >
                  투자 가능한 웹툰 보기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
