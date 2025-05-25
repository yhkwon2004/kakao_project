"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Calendar, Award, Star, MessageCircle, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { investmentWebtoons } from "@/data/webtoons"

interface CompletedProject {
  id: string
  title: string
  author: string
  thumbnail: string
  completedDate: string
  finalAmount: number
  targetAmount: number
  totalReturn: number
  returnPercentage: number
  investorCount: number
  rating: number
  myInvestment?: number
  myReturn?: number
  slug: string
}

interface Comment {
  id: string
  projectId: string
  text: string
  timestamp: string
}

export function CompletedProjectsScreen() {
  const router = useRouter()
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Get completed webtoons from the data
    const completedWebtoons = investmentWebtoons.filter((webtoon) => webtoon.status === "completed")

    const mockCompletedProjects: CompletedProject[] = completedWebtoons.map((webtoon) => {
      // Define investment data for specific webtoons
      const investmentData: { [key: string]: { myInvestment: number; myReturn: number } } = {
        "bad-secretary": { myInvestment: 500000, myReturn: 104000 },
        "blood-sword-family-hunting-dog": { myInvestment: 750000, myReturn: 135000 },
      }

      const slug = webtoon.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
      const investment = investmentData[slug]

      return {
        id: webtoon.id,
        title: webtoon.title,
        author: webtoon.director || "작가명",
        thumbnail: webtoon.thumbnail || "/placeholder.svg",
        completedDate: "2024-03-15",
        finalAmount: webtoon.currentRaised || webtoon.goalAmount || 100000000,
        targetAmount: webtoon.goalAmount || 100000000,
        totalReturn: 25000000,
        returnPercentage: 20.8,
        investorCount: webtoon.totalInvestors || 1000,
        rating: 4.8,
        myInvestment: investment?.myInvestment,
        myReturn: investment?.myReturn,
        slug: slug,
      }
    })

    setCompletedProjects(mockCompletedProjects)

    // Load existing comments from localStorage
    const savedComments = localStorage.getItem("completedProjectComments")
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
  }, [])

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000000) {
      const eok = Math.floor(amount / 100000000)
      const man = Math.floor((amount % 100000000) / 10000)
      if (man === 0) {
        return `${eok}억원`
      }
      return `${eok}억 ${man.toLocaleString()}만원`
    } else if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`
  }

  const handleCommentSubmit = (projectId: string) => {
    const commentText = newComments[projectId]?.trim()
    if (!commentText) return

    const newComment: Comment = {
      id: Date.now().toString(),
      projectId,
      text: commentText,
      timestamp: new Date().toISOString(),
    }

    const updatedComments = [...comments, newComment]
    setComments(updatedComments)
    localStorage.setItem("completedProjectComments", JSON.stringify(updatedComments))

    setNewComments((prev) => ({ ...prev, [projectId]: "" }))
  }

  const getProjectComments = (projectId: string) => {
    return comments.filter((comment) => comment.projectId === projectId)
  }

  const projectsWithInvestment = completedProjects.filter((project) => project.myInvestment)
  const totalMyInvestment = projectsWithInvestment.reduce((sum, project) => sum + (project.myInvestment || 0), 0)
  const totalMyReturn = projectsWithInvestment.reduce((sum, project) => sum + (project.myReturn || 0), 0)
  const averageReturnRate = totalMyInvestment > 0 ? (totalMyReturn / totalMyInvestment) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F9F9F9] to-[#E5E4DC] dark:from-[#323233] dark:via-[#3F3F3F] dark:to-[#3F4458]">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#FAFAFA]/80 dark:bg-[#323233]/80 backdrop-blur-md border-b border-[#BCBCBC]/50 dark:border-[#454858]/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-[#E5E4DC] dark:hover:bg-[#454858] rounded-xl text-[#323233] dark:text-[#F5D949]"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">뒤로</span>
          </Button>
          <h1 className="text-xl font-bold text-[#323233] dark:text-[#F5D949]">완료된 프로젝트</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* 요약 카드 */}
        {projectsWithInvestment.length > 0 && (
          <div className="bg-gradient-to-r from-[#F9DF52] to-[#F5C882] rounded-2xl p-6 mb-6 text-[#323233] shadow-lg border border-[#C2BDAD]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#323233]/20 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-[#323233]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">투자 성과 요약</h2>
                <p className="text-[#323233]/80 text-sm">완료된 {projectsWithInvestment.length}개 프로젝트</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[#323233]/80 text-xs mb-1">총 투자금</p>
                <p className="font-bold text-lg">{formatCurrency(totalMyInvestment)}</p>
              </div>
              <div className="text-center">
                <p className="text-[#323233]/80 text-xs mb-1">총 수익</p>
                <p className="font-bold text-lg text-[#4F8F78]">+{formatCurrency(totalMyReturn)}</p>
              </div>
              <div className="text-center">
                <p className="text-[#323233]/80 text-xs mb-1">평균 수익률</p>
                <p className="font-bold text-lg text-[#4F8F78]">+{averageReturnRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {completedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-r from-[#C2BDAD] to-[#989898] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle className="h-10 w-10 text-[#323233] dark:text-[#F5D949]" />
            </div>
            <h3 className="text-lg font-semibold text-[#989898] mb-2">완료된 프로젝트가 없습니다</h3>
            <p className="text-sm text-[#989898] text-center">투자한 프로젝트가 완료되면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {completedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-[#FAFAFA] dark:bg-[#3F3F3F] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#C2BDAD] dark:border-[#454858]"
              >
                <div className="flex gap-4 mb-4">
                  {/* 썸네일 */}
                  <div className="relative">
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.title}
                      className="w-20 h-28 object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#4F8F78] to-[#6CB9B1] rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-[#FAFAFA]" />
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-[#323233] dark:text-[#F5D949] text-lg leading-tight">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#989898]">{project.author}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#F9DF52] fill-current" />
                          <span className="text-sm font-medium text-[#323233] dark:text-[#F5C882]">
                            {project.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-[#989898]" />
                          <span className="text-xs text-[#989898]">{formatDate(project.completedDate)} 완료</span>
                        </div>
                      </div>
                    </div>

                    {/* 성과 정보 - 투자 데이터가 있는 경우만 표시 */}
                    {project.myInvestment && (
                      <div className="bg-gradient-to-r from-[#E5E4DC] to-[#C2BDAD] dark:from-[#454858] dark:to-[#383B4B] p-3 rounded-xl">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-[#989898] mb-1">내 투자금</p>
                            <p className="font-bold text-[#323233] dark:text-[#F5D949]">
                              {formatCurrency(project.myInvestment)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#989898] mb-1">내 수익</p>
                            <p className="font-bold text-[#4F8F78]">+{formatCurrency(project.myReturn || 0)}</p>
                          </div>
                          <div>
                            <p className="text-[#989898] mb-1">수익률</p>
                            <p className="font-bold text-[#4F8F78]">
                              +{project.myReturn ? ((project.myReturn / project.myInvestment) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[#989898] mb-1">투자자 수</p>
                            <p className="font-bold text-[#5F859F]">{project.investorCount.toLocaleString()}명</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 프로젝트 성과 */}
                    <div className="bg-gradient-to-r from-[#F9F9F9] to-[#E5E4DC] dark:from-[#3F4458] dark:to-[#383B4B] p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-[#989898]">프로젝트 성과</span>
                        <span className="text-xs font-bold text-[#4F8F78]">
                          목표 달성률 {((project.finalAmount / project.targetAmount) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <p className="text-[#989898]">최종 모금액</p>
                          <p className="font-bold text-[#323233] dark:text-[#F5D949]">
                            {formatCurrency(project.finalAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#989898]">목표 금액</p>
                          <p className="font-bold text-[#323233] dark:text-[#F5C882]">
                            {formatCurrency(project.targetAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 상세보기 버튼 */}
                    <Button
                      onClick={() => router.push(`/webtoon/${project.slug}`)}
                      variant="outline"
                      className="w-full border-2 border-[#5F859F] text-[#5F859F] hover:bg-[#E5E4DC] dark:hover:bg-[#454858] rounded-xl py-3 font-medium"
                    >
                      상세보기
                    </Button>
                  </div>
                </div>

                {/* 댓글 섹션 */}
                <div className="border-t border-[#BCBCBC] dark:border-[#454858] pt-4 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-4 w-4 text-[#5F859F]" />
                    <span className="text-sm font-medium text-[#323233] dark:text-[#F5D949]">댓글</span>
                  </div>

                  {/* 기존 댓글 표시 */}
                  {getProjectComments(project.id).map((comment) => (
                    <div key={comment.id} className="bg-[#F9F9F9] dark:bg-[#383B4B] rounded-lg p-3 mb-2">
                      <p className="text-sm text-[#323233] dark:text-[#F5C882] mb-1">{comment.text}</p>
                      <p className="text-xs text-[#989898]">
                        {new Date(comment.timestamp).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  ))}

                  {/* 새 댓글 입력 */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="이 프로젝트에 대한 의견을 남겨보세요..."
                      value={newComments[project.id] || ""}
                      onChange={(e) => setNewComments((prev) => ({ ...prev, [project.id]: e.target.value }))}
                      className="flex-1 min-h-[80px] border-[#BCBCBC] focus:border-[#5F859F] focus:ring-[#5F859F] bg-[#FAFAFA] dark:bg-[#3F4458] text-[#323233] dark:text-[#F5D949] rounded-xl"
                    />
                    <Button
                      onClick={() => handleCommentSubmit(project.id)}
                      disabled={!newComments[project.id]?.trim()}
                      className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] rounded-xl px-4 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
