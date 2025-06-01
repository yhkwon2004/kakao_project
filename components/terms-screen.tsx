"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, FileText } from "lucide-react"
import { Logo } from "@/components/logo"

export function TermsScreen() {
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
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">WEEK 이용약관</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#3F4458] dark:text-[#706FB9]">
              <FileText className="h-6 w-6" />
              WEEK 이용약관
            </CardTitle>
            <p className="text-[#989898] text-sm">최종 업데이트: 2024년 1월 1일</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-[#323233] dark:text-[#F5D949]">
              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제1조 (목적)</h3>
                <p className="leading-relaxed">
                  이 약관은 WEEK(이하 "회사")가 제공하는 웹툰 기반 문화 콘텐츠 투자 플랫폼 서비스(이하 "서비스")의
                  이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제2조 (정의)</h3>
                <div className="space-y-2">
                  <p>
                    <strong>1. "서비스"</strong>란 회사가 제공하는 웹툰 기반 드라마/애니메이션 제작 투자 플랫폼을
                    의미합니다.
                  </p>
                  <p>
                    <strong>2. "이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을
                    말합니다.
                  </p>
                  <p>
                    <strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를
                    지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  제3조 (약관의 효력 및 변경)
                </h3>
                <div className="space-y-2">
                  <p>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
                  <p>
                    2. 회사는 합리적인 사유가 발생할 경우에는 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된
                    약관의 내용과 시행일을 정하여, 그 시행일로부터 최소 7일 이전에 공지합니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  제4조 (투자 관련 사항)
                </h3>
                <div className="space-y-2">
                  <p>1. 모든 투자는 원금 손실의 위험이 있으며, 투자 결과에 대한 책임은 투자자 본인에게 있습니다.</p>
                  <p>2. 투자 수익률은 예상 수익률이며, 실제 수익률과 다를 수 있습니다.</p>
                  <p>3. 투자 후 24시간 내에는 투자 취소가 가능하며, 그 이후에는 취소가 불가능합니다.</p>
                  <p>4. 최소 투자 금액은 1만원이며, 만원 단위로만 투자가 가능합니다.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제5조 (회원가입)</h3>
                <div className="space-y-2">
                  <p>
                    1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에
                    대하여 승낙함으로써 체결됩니다.
                  </p>
                  <p>
                    2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수
                    있습니다.
                  </p>
                  <p>- 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</p>
                  <p>- 실명이 아니거나 타인의 명의를 이용한 경우</p>
                  <p>- 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제6조 (개인정보보호)</h3>
                <p className="leading-relaxed">
                  회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및
                  사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  제7조 (서비스의 제공 및 변경)
                </h3>
                <div className="space-y-2">
                  <p>1. 회사는 다음과 같은 업무를 수행합니다.</p>
                  <p>- 웹툰 기반 문화 콘텐츠 투자 정보 제공</p>
                  <p>- 투자 중개 및 관리 서비스</p>
                  <p>- 기타 회사가 정하는 업무</p>
                  <p>
                    2. 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제8조 (서비스의 중단)</h3>
                <p className="leading-relaxed">
                  회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는
                  서비스의 제공을 일시적으로 중단할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">제9조 (면책조항)</h3>
                <div className="space-y-2">
                  <p>
                    1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스
                    제공에 관한 책임이 면제됩니다.
                  </p>
                  <p>2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                  <p>
                    3. 회사는 투자 손실에 대해 책임을 지지 않으며, 모든 투자 결정은 회원의 자기 책임하에 이루어집니다.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  제10조 (준거법 및 관할법원)
                </h3>
                <p className="leading-relaxed">
                  이 약관에 명시되지 않은 사항은 대한민국의 관련 법령에 의하며, 서비스 이용으로 발생한 분쟁에 대해
                  소송이 제기되는 경우 민사소송법상의 관할법원에 제기합니다.
                </p>
              </section>

              <div className="mt-8 p-4 bg-[#E5E4DC] dark:bg-[#454858] rounded-lg">
                <p className="text-sm text-[#3F4458] dark:text-[#706FB9] font-medium">
                  본 약관은 2024년 1월 1일부터 시행됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
