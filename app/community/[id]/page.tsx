import { CommunityPostDetailScreen } from "@/components/community-post-detail-screen"

interface CommunityPostDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CommunityPostDetailPage({ params }: CommunityPostDetailPageProps) {
  const { id } = await params

  return (
    <main className="flex min-h-screen flex-col">
      <CommunityPostDetailScreen postId={id} />
    </main>
  )
}
