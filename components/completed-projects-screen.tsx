"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MessageSquare, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

interface CompletedProjectsScreenProps {
  completedProjects: any[] // Replace 'any' with a more specific type if possible
}

interface CompletedProject {
  id: string
  title: string
  slug: string
  genre: string
  thumbnail: string
  investedAmount: number
  returnAmount: number
  roi: number
  investmentDate: string
  completionDate: string
  feedback?: string
  adaptationInterest?: string
  hasFeedback?: boolean
}

export function CompletedProjectsScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<CompletedProject | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [adaptationInterest, setAdaptationInterest] = useState("high")
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])

  // 컴포넌트 마운트 시 빈 배열로 초기화 (이메일 로그인 사용자는 초기 데이터 없음)
  useEffect(() => {
    // 완료된 프로젝트 로드
    const loadCompletedProjects = () => {
      const storedProjects = localStorage.getItem("completedProjects")
      const existingCompleted = storedProjects ? JSON.parse(storedProjects) : []

      // 투자 내역에서 100% 완료된 프로젝트 찾기
      const investmentsStr = localStorage.getItem("userInvestments")
      if (investmentsStr) {
        const investments = JSON.parse(investmentsStr)
        const newlyCompleted = investments.filter(
          (inv: any) => inv.progress >= 100 && !existingCompleted.some((comp: any) => comp.id === inv.webtoonId),
        )

        // 새로 완료된 프로젝트들을 completedProjects에 추가
        const updatedCompleted = [
          ...existingCompleted,
          ...newlyCompleted.map((inv: any) => ({
            id: inv.webtoonId,
            title: inv.webtoonTitle || inv.title,
            slug: inv.slug || inv.webtoonId,
            genre: "판타지, 로맨스", // 기본값
            thumbnail: inv.webtoonThumbnail || inv.thumbnail || "/placeholder.svg",
            investedAmount: inv.amount,
            returnAmount: Math.round(inv.amount * 1.15), // 15% 수익률 가정
            roi: 15,
            investmentDate: inv.date,
            completionDate: new Date().toISOString().split("T")[0],
            hasFeedback: false,
          })),
        ]

        if (newlyCompleted.length > 0) {
          localStorage.setItem("completedProjects", JSON.stringify(updatedCompleted))
        }

        setCompletedProjects(updatedCompleted)
      } else {
        setCompletedProjects(existingCompleted)
      }
    }

    loadCompletedProjects()

    // storage 이벤트 리스너 추가
    const handleStorageChange = () => {
      loadCompletedProjects()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("userDataChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userDataChanged", handleStorageChange)
    }
  }, [])

  // 나머지 기존 로직들은 그대로 유지하되, completedProjects가 빈 배열일 때의 UI 처리

  // 투자 성과 요약 계산 - 안전한 계산으로 수정
  const totalInvestedAmount = completedProjects.reduce((sum, p) => sum + (p?.investedAmount || 0), 0)
  const totalReturnAmount = completedProjects.reduce((sum, p) => sum + (p?.returnAmount || 0), 0)
  const averageROI =
    completedProjects.length > 0
      ? Math.round(completedProjects.reduce((sum, p) => sum + (p?.roi || 0), 0) / completedProjects.length)
      : 0
  const completedProjectsCount = completedProjects?.length || 0

  const handleProjectClick = (slug: string) => {
    router.push(`/webtoon/${slug}`)
  }

  const openFeedbackDialog = (project: CompletedProject, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentProject(project)
    setFeedbackText(project.feedback || "")
    setAdaptationInterest(project.adaptationInterest || "high")
    setFeedbackOpen(true)
  }

  const handleFeedbackSubmit = () => {
    if (!currentProject) return

    const updatedProjects = completedProjects.map((project) =>
      project.id === currentProject.id
        ? {
            ...project,
            feedback: feedbackText,
            adaptationInterest,
            hasFeedback: true,
          }
        : project,
    )

    localStorage.setItem("completedProjects", JSON.stringify(updatedProjects))
    setCompletedProjects(updatedProjects)

    toast({
      title: "피드백이 제출되었습니다",
      description: "소중한 의견 감사합니다. 제작사에 전달하겠습니다.",
    })
    setFeedbackOpen(false)
  }

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b border-gray/10">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Logo size="sm" showSubtitle={false} />
      </div>

      {completedProjects.length === 0 ? (
        // 빈 상태 UI
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-darkblue dark:text-light mb-2">아직 종료된 프로젝트가 없습니다</h2>
          <p className="text-gray text-center mb-6">투자한 웹툰이 완료되면 여기에서 확인할 수 있습니다</p>
          <Button
            onClick={() => router.push("/webtoons")}
            className="bg-gradient-to-r from-yellow to-orange-400 hover:from-yellow/90 hover:to-orange-400/90 text-dark font-medium px-6"
          >
            웹툰 둘러보기
          </Button>
        </div>
      ) : (
        <>
          {/* 완료된 프로젝트 요약 */}
          <div className="p-4">
            <Card className="rounded-xl mb-6 border-gray/20 bg-light dark:bg-darkblue/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-profit" />
                  <h2 className="font-bold text-darkblue dark:text-light">투자 성과 요약</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                    <p className="text-sm text-gray">총 투자 금액</p>
                    <p className="text-xl font-bold text-darkblue dark:text-light">
                      ₩{(totalInvestedAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                    <p className="text-sm text-gray">총 수익 금액</p>
                    <p className="text-xl font-bold text-profit">₩{(totalReturnAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                    <p className="text-sm text-gray">평균 수익률</p>
                    <p className="text-xl font-bold text-profit">{averageROI || 0}%</p>
                  </div>
                  <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                    <p className="text-sm text-gray">완료된 프로젝트</p>
                    <p className="text-xl font-bold text-darkblue dark:text-light">{completedProjectsCount || 0}개</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 완료된 프로젝트 목록 */}
          <div className="p-4">
            <h2 className="font-bold mb-4 text-darkblue dark:text-light">종료된 프로젝트</h2>
            <div className="space-y-4">
              {completedProjects.map((project) => (
                <Card
                  key={project.id}
                  className="rounded-xl overflow-hidden border-gray/20 bg-light dark:bg-darkblue/30 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProjectClick(project.slug)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={
                            project.thumbnail ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(project.title) || "/placeholder.svg"}`
                          }
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-darkblue dark:text-light">{project.title}</h3>
                          <Badge variant="outline" className="rounded-full bg-yellow/10 text-yellow border-none">
                            완료됨
                          </Badge>
                        </div>
                        <p className="text-xs text-gray">{project.genre}</p>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-gray">투자 금액</p>
                            <p className="font-medium text-darkblue dark:text-light">
                              ₩{(project?.investedAmount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray">수익 금액</p>
                            <p className="font-medium text-profit">₩{(project?.returnAmount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray self-center" />
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray/10">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray">최종 수익률</p>
                          <p className="font-medium text-profit">{project?.roi || 0}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray">투자일</p>
                          <p className="text-xs text-darkblue dark:text-light">{project.investmentDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray">완료일</p>
                          <p className="text-xs text-darkblue dark:text-light">{project.completionDate}</p>
                        </div>
                      </div>

                      <Button
                        variant={project.hasFeedback ? "outline" : "default"}
                        size="sm"
                        className={`rounded-xl ${
                          project.hasFeedback ? "border-gray text-gray" : "bg-yellow hover:bg-yellow/90 text-dark"
                        }`}
                        onClick={(e) => openFeedbackDialog(project, e)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {project.hasFeedback ? "피드백 수정하기" : "피드백 남기기"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 피드백 다이얼로그 */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[500px] bg-light dark:bg-darkblue">
          <DialogHeader>
            <DialogTitle className="text-darkblue dark:text-light">투자 후기 및 드라마화 피드백</DialogTitle>
            <DialogDescription>
              {currentProject?.title}에 대한 투자 후기와 드라마화 관련 의견을 남겨주세요. 제작사에 전달됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-darkblue dark:text-light">
                투자 후기 및 드라마화 의견
              </Label>
              <Textarea
                id="feedback"
                placeholder="웹툰의 어떤 점이 좋았는지, 드라마화 시 어떤 부분을 강조하면 좋을지 의견을 남겨주세요."
                className="min-h-[120px] bg-light dark:bg-darkblue/50 border-gray/20"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-darkblue dark:text-light">드라마화 관심도</Label>
              <RadioGroup
                value={adaptationInterest}
                onValueChange={setAdaptationInterest}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-darkblue dark:text-light">
                    매우 관심 있음 (꼭 드라마화 되었으면 함)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-darkblue dark:text-light">
                    관심 있음 (드라마화 되면 좋겠음)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-darkblue dark:text-light">
                    보통 (드라마화보다 다른 콘텐츠 선호)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)} className="border-gray/20 text-gray">
              취소
            </Button>
            <Button onClick={handleFeedbackSubmit} className="bg-yellow hover:bg-yellow/90 text-dark">
              제출하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
