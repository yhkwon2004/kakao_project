import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"      // ⬅️ 로고 크기 옵션 ("small", "medium", "large")
  showSubtitle?: boolean         // ⬅️ 부제목 표시 여부
  className?: string             // ⬅️ Tailwind 등 외부에서 전달받는 클래스
}

export function Logo({
  size = "md",
  showSubtitle = true,
  className = "",
}: LogoProps) {
  // ⬇️ 크기 옵션별 가로 너비(width)와 세로 높이(height)를 명확히 정의
  const sizeMap = {
    sm: { width: 100, height: 16 },  // 소형: 가로 200px, 세로 32px
    md: { width: 150, height: 18 },  // 중형: 가로 300px, 세로 36px
    lg: { width: 200, height: 20 },  // 대형: 가로 400px, 세로 40px
  }

  // ⬇️ 현재 size에 맞는 width/height 값 가져오기 (기본값: md)
  const { width, height } = sizeMap[size]

  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* ⬇️ 로고 이미지 표시 */}
      <Image
        src="/images/logo_bar_new-removebg-preview.png"  // ⬅️ 이미지 경로 (public 기준)
        alt="WEEK"                                      // ⬅️ 대체 텍스트 (접근성 고려)
        width={width}                                   // ⬅️ 가로 크기 (픽셀 단위로 명시)
        height={height}                                 // ⬅️ 세로 크기 (비율 고정)
        className="object-contain"                      // ⬅️ 이미지 왜곡 없이 표시
        priority                                        // ⬅️ 페이지 로드시 우선 로드
      />

      {/* ⬇️ 부제목이 true일 때만 표시 */}
      {showSubtitle && (
        <span className="text-xs text-gray-500 mt-1">Webtoon Investment Platform</span>
      )}
    </div>
  )
}
