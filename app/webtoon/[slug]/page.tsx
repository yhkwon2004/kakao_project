import { WebtoonDetail } from "@/components/webtoon-detail"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function WebtoonDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="flex min-h-screen flex-col">
      <WebtoonDetail id={params.slug} />
      <BottomNavigation activeTab="home" />
    </main>
  )
}
