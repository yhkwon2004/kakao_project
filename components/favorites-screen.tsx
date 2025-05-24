"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, ChevronRight, Heart, X, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export function FavoritesScreen() {
  const router = useRouter()
  const { toast } = useToast()

  // 관심 웹툰 데이터를 useState로 변경
  const [favoriteWebtoons, setFavoriteWebtoons] = useState([])

  // 로컬 스토리지에서 즐겨찾기 데이터 불러오기
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteWebtoons")
    if (storedFavorites) {
      setFavoriteWebtoons(JSON.parse(storedFavorites))
    } else {
      // 초기 즐겨찾기 데이터를 빈 배열로 설정
      setFavoriteWebtoons([])
      localStorage.setItem("favoriteWebtoons", JSON.stringify([]))
    }
  }, [])

  // 즐겨찾기 데이터를 로컬 스토리지에 저장하는 함수
  const saveFavoritesToStorage = (favorites: any[]) => {
    localStorage.setItem("favoriteWebtoons", JSON.stringify(favorites))
  }

  // 알림 토글 핸들러 함수 추가
  const handleNotificationToggle = (webtoonId: string, event: React.MouseEvent) => {
    // 이벤트 전파 중지 (카드 클릭 이벤트 방지)
    event.stopPropagation()

    setFavoriteWebtoons(
      favoriteWebtoons.map((webtoon) => {
        if (webtoon.id === webtoonId) {
          const newState = !webtoon.notification
          // 토스트 메시지 표시
          toast({
            title: newState ? "알림 활성화" : "알림 비활성화",
            description: `${webtoon.title}의 알림이 ${newState ? "활성화" : "비활성화"}되었습니다.`,
            duration: 300, // 0.3초로 변경
          })
          return { ...webtoon, notification: newState }
        }
        return webtoon
      }),
    )
    // 변경된 즐겨찾기 데이터 저장
    const updatedFavorites = favoriteWebtoons.map((webtoon) => {
      if (webtoon.id === webtoonId) {
        return { ...webtoon, notification: !webtoon.notification }
      }
      return webtoon
    })
    saveFavoritesToStorage(updatedFavorites)
  }

  // 웹툰 상세 페이지로 이동하는 함수
  const navigateToWebtoonDetail = (webtoonId: string) => {
    // 웹툰 ID로 해당 웹툰 찾기
    const webtoon = favoriteWebtoons.find((w) => w.id === webtoonId)
    if (webtoon) {
      // 웹툰의 slug를 사용하여 상세 페이지로 이동
      router.push(`/webtoon/${webtoon.slug}`)
    }
  }

  // 즐겨찾기 제거 함수
  const removeFavorite = (webtoonId: string, event: React.MouseEvent) => {
    // 이벤트 전파 중지
    event.stopPropagation()

    // 제거할 웹툰 정보 찾기
    const webtoonToRemove = favoriteWebtoons.find((w) => w.id === webtoonId)

    // 즐겨찾기에서 제거
    const updatedFavorites = favoriteWebtoons.filter((webtoon) => webtoon.id !== webtoonId)
    setFavoriteWebtoons(updatedFavorites)
    saveFavoritesToStorage(updatedFavorites)

    // 토스트 메시지 표시
    if (webtoonToRemove) {
      toast({
        title: "즐겨찾기 제거",
        description: `${webtoonToRemove.title}이(가) 즐겨찾기에서 제거되었습니다.`,
        duration: 300, // 0.3초로 변경
      })
    }
  }

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
        {favoriteWebtoons.length > 0 ? (
          <div className="space-y-4">
            {favoriteWebtoons.map((webtoon) => (
              <Card key={webtoon.id} className="rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4 cursor-pointer" onClick={() => router.push(`/webtoon/${webtoon.slug}`)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold hover:text-[#FF8A00] transition-colors">{webtoon.title}</h3>
                        <Heart className="h-4 w-4 fill-[#FF8A00] text-[#FF8A00]" />
                      </div>
                      <p className="text-xs text-[#8E8E93] mb-2">{webtoon.genre}</p>
                      <div className="flex items-center gap-2">
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

                        {/* 투자 상태 표시 */}
                        {webtoon.invested && (
                          <Badge className="bg-green text-white">
                            <DollarSign className="h-3 w-3 mr-1" />
                            투자완료
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8E8E93]">알림</span>
                        <Switch
                          checked={webtoon.notification}
                          onCheckedChange={(e) => {}}
                          onClick={(e) => handleNotificationToggle(webtoon.id, e)}
                          className="cursor-pointer"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-red-100"
                        onClick={(e) => removeFavorite(webtoon.id, e)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                      <ChevronRight
                        className="h-5 w-5 text-[#8E8E93] cursor-pointer"
                        onClick={() => navigateToWebtoonDetail(webtoon.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500 mb-4">관심 웹툰이 없습니다.</p>
            <Button
              variant="outline"
              className="rounded-xl border-green text-green hover:bg-green/10"
              onClick={() => router.push("/webtoons")}
            >
              웹툰 둘러보기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
