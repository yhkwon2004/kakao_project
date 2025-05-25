import { WebtoonDetail } from "@/components/webtoon-detail"

export default function WebtoonDetailPage({ params }: { params: { slug: string } }) {
  return (
    <main className="flex min-h-screen flex-col">
      <WebtoonDetail id={params.slug} />
    </main>
  )
}
