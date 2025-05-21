"use client"

import { useRouter } from "next/navigation"
import { Home, Users, Wallet, User } from "lucide-react"
import { cn } from "@/lib/utils"

type BottomNavigationProps = {
  activeTab: "home" | "community" | "asset" | "mypage"
}

export function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const router = useRouter()

  const tabs = [
    {
      id: "home",
      label: "홈",
      icon: Home,
      href: "/home",
    },
    {
      id: "community",
      label: "커뮤니티",
      icon: Users,
      href: "/community",
    },
    {
      id: "asset",
      label: "자산관리",
      icon: Wallet,
      href: "/asset",
    },
    {
      id: "mypage",
      label: "마이페이지",
      icon: User,
      href: "/mypage",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-light dark:bg-dark border-t border-gray/10 shadow-lg rounded-t-3xl">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className="flex flex-col items-center justify-center w-full h-full"
              onClick={() => router.push(tab.href)}
            >
              <tab.icon className={cn("w-5 h-5 mb-1", isActive ? "text-green" : "text-gray")} />
              <span className={cn("text-xs", isActive ? "text-green font-medium" : "text-gray")}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
