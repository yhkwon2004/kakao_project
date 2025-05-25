"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Send, Tag, X, Plus } from "lucide-react"
import { Logo } from "@/components/logo"
import { useToast } from "@/components/ui/use-toast"

export function CommunityWriteScreen() {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        tags: tags,
        author: "사용자",
        date: new Date().toISOString().split("T")[0],
        likes: 0,
        comments: 0,
      }

      // Save to localStorage (in real app, this would be an API call)
      const existingPosts = JSON.parse(localStorage.getItem("communityPosts") || "[]")
      localStorage.setItem("communityPosts", JSON.stringify([newPost, ...existingPosts]))

      toast({
        title: "게시글 작성 완료",
        description: "게시글이 성공적으로 작성되었습니다.",
      })

      router.push("/community")
    } catch (error) {
      toast({
        title: "작성 실패",
        description: "게시글 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#323233]">
      {/* Header */}
      <div className="bg-[#F9F9F9] dark:bg-[#3F3F3F] border-b border-[#BCBCBC] dark:border-[#454858] sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
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
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">글쓰기</h1>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-semibold disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#323233]" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Title Input */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#323233] dark:text-[#F5D949] text-lg">제목</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요..."
              className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] text-lg font-medium placeholder:text-[#989898] focus:border-[#F9DF52] focus:ring-[#F9DF52]"
            />
          </CardContent>
        </Card>

        {/* Content Input */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#323233] dark:text-[#F5D949] text-lg">내용</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="게시글 내용을 입력하세요..."
              rows={12}
              className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] placeholder:text-[#989898] focus:border-[#F9DF52] focus:ring-[#F9DF52] resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[#989898]">{content.length}/1000자</span>
              <span className="text-xs text-[#989898]">마크다운 문법을 지원합니다</span>
            </div>
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949] text-lg">
              <Tag className="h-5 w-5 text-[#5F859F]" />
              태그 (선택사항)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Tag Input */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                placeholder="태그를 입력하세요..."
                className="bg-[#FAFAFA] dark:bg-[#383B4B] border-[#BCBCBC] dark:border-[#454858] text-[#323233] dark:text-[#F5D949] placeholder:text-[#989898] focus:border-[#F9DF52] focus:ring-[#F9DF52]"
                disabled={tags.length >= 5}
              />
              <Button
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                className="bg-[#5F859F] hover:bg-[#58678C] text-white shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[#3F4458] dark:text-[#F5C882] text-sm">추가된 태그 ({tags.length}/5)</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#F9DF52]/20 text-[#323233] dark:text-[#F5D949] border border-[#F9DF52]/30 hover:bg-[#F9DF52]/30 transition-colors"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTag(tag)}
                        className="h-4 w-4 ml-1 p-0 hover:bg-[#D16561]/20 text-[#D16561]"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#989898]">
              태그는 최대 5개까지 추가할 수 있습니다. 태그를 통해 다른 사용자들이 게시글을 쉽게 찾을 수 있습니다.
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardContent className="pt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="w-full h-12 bg-[#F9DF52] hover:bg-[#F5C882] text-[#323233] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#323233]" />
                  게시 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  게시글 작성
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
