"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, ThumbsUp, Send, Trash2, MoreVertical, ChevronLeft, Clock, Eye } from "lucide-react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserFromStorage } from "@/lib/auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

interface Comment {
  id: string
  author: string
  authorInitial: string
  content: string
  time: string
}

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
  views?: number
}

interface CommunityPostDetailScreenProps {
  postId: string
}

export function CommunityPostDetailScreen({ postId }: CommunityPostDetailScreenProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [post, setPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState("")
  const [currentUser, setCurrentUser] = useState("권용현")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    // 사용자 정보 로드
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
      setProfileImage(user.profileImage || null)
    }

    // 게시물 로드
    const storedPosts = localStorage.getItem("communityPosts")
    if (storedPosts) {
      const posts = JSON.parse(storedPosts)
      const foundPost = posts.find((p: Post) => p.id === postId)
      if (foundPost) {
        // 조회수 증가
        const updatedPost = { ...foundPost, views: (foundPost.views || 0) + 1 }
        setPost(updatedPost)

        // 조회수 업데이트된 게시물을 저장
        const updatedPosts = posts.map((p: Post) => (p.id === postId ? updatedPost : p))
        localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
      }
    }
  }, [postId])

  const handleLike = () => {
    if (!post) return

    const updatedPost = {
      ...post,
      likes: post.liked ? post.likes - 1 : post.likes + 1,
      liked: !post.liked,
    }

    setPost(updatedPost)

    // 로컬 스토리지 업데이트
    const storedPosts = localStorage.getItem("communityPosts")
    if (storedPosts) {
      const posts = JSON.parse(storedPosts)
      const updatedPosts = posts.map((p: Post) => (p.id === postId ? updatedPost : p))
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
    }
  }

  const handleSubmitComment = () => {
    if (!newComment.trim() || !post) return

    const newCommentObj: Comment = {
      id: `c${post.id}-${Date.now()}`,
      author: currentUser,
      authorInitial: currentUser.charAt(0),
      content: newComment,
      time: "방금 전",
    }

    const updatedPost = {
      ...post,
      comments: [...post.comments, newCommentObj],
    }

    setPost(updatedPost)

    // 로컬 스토리지 업데이트
    const storedPosts = localStorage.getItem("communityPosts")
    if (storedPosts) {
      const posts = JSON.parse(storedPosts)
      const updatedPosts = posts.map((p: Post) => (p.id === postId ? updatedPost : p))
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
    }

    setNewComment("")

    toast({
      title: "댓글 작성 완료",
      description: "댓글이 성공적으로 등록되었습니다.",
      duration: 2000,
    })
  }

  const handleDeletePost = () => {
    const storedPosts = localStorage.getItem("communityPosts")
    if (storedPosts) {
      const posts = JSON.parse(storedPosts)
      const updatedPosts = posts.filter((p: Post) => p.id !== postId)
      localStorage.setItem("communityPosts", JSON.stringify(updatedPosts))
    }

    setIsDeleteDialogOpen(false)

    toast({
      title: "게시물 삭제 완료",
      description: "게시물이 성공적으로 삭제되었습니다.",
      duration: 2000,
    })

    router.push("/community")
  }

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "제작 업데이트":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "투자 분석":
        return "bg-green-100 text-green-700 border-green-200"
      case "캐스팅 소식":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-gray/5 dark:bg-dark">
        <div className="bg-white dark:bg-darkblue border-b border-gray/10">
          <div className="flex items-center p-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" showSubtitle={false} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray">게시물을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray/5 dark:bg-dark">
      {/* 헤더 */}
      <div className="bg-white dark:bg-darkblue border-b border-gray/10 sticky top-0 z-40">
        <div className="flex justify-between items-center p-4 h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Logo size="md" showSubtitle={false} />
          </div>
          {post.author === currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-4 w-4 text-gray" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer rounded-lg"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제하기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 p-4">
        <div className="bg-white dark:bg-darkblue rounded-2xl border border-gray/20 shadow-lg">
          <div className="p-6">
            {/* 작성자 정보 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-yellow/20">
                  <AvatarImage
                    src={
                      post.author === currentUser && profileImage
                        ? profileImage
                        : post.author === "김지원"
                          ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972677586_EF_BC_8D0.jpg-Q4Or9Sq7GYCZ1TxpW2EiNhSGv0pvsK.jpeg"
                          : post.author === "박민호"
                            ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972927371_EF_BC_8D1.jpg-Xy8p98remiThU5dlPSoCTHV9MQ8aQ6.jpeg"
                            : post.author === "이수진"
                              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972927371_EF_BC_8D0.jpg-BPmkzTjLQtwopnDCFMwgHNLjJ9mXh1.jpeg"
                              : "/placeholder.svg"
                    }
                    alt={post.author}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-yellow/20 to-green/20 text-darkblue dark:text-light font-semibold">
                    {post.authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-darkblue dark:text-light">{post.author}</p>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.time}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views || 0}회</span>
                    </div>
                    <Badge className={`text-xs font-medium border ${getTagColor(post.tag)}`}>{post.tag}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 게시물 내용 */}
            <h1 className="text-2xl font-bold mb-6 text-darkblue dark:text-light leading-tight">{post.title}</h1>

            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-darkblue/80 dark:text-light/80 whitespace-pre-line leading-relaxed text-base">
                {post.content}
              </p>
            </div>

            {/* 좋아요 및 댓글 버튼 */}
            <div className="flex justify-between items-center py-4 border-t border-b border-gray/10">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full transition-all duration-300 ${
                  post.liked
                    ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                    : "text-gray hover:text-red-500 hover:bg-red-50"
                }`}
                onClick={handleLike}
              >
                <ThumbsUp className={`h-4 w-4 mr-2 transition-all ${post.liked ? "fill-red-500" : ""}`} />
                <span className="font-medium">좋아요 {post.likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-gray hover:text-darkblue dark:hover:text-light rounded-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span className="font-medium">댓글 {post.comments.length}</span>
              </Button>
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg text-darkblue dark:text-light mb-4">
                댓글 {post.comments.length}개
              </h3>

              {post.comments.length === 0 ? (
                <div className="text-center py-8 text-gray">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">아직 댓글이 없습니다.</p>
                  <p className="text-xs mt-1">첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-4 bg-gray/5 dark:bg-darkblue/10 rounded-xl border border-gray/10"
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={
                            comment.author === currentUser && profileImage
                              ? profileImage
                              : comment.author === "김지원"
                                ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972677586_EF_BC_8D0.jpg-Q4Or9Sq7GYCZ1TxpW2EiNhSGv0pvsK.jpeg"
                                : comment.author === "박민호"
                                  ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972927371_EF_BC_8D1.jpg-Xy8p98remiThU5dlPSoCTHV9MQ8aQ6.jpeg"
                                  : comment.author === "이수진"
                                    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1629972927371_EF_BC_8D0.jpg-BPmkzTjLQtwopnDCFMwgHNLjJ9mXh1.jpeg"
                                    : "/placeholder.svg"
                          }
                          alt={comment.author}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-yellow/20 to-green/20 text-darkblue dark:text-light text-xs font-semibold">
                          {comment.authorInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-sm text-darkblue dark:text-light">{comment.author}</p>
                          <p className="text-xs text-gray">{comment.time}</p>
                        </div>
                        <p className="text-sm text-darkblue/80 dark:text-light/80 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 입력 영역 - 하단 고정 */}
      <div className="bg-white dark:bg-darkblue border-t border-gray/10 p-4 sticky bottom-0">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={profileImage || "/placeholder.svg"} alt={currentUser} />
            <AvatarFallback className="bg-gradient-to-br from-yellow/20 to-green/20 text-darkblue dark:text-light text-xs font-semibold">
              {currentUser.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="댓글을 입력하세요..."
              className="rounded-xl border-gray/20 bg-gray/5 flex-1"
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
              className="rounded-xl bg-green hover:bg-green/90 text-white px-4"
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-2xl bg-white dark:bg-darkblue border border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-darkblue dark:text-light">게시물 삭제</DialogTitle>
            <DialogDescription>이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center">
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
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
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
