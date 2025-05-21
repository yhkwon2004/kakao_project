"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, ChevronRight, PieChart, User } from "lucide-react"

export function PortfolioScreen() {
  const router = useRouter()

  // Mock portfolio data
  const portfolioSummary = {
    totalInvested: 1500000,
    totalProjects: 5,
    expectedReturns: 1875000,
    averageROI: 25,
  }

  const investments = [
    {
      id: "3",
      title: "황녀, 반역자를 각인시키다",
      amount: 500000,
      progress: 75,
      expectedROI: 15,
      status: "In Production",
    },
    {
      id: "5",
      title: "검술명가 막내아들",
      amount: 350000,
      progress: 60,
      expectedROI: 22,
      status: "Pre-Production",
    },
    {
      id: "1",
      title: "이번 생은 가주가 되겠습니다",
      amount: 650000,
      progress: 90,
      expectedROI: 18,
      status: "In Production",
    },
  ]

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Portfolio</h1>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/my-page")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Profile" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden mb-6">
          <CardHeader className="p-4 bg-gradient-to-r from-[#FF8A00]/10 to-[#FFCC00]/10">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">Portfolio Summary</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <BarChart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <PieChart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#8E8E93]">Total Invested</p>
                <p className="text-xl font-bold">₩{portfolioSummary.totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Total Projects</p>
                <p className="text-xl font-bold">{portfolioSummary.totalProjects}</p>
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Expected Returns</p>
                <p className="text-xl font-bold text-[#FF8A00]">₩{portfolioSummary.expectedReturns.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-[#8E8E93]">Average ROI</p>
                <p className="text-xl font-bold text-[#FF8A00]">{portfolioSummary.averageROI}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">My Investments</h2>
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all" className="rounded-full text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="active" className="rounded-full text-xs">
                Active
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-full text-xs">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {investments.map((investment) => (
            <Card
              key={investment.id}
              className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/webtoon/${investment.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{investment.title}</h3>
                    <p className="text-xs text-[#8E8E93]">{investment.status}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <p className="text-xs text-[#8E8E93]">Invested Amount</p>
                    <p className="font-medium">₩{investment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8E8E93]">Expected ROI</p>
                    <p className="font-medium text-[#FF8A00]">{investment.expectedROI}%</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-[#8E8E93]">Production Progress</p>
                    <p className="text-xs">{investment.progress}%</p>
                  </div>
                  <Progress value={investment.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
