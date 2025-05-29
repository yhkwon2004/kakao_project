"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const router = useRouter()

  const handleTouch = () => {
    setFadeOut(true)
    setTimeout(() => {
      setIsVisible(false)
      router.push("/login")
    }, 500)
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-green-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
      onClick={handleTouch}
      onTouchStart={handleTouch}
    >
      <div className="flex flex-col items-center space-y-8 animate-fade-in-up">
        <div className="relative">
          <Image
            src="/images/main-logo.png"
            alt="WX WEEK"
            width={320}
            height={240}
            className="w-80 h-60 sm:w-96 sm:h-72 lg:w-[400px] lg:h-80 object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="flex space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-black text-sm font-medium opacity-70">v1.9.9</p>
        </div>
      </div>
    </div>
  )
}
