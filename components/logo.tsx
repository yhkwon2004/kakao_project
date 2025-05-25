export function Logo({ className, size = "md", showSubtitle = false }: LogoProps) {
  const router = useRouter()

  const handleLogoClick = () => {
    router.push("/home")
  }

  // 고정된 이미지 로고 경로
  const logoSrc = "/images/kakao-fanance-logo.png"

  // 크기별 설정
  const logoDimensions = {
    sm: { width: 96, height: 32 },
    md: { width: 140, height: 48 },
    lg: { width: 200, height: 64 },
  }

  const { width, height } = logoDimensions[size]

  return (
    <div
      className={cn("flex items-center cursor-pointer", className)}
      onClick={handleLogoClick}
      style={{ marginLeft: "0px", marginRight: "0px" }}
    >
      <Image
        src={logoSrc}
        alt="Kakao FANance 로고"
        width={width}
        height={height}
        className="object-contain"
        priority
      />

      {showSubtitle && <span className="ml-2 text-xs text-gray">웹툰 투자 플랫폼</span>}
    </div>
  )
}
