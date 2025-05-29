import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showSubtitle?: boolean
  className?: string
}

export function Logo({ size = "md", showSubtitle = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/main-logo.png"
        alt="WX WEEK"
        width={size === "sm" ? 160 : size === "md" ? 200 : 240}
        height={size === "sm" ? 32 : size === "md" ? 40 : 48}
        className={`${sizeClasses[size]} w-auto object-contain`}
        priority
      />
    </div>
  )
}
