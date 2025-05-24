"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MessageSquare, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// 완료된 프로젝트 데이터 타입
interface CompletedProject {
  id: string
  title: string
  genre: string
  investedAmount: number
  returnAmount: number
  roi: number
  completionDate: string
  investors: number
  hasFeedback: boolean
  thumbnail: string
  slug: string
  feedback: string
  adaptationInterest: string
  investmentDate: string // 투자일 추가
}

export function CompletedProjectsScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<CompletedProject | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [adaptationInterest, setAdaptationInterest] = useState("high")
  const [completedProjects, setCompletedProjects] = useState<CompletedProject[]>([])

  // 완료된 프로젝트 데이터 초기값
  const defaultCompletedProjects: CompletedProject[] = [
    {
      id: "bad-secretary",
      title: "나쁜 비서",
      genre: "로맨스, 드라마",
      investedAmount: 3400000,
      returnAmount: 3910000,
      roi: 15,
      completionDate: "2023-04-15",
      investors: 342,
      hasFeedback: false,
      thumbnail: "/images/나쁜-비서.jpg",
      slug: "bad-secretary",
      feedback: "",
      adaptationInterest: "",
      investmentDate: "2023-04-01",
    },
    {
      id: "blood-sword-family-hunting-dog",
      title: "철혈검가 사냥개의 회귀",
      genre: "액션, 판타지",
      investedAmount: 2800000,
      returnAmount: 3360000,
      roi: 20,
      completionDate: "2023-06-22",
      investors: 256,
      hasFeedback: true,
      thumbnail: "/webtoons/검술명가-막내아들.png",
      slug: "blood-sword-family-hunting-dog", // 라우팅 경로 수정
      feedback:
        "캐릭터의 성장 과정과 액션 장면이 인상적이었습니다. 특히 주인공의 복수 스토리가 드라마틱하게 전개되어 몰입감이 뛰어났습니다. 드라마화된다면 액션 장면에 중점을 두면 좋을 것 같습니다.",
      adaptationInterest: "high",
      investmentDate: "2023-05-20", // 투자일 설정
    },
  ]

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드 또는 초기 데이터 저장
  useEffect(() => {
    // 로컬 스토리지에서 완료된 프로젝트 데이터 로드
    const storedProjects = localStorage.getItem("completedProjects")
    if (storedProjects) {
      setCompletedProjects(JSON.parse(storedProjects))
    } else {
      // 초기 데이터 저장
      setCompletedProjects(defaultCompletedProjects)
      localStorage.setItem("completedProjects", JSON.stringify(defaultCompletedProjects))

      // 자산 관리와 연결을 위해 완료된 투자 데이터도 저장
      const completedInvestments = defaultCompletedProjects.map((project) => ({
        id: project.id,
        title: project.title,
        amount: project.investedAmount,
        progress: 100, // 완료됨
        expectedROI: project.roi,
        status: "완료됨",
        slug: project.slug,
        date: project.investmentDate,
      }))

      // 기존 투자 데이터와 병합
      const existingInvestments = JSON.parse(localStorage.getItem("userInvestments") || "[]")
      const updatedInvestments = [...existingInvestments]

      // 중복 방지를 위해 ID 체크 후 추가
      completedInvestments.forEach((newInv) => {
        if (!updatedInvestments.some((inv) => inv.id === newInv.id)) {
          updatedInvestments.push(newInv)
        }
      })

      localStorage.setItem("userInvestments", JSON.stringify(updatedInvestments))

      // 데이터 변경 이벤트 발생
      window.dispatchEvent(new Event("userDataChanged"))
    }
  }, [])

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
    e.stopPropagation() // 이벤트 버블링 방지
    setCurrentProject(project)
    setFeedbackText(project.feedback || "")
    setAdaptationInterest(project.adaptationInterest || "high")
    setFeedbackOpen(true)
  }

  const handleFeedbackSubmit = () => {
    if (!currentProject) return

    // 피드백 데이터 업데이트
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

    // 로컬 스토리지에 저장
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
