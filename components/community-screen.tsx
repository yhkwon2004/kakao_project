"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageCircle, ThumbsUp, PenSquare, Send, Trash2, MoreVertical, AlertTriangle } from "lucide-react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserFromStorage } from "@/lib/auth"

// Comment type definition
interface Comment {
  id: string
  author: string
  authorInitial: string
  content: string
  time: string
}

// Post type definition
interface Post {
  id: string
  author: string
  authorInitial: string
  title: string
  content: string
  likes: number
  comments: Comment[]
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostTag, setNewPostTag] = useState("제작 업데이트")
  const [newComment, setNewComment] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState("권용현")

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    // 현재 사용자 정보 로드
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
    }

    const storedPosts = localStorage.getItem("communityPosts")
    const storedLikes = localStorage.getItem("communityLikes")

    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    } else {
      // 기본 게시물 데이터
      const defaultPosts: Post[] = [
        {
          id: "1",
          author: "김지원",
          authorInitial: "김",
          title: "황녀, 반역자를 각인시키다 - 제작 업데이트",
          content:
            "드라마 각색 캐스팅이 완료되었다는 소식을 들었어요! 주요 역할에 훌륭한 배우들을 선택했다고 합니다. 주연으로 누가 캐스팅되었는지 정말 궁금해요!",
          likes: 42,
          comments: [
            {
              id: "c1-1",
              author: "박서준",
              authorInitial: "박",
              content: "저도 들었어요! 주연 배우가 인기 아이돌 출신이라고 하던데요?",
              time: "1시간 전",
            },
            {
              id: "c1-2",
              author: "이민지",
              authorInitial: "이",
              content: "원작 팬으로서 캐릭터와 싱크로율이 높은 배우가 캐스팅되었으면 좋겠어요.",
              time: "30분 전",
            },
          ],
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
          comments: [
            {
              id: "c2-1",
              author: "김태희",
              authorInitial: "김",
              content: "분석 자료 공유 감사합니다. 저도 이 작품에 투자했는데 기대가 큽니다!",
              time: "3시간 전",
            },
          ],
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
          comments: [
            {
              id: "c3-1",
              author: "정우성",
              authorInitial: "정",
              content: "혹시 어떤 배우인지 힌트라도 있을까요?",
              time: "12시간 전",
            },
            {
              id: "c3-2",
              author: "한소희",
              authorInitial: "한",
              content: "최근 종영한 드라마의 주연배우라는 이야기도 있던데 사실인가요?",
              time: "8시간 전",
            },
            {
              id: "c3-3",
              author: "이수진",
              authorInitial: "이",
              content: "아직 확정된 정보는 아니라서 자세히 말씀드리기 어렵습니다. 공식 발표를 기다려주세요!",
              time: "6시간 전",
            },
          ],
          time: "1일 전",
          tag: "캐스팅 소식",
          liked: false,
        },
      ]

      setPosts(defaultPosts)
      localStorage.setItem("communityPosts", JSON.stringify(defaultPosts))
    }

    // 좋아요 상태 복원
    if (storedLikes) {
      const likedPostIds = JSON.parse(storedLikes) as string[]
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          liked: likedPostIds.includes(post.id),
        })),
      )
    }
  }, [])

  // 게시물 및 좋아요 상태 저장
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("communityPosts", JSON.stringify(posts))

      // 좋아요 상태 저장
      const likedPostIds = posts.filter((post) => post.liked).map((post) => post.id)
      localStorage.setItem("communityLikes", JSON.stringify(likedPostIds))
    }
  }, [posts])

  // Post submission handler
  const handleSubmitPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        duration: 3000,
      })
      return
    }

    // Create new post
    const newPost: Post = {
      id: Date.now().toString(),
      author: currentUser, // Current logged in user name
      authorInitial: currentUser.charAt(0),
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      comments: [],
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
      duration: 3000,
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

  // Comment submission handler
  const handleSubmitComment = () => {
    if (!newComment.trim() || !selectedPost) return

    const newCommentObj: Comment = {
      id: `c${selectedPost.id}-${Date.now()}`,
      author: currentUser, // Current logged in user name
      authorInitial: currentUser.charAt(0),
      content: newComment,
      time: "방금 전",
    }

    // Update posts with new comment
    setPosts(
      posts.map((post) => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, newCommentObj],
          }
        }
        return post
      }),
    )

    // Update selected post to show new comment immediately
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, newCommentObj],
    })

    // Clear comment input
    setNewComment("")

    toast({
      title: "댓글 작성 완료",
      description: "댓글이 성공적으로 등록되었습니다.",
      duration: 2000,
    })
  }

  // 게시물 삭제 핸들러
  const handleDeletePost = () => {
    if (!selectedPost) return

    // 게시물 삭제
    setPosts(posts.filter((post) => post.id !== selectedPost.id))

    // 다이얼로그 닫기
    setIsDeleteDialogOpen(false)
    setIsReadDialogOpen(false)

    toast({
      title: "게시물 삭제 완료",
      description: "게시물이 성공적으로 삭제되었습니다.",
      duration: 2000,
    })
  }

  // 삭제 다이얼로그 열기
  const openDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  // Get filtered posts
  const getFilteredPosts = () => {
    if (activeTab === "all") return posts
    if (activeTab === "my") return posts.filter((post) => post.author === currentUser)
    if (activeTab === "updates") return posts.filter((post) => post.tag === "제작 업데이트")
    if (activeTab === "analysis") return posts.filter((post) => post.tag === "투자 분석")
    if (activeTab === "news") return posts.filter((post) => post.tag === "캐스팅 소식")
    return posts
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
          <div className="flex items-center gap-2">
            <span className="text-xs bg-light dark:bg-darkblue/50 text-darkblue dark:text-light px-2 py-1 rounded-full border border-gray/10">
              {post.tag}
            </span>

            {/* 내가 쓴 글인 경우 더보기 메뉴 표시 */}
            {post.author === currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-gray/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-gray" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPost(post)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제하기
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
          {post.comments.length}
        </Button>
      </CardFooter>
    </Card>
  )

  // Comment rendering function
  const renderComments = (comments: Comment[]) => {
    if (comments.length === 0) {
      return (
        <div className="text-center py-4 text-gray">
          <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        </div>
      )
    }

    return (
      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 bg-light/50 dark:bg-darkblue/20 rounded-lg">
            <Avatar className="h-8 w-8 bg-yellow/20 text-darkblue dark:text-light flex-shrink-0">
              <AvatarFallback>{comment.authorInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm text-darkblue dark:text-light">{comment.author}</p>
                <p className="text-xs text-gray">{comment.time}</p>
              </div>
              <p className="text-sm text-darkblue/90 dark:text-light/90">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

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
              <AvatarFallback className="text-darkblue">{currentUser.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4 bg-light dark:bg-darkblue/20 p-1 rounded-full">
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
              value="my"
              className={`rounded-full transition-all ${
                activeTab === "my"
                  ? "bg-yellow text-dark font-medium"
                  : "text-gray hover:text-darkblue dark:hover:text-light"
              }`}
            >
              내 글
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

          <TabsContent value="my" className="space-y-4">
            {getFilteredPosts().length > 0 ? (
              getFilteredPosts().map(renderPostCard)
            ) : (
              <div className="text-center py-8 text-gray">
                <p>작성한 게시물이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-xl border-green text-green hover:bg-green/10"
                  onClick={() => setIsWriteDialogOpen(true)}
                >
                  <PenSquare className="h-4 w-4 mr-2" />첫 게시물 작성하기
                </Button>
              </div>
            )}
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
            <DialogDescription>아래 양식을 작성하여 새 게시물을 등록하세요.</DialogDescription>
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
            <DialogHeader>
              <DialogTitle className="sr-only">게시물 상세</DialogTitle>
              <DialogDescription className="sr-only">게시물 내용과 댓글을 확인하세요.</DialogDescription>
            </DialogHeader>
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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

                {/* 내가 쓴 글인 경우 삭제 버튼 표시 */}
                {selectedPost.author === currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={openDeleteDialog}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                )}
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
                  댓글 {selectedPost.comments.length}
                </Button>
              </div>

              {/* Comments section */}
              <div className="mt-4 border-t border-gray/10 pt-4">
                <h3 className="font-medium text-darkblue dark:text-light mb-3">댓글</h3>
                {renderComments(selectedPost.comments)}
              </div>

              {/* Comment input area */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  className="rounded-xl border-gray/20 bg-light dark:bg-darkblue/20"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                />
                <Button
                  className="rounded-xl bg-green hover:bg-green/90 text-light"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl bg-light dark:bg-darkblue border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">게시물 삭제</DialogTitle>
            <DialogDescription>이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>

          <div className="py-4 flex items-center justify-center text-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-6 w-6" />
              <p>삭제된 게시물은 복구할 수 없습니다.</p>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeletePost}
            >
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
