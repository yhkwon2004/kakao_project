"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Phone, Mail, MessageCircle, Clock, HelpCircle, FileText } from "lucide-react"
import { Logo } from "@/components/logo"

export function SupportScreen() {
  const router = useRouter()

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
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">WEEK 고객 지원</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Contact Methods */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#323233] dark:text-[#F5D949]">문의 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <Phone className="h-6 w-6 text-[#5F859F]" />
              <div>
                <p className="font-semibold text-[#323233] dark:text-[#F5D949]">전화 상담</p>
                <p className="text-[#989898]">1588-1234 (평일 9:00-18:00)</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <Mail className="h-6 w-6 text-[#5F859F]" />
              <div>
                <p className="font-semibold text-[#323233] dark:text-[#F5D949]">이메일 문의</p>
                <p className="text-[#989898]">support@week.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <MessageCircle className="h-6 w-6 text-[#5F859F]" />
              <div>
                <p className="font-semibold text-[#323233] dark:text-[#F5D949]">채팅 상담</p>
                <p className="text-[#989898]">앱 내 실시간 채팅 (24시간)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949]">
              <Clock className="h-5 w-5 text-[#5F859F]" />
              운영 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-[#323233] dark:text-[#F5D949]">
              <div className="flex justify-between">
                <span>평일</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>토요일</span>
                <span>09:00 - 13:00</span>
              </div>
              <div className="flex justify-between">
                <span>일요일/공휴일</span>
                <span className="text-[#D16561]">휴무</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949]">
              <HelpCircle className="h-5 w-5 text-[#5F859F]" />
              자주 묻는 질문
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <h4 className="font-semibold text-[#323233] dark:text-[#F5D949] mb-2">투자는 어떻게 하나요?</h4>
              <p className="text-[#989898] text-sm">
                웹툰 상세 페이지에서 '투자하기' 버튼을 클릭하여 투자할 수 있습니다.
              </p>
            </div>

            <div className="p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <h4 className="font-semibold text-[#323233] dark:text-[#F5D949] mb-2">수익은 언제 받을 수 있나요?</h4>
              <p className="text-[#989898] text-sm">프로젝트 완료 후 약 3-6개월 내에 수익이 지급됩니다.</p>
            </div>

            <div className="p-3 bg-[#FAFAFA] dark:bg-[#383B4B] rounded-lg border border-[#BCBCBC] dark:border-[#454858]">
              <h4 className="font-semibold text-[#323233] dark:text-[#F5D949] mb-2">투자 취소는 가능한가요?</h4>
              <p className="text-[#989898] text-sm">투자 후 24시간 내에는 취소가 가능합니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#323233] dark:text-[#F5D949]">
              <FileText className="h-5 w-5 text-[#5F859F]" />
              추가 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
              onClick={() => router.push("/terms")}
            >
              이용약관 보기
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-[#323233] dark:text-[#F5D949] hover:bg-[#E5E4DC] dark:hover:bg-[#454858]"
              onClick={() => router.push("/privacy")}
            >
              개인정보처리방침 보기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
