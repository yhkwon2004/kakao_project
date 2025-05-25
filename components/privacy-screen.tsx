"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Shield } from "lucide-react"
import { Logo } from "@/components/logo"

export function PrivacyScreen() {
  const router = useRouter()

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
          <h1 className="text-lg font-bold text-[#323233] dark:text-[#F5D949]">개인정보처리방침</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <Card className="border-[#C2BDAD] dark:border-[#454858] bg-[#F9F9F9] dark:bg-[#3F3F3F] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#3F4458] dark:text-[#706FB9]">
              <Shield className="h-6 w-6" />
              Kakao FANance 개인정보처리방침
            </CardTitle>
            <p className="text-[#989898] text-sm">최종 업데이트: 2024년 1월 1일</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-[#323233] dark:text-[#F5D949]">
              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  1. 개인정보의 처리목적
                </h3>
                <p className="leading-relaxed mb-3">
                  Kakao FANance(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는
                  다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에
                  따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <div className="space-y-2">
                  <p>• 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</p>
                  <p>• 투자 서비스 제공: 투자 상품 안내, 투자 계약 체결 및 이행, 투자 수익 지급</p>
                  <p>• 고객 상담 및 불만처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지</p>
                  <p>• 마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  2. 개인정보의 처리 및 보유기간
                </h3>
                <div className="space-y-3">
                  <p>
                    회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
                    보유·이용기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <div className="bg-[#E5E4DC] dark:bg-[#454858] p-3 rounded-lg">
                    <p className="font-medium">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• 회원 정보: 회원 탈퇴 시까지</li>
                      <li>• 투자 관련 정보: 투자 종료 후 5년</li>
                      <li>• 결제 정보: 결제 완료 후 5년</li>
                      <li>• 상담 기록: 상담 완료 후 3년</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  3. 처리하는 개인정보의 항목
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-[#3F4458] dark:text-[#706FB9] mb-2">필수항목:</h4>
                    <p>이름, 이메일 주소, 전화번호, 생년월일, 성별</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3F4458] dark:text-[#706FB9] mb-2">선택항목:</h4>
                    <p>주소, 직업, 투자 성향</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3F4458] dark:text-[#706FB9] mb-2">자동 수집 항목:</h4>
                    <p>IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  4. 개인정보의 제3자 제공
                </h3>
                <p className="leading-relaxed mb-3">
                  회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서 처리하며, 정보주체의
                  사전 동의 없이는 본래의 목적 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다.
                </p>
                <div className="bg-[#E5E4DC] dark:bg-[#454858] p-3 rounded-lg">
                  <p className="font-medium mb-2">다만, 다음의 경우에는 예외로 합니다:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• 정보주체가 사전에 동의한 경우</li>
                    <li>• 법률에 특별한 규정이 있거나 법령상 의무를 준수하기 위하여 불가피한 경우</li>
                    <li>
                      • 정보주체 또는 그 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를
                      받을 수 없는 경우
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  5. 개인정보처리의 위탁
                </h3>
                <p className="leading-relaxed mb-3">
                  회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                </p>
                <div className="bg-[#E5E4DC] dark:bg-[#454858] p-3 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">결제 처리 업무</p>
                      <p>위탁받는 자: 토스페이먼츠</p>
                      <p>위탁하는 업무의 내용: 결제 처리 및 관리</p>
                    </div>
                    <div>
                      <p className="font-medium">고객 상담 업무</p>
                      <p>위탁받는 자: 카카오 고객센터</p>
                      <p>위탁하는 업무의 내용: 고객 문의 응답 및 상담</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  6. 정보주체의 권리·의무 및 행사방법
                </h3>
                <div className="space-y-3">
                  <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                  <div className="space-y-2">
                    <p>• 개인정보 처리현황 통지요구</p>
                    <p>• 개인정보 열람요구</p>
                    <p>• 개인정보 정정·삭제요구</p>
                    <p>• 개인정보 처리정지요구</p>
                  </div>
                  <div className="bg-[#E5E4DC] dark:bg-[#454858] p-3 rounded-lg">
                    <p className="font-medium mb-2">권리 행사 방법:</p>
                    <p className="text-sm">
                      개인정보보호법 시행규칙 별지 제8호 서식에 따라 작성하여 서면, 전자우편, 모사전송(FAX) 등을 통하여
                      하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">
                  7. 개인정보의 안전성 확보조치
                </h3>
                <p className="leading-relaxed mb-3">
                  회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
                </p>
                <div className="space-y-2">
                  <p>• 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</p>
                  <p>
                    • 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화,
                    보안프로그램 설치
                  </p>
                  <p>• 물리적 조치: 전산실, 자료보관실 등의 접근통제</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-[#3F4458] dark:text-[#706FB9] mb-3">8. 개인정보보호책임자</h3>
                <div className="bg-[#E5E4DC] dark:bg-[#454858] p-4 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">개인정보보호책임자</p>
                      <p className="text-sm">성명: 김개인</p>
                      <p className="text-sm">직책: 개인정보보호팀장</p>
                      <p className="text-sm">연락처: privacy@kakaofanance.com</p>
                    </div>
                    <div>
                      <p className="font-medium">개인정보보호 담당부서</p>
                      <p className="text-sm">부서명: 개인정보보호팀</p>
                      <p className="text-sm">연락처: 1588-1234</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mt-8 p-4 bg-[#E5E4DC] dark:bg-[#454858] rounded-lg">
                <p className="text-sm text-[#3F4458] dark:text-[#706FB9] font-medium">
                  본 개인정보처리방침은 2024년 1월 1일부터 시행됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
