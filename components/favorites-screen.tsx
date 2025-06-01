"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Heart, Star, TrendingUp, Calendar } from "lucide-react"
import { Logo } from "@/components/logo"
import { getWebtoonById } from "@/data/webtoons"
import { formatKoreanCurrency } from "@/lib/format-currency"
import Image from "next/image"

export function FavoritesScreen() {
  const router = useRouter()
  const [favoriteWebtoons, setFavoriteWebtoons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()

    // Listen for favorite updates
    const handleStorageChange = () => {
      loadFavorites()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("favoritesUpdated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("favoritesUpdated", handleStorageChange)
    }
  }, [])

  const loadFavorites = () => {
    try {
      const favoritesStr = localStorage.getItem("userFavorites")
      if (favoritesStr) {
        const favoriteIds = JSON.parse(favoritesStr)
        const webtoons = favoriteIds.map((id: string) => getWebtoonById(id)).filter(Boolean)
        setFavoriteWebtoons(webtoons)
      } else {
        setFavoriteWebtoons([])
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
      setFavoriteWebtoons([])
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = (webtoonId: string) => {
    try {
      const favoritesStr = localStorage.getItem("userFavorites")
      if (favoritesStr) {
        const favorites = JSON.parse(favoritesStr)
        const updatedFavorites = favorites.filter((id: string) => id !== webtoonId)
        localStorage.setItem("userFavorites", JSON.stringify(updatedFavorites))

        // Dispatch event to notify other components
        window.dispatchEvent(new Event("favoritesUpdated"))
        loadFavorites()
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#323233] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F9DF52] mx-auto mb-4"></div>
          <p className="text-[#989898]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#323233]">
      {/* Header */}
      <div className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-b border-[#BCBCBC] dark:border-[#454858] sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-3 hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
            >
              <ChevronLeft className="h-5 w-5 text-[#323233] dark:text-[#F5D949]" />
            </Button>
            <Logo size="sm" showSubtitle={false} />
          </div>
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">관심 웹툰</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4">
        {favoriteWebtoons.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-24 h-24 bg-[#E5E4DC] dark:bg-[#454858] rounded-full flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-[#989898]" />
            </div>
            <h2 className="text-xl font-bold text-[#323233] dark:text-[#F5D949] mb-2">관심 웹툰이 없습니다</h2>
            <p className="text-[#989898] mb-6 max-w-sm">
              아직 관심 웹툰이 없습니다. 메인 목록에서 관심 웹툰을 추가해보세요!
            </p>
            <Button
              onClick={() => router.push("/webtoons")}
              className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-semibold px-6 py-2"
            >
              웹툰 둘러보기
            </Button>
          </div>
        ) : (
          // Favorites list
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#323233] dark:text-[#F5D949]">
                관심 웹툰 ({favoriteWebtoons.length})
              </h2>
            </div>

            <div className="grid gap-4">
              {favoriteWebtoons.map((webtoon) => (
                <Card
                  key={webtoon.id}
                  className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/webtoon/${webtoon.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative shrink-0">
                        <Image
                          src={webtoon.thumbnail || "/placeholder.svg"}
                          alt={webtoon.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover shadow-md"
                        />
                        <div className="absolute -top-2 -right-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFavorite(webtoon.id)
                            }}
                            className="h-8 w-8 bg-[#D16561] hover:bg-[#DD8369] text-white rounded-full shadow-lg"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#323233] dark:text-[#F5D949] mb-1 truncate">{webtoon.title}</h3>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {webtoon.genre
                            ?.split(",")
                            .slice(0, 2)
                            .map((genre: string, index: number) => (
                              <span
                                key={index}
                                className="bg-[#5F859F]/10 text-[#5F859F] text-xs font-medium px-2 py-0.5 rounded-full"
                              >
                                {genre.trim()}
                              </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[#989898] mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-[#F9DF52]" />
                            <span>평점 {webtoon.rating || "4.5"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-[#4F8F78]" />
                            <span>+{webtoon.expectedROI || 15}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{webtoon.daysLeft || 0}일 남음</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="h-2 bg-[#E5E4DC] dark:bg-[#454858] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#F9DF52] to-[#4F8F78] transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  ((webtoon.currentRaised || 0) / (webtoon.goalAmount || 1)) * 100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-[#989898]">
                            <span>{formatKoreanCurrency(webtoon.currentRaised || 0)}</span>
                            <span>{formatKoreanCurrency(webtoon.goalAmount || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
