"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  ThumbsUp,
  PenSquare,
  Trash2,
  MoreVertical,
  AlertTriangle,
  Users,
  Clock,
  Eye,
  Filter,
  Search,
} from "lucide-react"
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
  views?: number
}

export function CommunityScreen() {
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [activeTab, setActiveTab] = useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState("권용현")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState("latest") // latest, popular, oldest
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    // 현재 사용자 정보 로드
    const user = getUserFromStorage()
    if (user && user.name) {
      setCurrentUser(user.name)
      setProfileImage(user.profileImage || null)
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
          views: 156,
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
          views: 89,
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
          views: 234,
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

  // Post reading handler
  const handleReadPost = (post: Post) => {
    router.push(`/community/${post.id}`)
  }

  // Like handler
  const handleLike = (postId: string, event: React.MouseEvent) => {
    event.stopPropagation()

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

  // 게시물 삭제 핸들러
  const handleDeletePost = () => {
    if (!selectedPost) return

    setPosts(posts.filter((post) => post.id !== selectedPost.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "게시물 삭제 완료",
      description: "게시물이 성공적으로 삭제되었습니다.",
      duration: 2000,
    })
  }

  // Get filtered posts
  const getFilteredPosts = () => {
    let filtered = posts

    if (activeTab === "my") filtered = posts.filter((post) => post.author === currentUser)
    else if (activeTab === "updates") filtered = posts.filter((post) => post.tag === "제작 업데이트")
    else if (activeTab === "analysis") filtered = posts.filter((post) => post.tag === "투자 분석")
    else if (activeTab === "news") filtered = posts.filter((post) => post.tag === "캐스팅 소식")

    // 검색 필터 적용
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // 정렬 적용
    switch (sortBy) {
      case "views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "likes":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "latest":
      default:
        // 기본 최신순 (이미 정렬되어 있음)
        break
    }

    return filtered
  }

  // 태그별 색상 설정
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

  // Post card rendering function
  const renderPostCard = (post: Post) => (
    <Card
      key={post.id}
      className="rounded-xl border border-gray/10 bg-white dark:bg-darkblue/20 hover:shadow-lg hover:border-yellow/30 transition-all duration-300 cursor-pointer group"
      onClick={() => handleReadPost(post)}
    >
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-yellow/20">
              <AvatarImage
                src={post.author === currentUser && profileImage ? profileImage : "/placeholder.svg"}
                alt={post.author}
              />
              <AvatarFallback className="bg-gradient-to-br from-yellow/20 to-green/20 text-darkblue dark:text-light font-semibold">
                {post.authorInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-darkblue dark:text-light">{post.author}</p>
              <div className="flex items-center gap-2 text-xs text-gray">
                <Clock className="h-3 w-3" />
                <span>{post.time}</span>
                <span>•</span>
                <Eye className="h-3 w-3" />
                <span>{post.views || 0}회</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs font-medium border ${getTagColor(post.tag)}`}>{post.tag}</Badge>
            {post.author === currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-gray/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-gray" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer rounded-lg"
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

      <CardContent className="px-6 pb-4">
        <h3 className="font-bold text-lg mb-3 text-darkblue dark:text-light group-hover:text-yellow transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-darkblue/70 dark:text-light/70 line-clamp-3 leading-relaxed">{post.content}</p>
      </CardContent>

      <CardFooter className="px-6 py-4 bg-gray/5 dark:bg-darkblue/10 border-t border-gray/5">
        <div className="flex justify-between items-center w-full">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full transition-all duration-300 ${
              post.liked
                ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                : "text-gray hover:text-red-500 hover:bg-red-50"
            }`}
            onClick={(e) => handleLike(post.id, e)}
          >
            <ThumbsUp className={`h-4 w-4 mr-2 transition-all ${post.liked ? "fill-red-500" : ""}`} />
            <span className="font-medium">{post.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray hover:text-darkblue dark:hover:text-light rounded-full"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">{post.comments.length}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  // Comment rendering function
  const renderComments = (comments: Comment[]) => {
    if (comments.length === 0) {
      return (
        <div className="text-center py-8 text-gray">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">아직 댓글이 없습니다.</p>
          <p className="text-xs mt-1">첫 댓글을 작성해보세요!</p>
        </div>
      )
    }

    return (
      <div className="space-y-4 mt-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-3 p-4 bg-gray/5 dark:bg-darkblue/10 rounded-xl border border-gray/10"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={comment.author === currentUser && profileImage ? profileImage : "/placeholder.svg"}
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
    )
  }

  return (
    <div className="flex flex-col pb-20 bg-gray/5 dark:bg-dark min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-darkblue border-b border-gray/10 sticky top-0 z-40">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <Logo size="md" showSubtitle={false} />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-green text-green hover:bg-green/10 font-medium"
              onClick={() => router.push("/community/write")}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              글쓰기
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/mypage")}>
              <Avatar className="h-9 w-9 ring-2 ring-yellow/20">
                <AvatarImage src={profileImage || "/placeholder.svg"} alt={currentUser} />
                <AvatarFallback className="bg-gradient-to-br from-yellow/20 to-green/20 text-darkblue dark:text-light font-semibold">
                  {currentUser.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-4 pb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray" />
              <Input
                placeholder="게시물 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-gray/20 bg-gray/5 focus:bg-white transition-colors"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray/20"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-darkblue border-b border-gray/10 sticky top-[120px] z-30">
        <div className="p-4">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 bg-gray/10 dark:bg-darkblue/30 p-1 rounded-full w-full">
              <TabsTrigger
                value="all"
                className={`rounded-full transition-all font-medium ${
                  activeTab === "all"
                    ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                    : "text-gray hover:text-darkblue dark:hover:text-light"
                }`}
              >
                전체
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className={`rounded-full transition-all font-medium ${
                  activeTab === "my"
                    ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                    : "text-gray hover:text-darkblue dark:hover:text-light"
                }`}
              >
                내 글
              </TabsTrigger>
              <TabsTrigger
                value="updates"
                className={`rounded-full transition-all font-medium ${
                  activeTab === "updates"
                    ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                    : "text-gray hover:text-darkblue dark:hover:text-light"
                }`}
              >
                업데이트
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className={`rounded-full transition-all font-medium ${
                  activeTab === "analysis"
                    ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                    : "text-gray hover:text-darkblue dark:hover:text-light"
                }`}
              >
                분석
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className={`rounded-full transition-all font-medium ${
                  activeTab === "news"
                    ? "bg-white dark:bg-darkblue text-darkblue dark:text-light shadow-sm"
                    : "text-gray hover:text-darkblue dark:hover:text-light"
                }`}
              >
                소식
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab}>
          <TabsContent value="all" className="space-y-4 mt-0">
            {getFilteredPosts().length > 0 ? (
              getFilteredPosts().map(renderPostCard)
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray/30" />
                <p className="text-gray text-lg font-medium">검색 결과가 없습니다</p>
                <p className="text-gray/70 text-sm mt-1">다른 키워드로 검색해보세요</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4 mt-0">
            {getFilteredPosts().length > 0 ? (
              getFilteredPosts().map(renderPostCard)
            ) : (
              <div className="text-center py-12">
                <PenSquare className="h-16 w-16 mx-auto mb-4 text-gray/30" />
                <p className="text-gray text-lg font-medium">작성한 게시물이 없습니다</p>
                <p className="text-gray/70 text-sm mt-1 mb-4">첫 번째 게시물을 작성해보세요</p>
                <Button
                  variant="outline"
                  className="rounded-full border-green text-green hover:bg-green/10"
                  onClick={() => router.push("/community/write")}
                >
                  <PenSquare className="h-4 w-4 mr-2" />첫 게시물 작성하기
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-4 mt-0">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-0">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>

          <TabsContent value="news" className="space-y-4 mt-0">
            {getFilteredPosts().map(renderPostCard)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[350px] rounded-2xl bg-white dark:bg-darkblue border border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-darkblue dark:text-light">게시물 삭제</DialogTitle>
            <DialogDescription>이 게시물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogDescription>
          </DialogHeader>

          <div className="py-6 flex items-center justify-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl flex items-center gap-4 text-red-500">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <p className="font-semibold">삭제 확인</p>
                <p className="text-sm">삭제된 게시물은 복구할 수 없습니다.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl border-gray/20 text-gray h-12"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white h-12 font-semibold"
              onClick={handleDeletePost}
            >
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[90vw] max-w-[280px] rounded-2xl bg-white dark:bg-darkblue border border-gray/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-darkblue dark:text-light">정렬 옵션</DialogTitle>
            <DialogDescription>게시물을 어떻게 정렬하시겠습니까?</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant={sortBy === "latest" ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl ${
                sortBy === "latest" ? "bg-yellow text-dark" : "text-darkblue dark:text-light"
              }`}
              onClick={() => {
                setSortBy("latest")
                setIsFilterOpen(false)
              }}
            >
              <Clock className="h-4 w-4 mr-2" />
              최신순
            </Button>

            <Button
              variant={sortBy === "views" ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl ${
                sortBy === "views" ? "bg-yellow text-dark" : "text-darkblue dark:text-light"
              }`}
              onClick={() => {
                setSortBy("views")
                setIsFilterOpen(false)
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              조회수순
            </Button>

            <Button
              variant={sortBy === "likes" ? "default" : "ghost"}
              className={`w-full justify-start rounded-xl ${
                sortBy === "likes" ? "bg-yellow text-dark" : "text-darkblue dark:text-light"
              }`}
              onClick={() => {
                setSortBy("likes")
                setIsFilterOpen(false)
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              좋아요순
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
