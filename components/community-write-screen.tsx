"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, PenSquare } from "lucide-react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import { getUserFromStorage } from "@/lib/auth"

interface Post {
  id: string
  author: string
  authorInitial: string
  title: string
  content: string
  likes: number
  comments: any[]
  time: string
  tag: string
  liked?: boolean
  views?: number
}

export function CommunityWriteScreen() {
  const router = useRouter()
  const { toast } = useToast()

  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTag, setNewPostTag] = useState("제작 업데이트")
  const [currentUser, setCurrentUser] = useState("권용현")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
    }
  }, [])

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 기존 게시물 목록 가져오기
      const storedPosts = localStorage.getItem("communityPosts")
      const posts = storedPosts ? JSON.parse(storedPosts) : []

      // 새 게시물 생성
      const newPost: Post = {
        id: Date.now().toString(),
        author: currentUser,
        authorInitial: currentUser.charAt(0),
        title: newPostTitle,
        content: newPostContent,
        likes: 0,
        comments: [],
        time: "방금 전",
        tag: newPostTag,
        liked: false,
        views: 0,
      }

      // 게시물 목록 업데이트
      const updatedPosts = [newPost, ...posts]
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))

      // 이벤트 발생
      window.dispatchEvent(new Event("storage"))

      toast({
        title: "게시물 작성 완료",
        description: "게시물이 성공적으로 등록되었습니다.",
        duration: 2000,
      })

      // 커뮤니티 메인으로 이동
      router.push("/community")
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "게시물 작성 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray/5 dark:bg-dark">
      {/* 헤더 */}
      <div className="bg-white dark:bg-darkblue border-b border-gray/10 sticky top-0 z-40">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" showSubtitle={false} />
          </div>
          <Button
            className="rounded-full bg-gradient-to-r from-green to-green/90 hover:from-green/90 hover:to-green/80 text-white font-semibold px-6"
            onClick={handleSubmitPost}
            disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}
          >
            {isSubmitting ? "게시 중..." : "게시하기"}
          </Button>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4">
        <div className="bg-white dark:bg-darkblue rounded-2xl border border-gray/20 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green/20 p-3 rounded-full">
                <PenSquare className="h-6 w-6 text-green" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-darkblue dark:text-light">새 게시물 작성</h1>
                <p className="text-gray text-sm">투자 인사이트와 정보를 커뮤니티와 공유해보세요</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label htmlFor="post-tag" className="text-sm font-semibold text-darkblue dark:text-light block mb-3">
                  카테고리
                </label>
                <select
                  id="post-tag"
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value)}
                  className="w-full rounded-xl border border-gray/20 bg-gray/5 focus:bg-white p-4 text-darkblue dark:text-light h-14 text-base"
                >
                  <option value="제작 업데이트">📺 제작 업데이트</option>
                  <option value="투자 분석">📊 투자 분석</option>
                  <option value="캐스팅 소식">🎭 캐스팅 소식</option>
                </select>
              </div>

              {/* 제목 입력 */}
              <div>
                <label htmlFor="post-title" className="text-sm font-semibold text-darkblue dark:text-light block mb-3">
                  제목
                </label>
                <Input
                  id="post-title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="게시물 제목을 입력하세요"
                  className="rounded-xl border-gray/20 bg-gray/5 focus:bg-white h-14 text-base"
                />
              </div>

              {/* 내용 입력 */}
              <div>
                <label
                  htmlFor="post-content"
                  className="text-sm font-semibold text-darkblue dark:text-light block mb-3"
                >
                  내용
                </label>
                <Textarea
                  id="post-content"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="게시물 내용을 입력하세요..."
                  className="rounded-xl min-h-[300px] border-gray/20 bg-gray/5 focus:bg-white resize-none text-base leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
