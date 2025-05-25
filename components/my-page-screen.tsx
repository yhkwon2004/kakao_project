import type React from "react"

export const MyPageScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#323233] pb-24 overflow-y-auto">
      {/* Your page content goes here */}
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">My Page</h1>
        <p>This is a sample page.</p>
      </div>
    </div>
  )
}
