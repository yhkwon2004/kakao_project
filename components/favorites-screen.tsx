"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"

export function FavoritesScreen() {
  const router = useRouter()

  // 관심 웹툰 데이터
  const favoriteWebtoons = [
    {
      id: "1",
      title: "이번 생은 가주가 되겠습니다",
      genre: "로맨스, 판타지",
      status: "투자 가능",
      notification: true,
    },
    {
      id: "3",
      title: "황녀, 반역자를 각인시키다",
      genre: "로맨스, 판타지",
      status: "투자 중",
      notification: true,
    },
    {
      id: "7",
      title: "계약 남편이 남자 주인공과 달았다",
      genre: "로맨스, 드라마",
      status: "투자 예정",
      notification: false,
    },
    {
      id: "9",
      title: "흑막 범고래 아기님",
      genre: "판타지, 액션",
      status: "투자 예정",
      notification: true,
    },
  ]

  return (
    <div className="flex flex-col pb-20">
      {/* 헤더 */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">관심 웹툰</h1>
      </div>

      {/* 관심 웹툰 목록 */}
      <div className="p-4">
        <div className="space-y-4">
          {favoriteWebtoons.map((webtoon) => (
            <Card
              key={webtoon.id}
              className="rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/webtoon/${webtoon.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{webtoon.title}</h3>
                      <Heart className="h-4 w-4 fill-[#FF8A00] text-[#FF8A00]" />
                    </div>
                    <p className="text-xs text-[#8E8E93] mb-2">{webtoon.genre}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        webtoon.status === "투자 중"
                          ? "bg-[#FF8A00]/20 text-[#FF8A00]"
                          : webtoon.status === "투자 가능"
                            ? "bg-[#FFCC00]/20 text-[#FFCC00]"
                            : "bg-[#8E8E93]/20 text-[#8E8E93]"
                      }`}
                    >
                      {webtoon.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8E8E93]">알림</span>
                      <Switch checked={webtoon.notification} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
