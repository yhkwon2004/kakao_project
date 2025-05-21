// 인기 웹툰 섹션 컴포넌트
// 이 컴포넌트는 메인 페이지에서 인기 웹툰 목록을 표시합니다.
// 각 웹툰 카드는 클릭 시 상세 페이지로 이동합니다.

import { WebtoonCard } from "@/components/webtoon-card"
import { allWebtoons as webtoons } from "@/data/webtoons"

export function PopularWebtoons() {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8">인기 웹툰 드라마화 작품</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {webtoons.map((webtoon) => (
            <WebtoonCard key={webtoon.id} webtoon={webtoon} />
          ))}
        </div>
      </div>
    </section>
  )
}
