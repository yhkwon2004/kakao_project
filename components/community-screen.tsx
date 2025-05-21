"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, ThumbsUp, PenSquare } from "lucide-react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"

// Post type definition
interface Post {
  id: string
  author: string
  authorInitial: string
  title: string
  content: string
  likes: number
  comments: number
  time: string
  tag: string
  liked?: boolean
}

export function CommunityScreen() {
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [activeTab, setActiveTab] = useState("all")
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false)
  const [isReadDialogOpen, setIsReadDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTag, setNewPostTag] = useState("제작 업데이트")
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: "김지원",
      authorInitial: "김",
      title: "황녀, 반역자를 각인시키다 - 제작 업데이트",
      content:
        "드라마 각색 캐스팅이 완료되었다는 소식을 들었어요! 주요 역할에 훌륭한 배우들을 선택했다고 합니다. 주연으로 누가 캐스팅되었는지 정말 궁금해요!",
      likes: 42,
      comments: 15,
      time: "2시간 전",
      tag: "제작 업데이트",
      liked: false,
    },
    {
      id: "2",
      author: "박민호",
      authorInitial: "박",
      title: "검술명가 막내아들 - 투자 분석",
      content:
        "과거 유사한 각색 작품을 기반으로 이 프로젝트의 잠재적 ROI를 분석했습니다. 애니메이션 품질이 유망해 보이고 원작은 강력한 팬층을 보유하고 있습니다. 출시 후 첫 해 내에 20% 수익을 예상합니다.",
      likes: 28,
      comments: 7,
      time: "5시간 전",
      tag: "투자 분석",
      liked: false,
    },
    {
      id: "3",
      author: "이수진",
      authorInitial: "이",
      title: "이번 생은 가주가 되겠습니다 - 캐스팅 소식",
      content:
        "인기 배우가 이 작품의 주연으로 고려되고 있다는 소문이 있어요! 확정되면 프로젝트 가치가 크게 상승할 수 있을 것 같습니다.",
      likes: 56,
      comments: 23,
      time: "1일 전",
      tag: "캐스팅 소식",
      liked: false,
    },
  ])

  // Post submission handler
  const handleSubmitPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
      })
      return
    }

    // Create new post
    const newPost: Post = {
      id: Date.now().toString(),
      author: "권용현", // Current logged in user name
      authorInitial: "권",
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      comments: 0,
      time: "방금 전",
      tag: newPostTag,
      liked: false,
    }

    // Update posts list
    setPosts([newPost, ...posts])

    // Reset input fields and close dialog
    setNewPostTitle("")
    setNewPostContent("")
    setIsWriteDialogOpen(false)

    toast({
      title: "게시물 작성 완료",
      description: "게시물이 성공적으로 등록되었습니다.",
    })
  }

  // Post reading handler
  const handleReadPost = (post: Post) => {
    setSelectedPost(post)
    setIsReadDialogOpen(true)
  }

  // Like handler
  const handleLike = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent post click event propagation

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.liked
          return {
            ...post,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
            liked: isLiked,
          }
        }
        return post
      }),
    )
  }

  // Get filtered posts
  const getFilteredPosts = () => {
    if (activeTab === "all") return posts
    return posts.filter((post) => {
      if (activeTab === "updates") return post.tag === "제작 업데이트"
      if (activeTab === "analysis") return post.tag === "투자 분석"
      if (activeTab === "news") return post.tag === "캐스팅 소식"
      return true
    })
  }

  // Post card rendering function
  const renderPostCard = (post: Post) => (
    <Card
      key={post.id}
      className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/30 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleReadPost(post)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-yellow/20 text-darkblue dark:text-light">
              <AvatarFallback>{post.authorInitial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-darkblue dark:text-light">{post.author}</p>
              <p className="text-xs text-gray">{post.time}</p>
            </div>
          </div>
          <span className="text-xs bg-light dark:bg-darkblue/50 text-darkblue dark:text-light px-2 py-1 rounded-full border border-gray/10">
            {post.tag}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <h3 className="font-bold mb-2 text-darkblue dark:text-light">{post.title}</h3>
        <p className="text-sm text-darkblue/80 dark:text-light/80 line-clamp-3">{post.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={`${post.liked ? "text-green" : "text-gray"} hover:text-green hover:bg-green/10`}
          onClick={(e) => handleLike(post.id, e)}
        >
          <ThumbsUp className={`h-4 w-4 mr-1 ${post.liked ? "fill-green" : ""}`} />
          {post.likes}
        </Button>
        <Button variant="ghost" size="sm" className="text-gray hover:text-darkblue dark:hover:text-light">
          <MessageCircle className="h-4 w-4 mr-1" />
          {post.comments}
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex flex-col pb-20 bg-light dark:bg-dark">
      {/* Header - 로고 일관성을 위해 수정 */}
      <div className="flex justify-between items-center p-4 border-b border-gray/10">
        <Logo size="md" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-green text-green hover:bg-green/10"
            onClick={() => setIsWriteDialogOpen(true)}
          >
            <PenSquare className="h-4 w-4 mr-1" />
            글쓰기
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
            <Avatar className="h-8 w-8 bg-light border border-gray/20">
              <AvatarFallback className="text-darkblue">권</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
            <TabsTrigger
              value="all"
              className={`rounded-full transition-all ${
                activeTab === "all"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              전체
            </TabsTrigger>
            <TabsTrigger
              value="updates"
              className={`rounded-full transition-all ${
                activeTab === "updates"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              업데이트
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className={`rounded-full transition-all ${
                activeTab === "analysis"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              분석
            </TabsTrigger>
            <TabsTrigger
              value="news"
              className={`rounded-full transition-all ${
                activeTab === "news"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              소식
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Write post dialog */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-light dark:bg-darkblue border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">새 게시물 작성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="post-title" className="text-sm font-medium text-darkblue dark:text-light block mb-2">
                제목
              </label>
              <Input
                id="post-title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>

            <div>
              <label htmlFor="post-content" className="text-sm font-medium text-darkblue dark:text-light block mb-2">
                내용
              </label>
              <Textarea
                id="post-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="rounded-xl min-h-[150px] border-gray/20 bg-light dark:bg-darkblue/20"
              />
            </div>

            <div>
              <label htmlFor="post-tag" className="text-sm font-medium text-darkblue dark:text-light block mb-2">
                태그
              </label>
              <select
                id="post-tag"
                value={newPostTag}
                onChange={(e) => setNewPostTag(e.target.value)}
                className="w-full rounded-xl border border-gray/20 bg-light dark:bg-darkblue/20 p-2 text-darkblue dark:text-light"
              >
                <option value="제작 업데이트">제작 업데이트</option>
                <option value="투자 분석">투자 분석</option>
                <option value="캐스팅 소식">캐스팅 소식</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray"
              onClick={() => setIsWriteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-green hover:bg-green/90 text-light"
              onClick={handleSubmitPost}
            >
              게시하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Read post dialog */}
      {selectedPost && (
        <Dialog open={isReadDialogOpen} onOpenChange={setIsReadDialogOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-xl bg-light dark:bg-darkblue border-gray/20">
            <div className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 bg-yellow/20 text-darkblue dark:text-light">
                  <AvatarFallback>{selectedPost.authorInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-darkblue dark:text-light">{selectedPost.author}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray">{selectedPost.time}</p>
                    <span className="text-xs bg-light dark:bg-darkblue/50 text-darkblue dark:text-light px-2 py-0.5 rounded-full border border-gray/10">
                      {selectedPost.tag}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4 text-darkblue dark:text-light">{selectedPost.title}</h2>
              <p className="text-darkblue/90 dark:text-light/90 whitespace-pre-line mb-6">{selectedPost.content}</p>

              <div className="flex justify-between border-t border-gray/10 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${selectedPost.liked ? "text-green" : "text-gray"} hover:text-green hover:bg-green/10`}
                  onClick={(e) => handleLike(selectedPost.id, e)}
                >
                  <ThumbsUp className={`h-4 w-4 mr-1 ${selectedPost.liked ? "fill-green" : ""}`} />
                  좋아요 {selectedPost.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray hover:text-darkblue dark:hover:text-light">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  댓글 {selectedPost.comments}
                </Button>
              </div>

              {/* Comment input area */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
                />
                <Button className="rounded-xl bg-green hover:bg-green/90 text-light">등록</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
