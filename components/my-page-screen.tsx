"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronRight, CreditCard, History, LogOut, Settings, User } from "lucide-react"

export function MyPageScreen() {
  const router = useRouter()

  // Mock user data
  const user = {
    name: "Kim Min-ho",
    points: 50000,
    profileImage: "/placeholder.svg",
  }

  const menuItems = [
    {
      id: "payment",
      label: "Payment & Point Management",
      icon: CreditCard,
      href: "#",
    },
    {
      id: "investment",
      label: "Investment History & Chart View",
      icon: History,
      href: "#",
    },
    {
      id: "account",
      label: "Account Settings",
      icon: Settings,
      href: "#",
    },
  ]

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">My Page</h1>
      </div>

      {/* Profile Section */}
      <div className="p-4">
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="p-6 bg-gradient-to-r from-[#FF8A00]/10 to-[#FFCC00]/10">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-[#8E8E93]">Investor</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-[#8E8E93]">Available Points</p>
                <p className="text-2xl font-bold text-[#FF8A00]">₩{user.points.toLocaleString()}</p>
              </div>
              <Button className="rounded-xl bg-[#FF8A00] hover:bg-[#FF8A00]/90">Add Points</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Section */}
      <div className="p-4">
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <ul className="divide-y">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className="flex items-center justify-between w-full p-4 hover:bg-gray-50"
                    onClick={() => router.push(item.href)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-[#8E8E93]" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#8E8E93]" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          className="w-full rounded-xl border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00]/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
