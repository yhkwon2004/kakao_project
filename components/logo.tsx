import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg" // ⬅️ 로고 크기 옵션 ("small", "medium", "large")
  showSubtitle?: boolean // ⬅️ 부제목 표시 여부
  className?: string // ⬅️ Tailwind 등 외부에서 전달받는 클래스
}

export function Logo({ size = "md", showSubtitle = true, className = "" }: LogoProps) {
  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* 모든 페이지에서 동일한 고정 크기로 로고 표시 */}
      <Image
        src="/images/main-logo-new.png"
        alt="WEEK"
        width={80}
        height={40}
        className="object-contain filter dark:brightness-110 dark:contrast-125 dark:saturate-150"
        priority
      />

      {/* 부제목이 true일 때만 표시 */}
      {showSubtitle && (
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light tracking-wide">
          Webtoon Investment Platform
        </span>
      )}
    </div>
  )
}
