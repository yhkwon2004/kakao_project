"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, MessageSquare, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"

export function CompletedProjectsScreen() {
  const router = useRouter()

  // 완료된 프로젝트 데이터
  const completedProjects = [
    {
      id: "101",
      title: "그림자 기사단의 귀환",
      genre: "판타지, 액션",
      investedAmount: 450000,
      returnAmount: 540000,
      roi: 20,
      completionDate: "2023-01-15",
      investors: 342,
      hasFeedback: false,
    },
    {
      id: "102",
      title: "마법사의 신부",
      genre: "로맨스, 판타지",
      investedAmount: 300000,
      returnAmount: 390000,
      roi: 30,
      completionDate: "2023-03-22",
      investors: 256,
      hasFeedback: true,
    },
    {
      id: "103",
      title: "황제의 귀환",
      genre: "판타지, 액션",
      investedAmount: 700000,
      returnAmount: 770000,
      roi: 10,
      completionDate: "2023-04-10",
      investors: 512,
      hasFeedback: false,
    },
  ]

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
                  ₩{completedProjects.reduce((sum, p) => sum + p.investedAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                <p className="text-sm text-gray">총 수익 금액</p>
                <p className="text-xl font-bold text-profit">
                  ₩{completedProjects.reduce((sum, p) => sum + p.returnAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                <p className="text-sm text-gray">평균 수익률</p>
                <p className="text-xl font-bold text-profit">
                  {Math.round(completedProjects.reduce((sum, p) => sum + p.roi, 0) / completedProjects.length)}%
                </p>
              </div>
              <div className="bg-light dark:bg-darkblue/20 p-3 rounded-xl">
                <p className="text-sm text-gray">완료된 프로젝트</p>
                <p className="text-xl font-bold text-darkblue dark:text-light">{completedProjects.length}개</p>
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
              className="rounded-xl overflow-hidden border-gray/20 bg-light dark:bg-darkblue/30 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-darkblue dark:text-light">{project.title}</h3>
                      <Badge variant="outline" className="rounded-full bg-yellow/10 text-yellow border-none">
                        완료됨
                      </Badge>
                    </div>
                    <p className="text-xs text-gray">{project.genre}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray">투자 금액</p>
                    <p className="font-medium text-darkblue dark:text-light">
                      ₩{project.investedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray">수익 금액</p>
                    <p className="font-medium text-profit">₩{project.returnAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xs text-gray">최종 수익률</p>
                    <p className="font-medium text-profit">{project.roi}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray">완료일</p>
                    <p className="text-xs text-darkblue dark:text-light">{project.completionDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray">투자자 수</p>
                    <p className="text-xs text-darkblue dark:text-light">{project.investors}명</p>
                  </div>
                </div>

                <Button
                  variant={project.hasFeedback ? "outline" : "default"}
                  className={`w-full rounded-xl ${
                    project.hasFeedback ? "border-gray text-gray" : "bg-yellow hover:bg-yellow/90 text-dark"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {project.hasFeedback ? "피드백 수정하기" : "피드백 남기기"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
