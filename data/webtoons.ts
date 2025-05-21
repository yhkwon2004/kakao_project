// webtoons.ts - 웹툰 데이터 소스
// 이 파일은 웹툰 정보를 저장하는 데이터 소스입니다.
// 실제 프로덕션에서는 API나 데이터베이스에서 가져올 수 있습니다.

export interface Webtoon {
  id: string
  title: string
  titleKorean: string
  director: string
  distributor: string
  productionPeriod: string
  investment: string | number
  description: string
  thumbnail: string
  link: string
}

export const webtoons: Webtoon[] = [
  {
    id: "itaewon-class",
    title: "Itaewon Class",
    titleKorean: "이태원 클라쓰",
    director: "김성윤",
    distributor: "JTBC, Netflix",
    productionPeriod: "2019.07 ~ 2020.01",
    investment: "Private",
    description:
      "청춘과 복수를 주제로 한 웹툰 원작 드라마. 서울 이태원을 배경으로 창업과 정의에 관한 강한 주제를 다룹니다. 박새로이의 성공 스토리와 함께 사회적 불평등에 대한 비판을 담고 있습니다.",
    thumbnail: "/images/itaewon.png",
    link: "https://tv.jtbc.co.kr/itaewonclass",
  },
  {
    id: "yumis-cells",
    title: "Yumi's Cells",
    titleKorean: "유미의 세포들",
    director: "이상엽",
    distributor: "tvN",
    productionPeriod: "2020.08 ~ 2021.05",
    investment: "₩1,500,000,000",
    description:
      "평범한 직장인 유미의 일상과 연애를 그녀의 뇌 속 세포들의 관점에서 그린 독특한 로맨스 드라마. 애니메이션과 실사를 결합한 새로운 형식의 드라마로 원작 웹툰의 인기를 이어갔습니다.",
    thumbnail: "/images/yumis-cells.png",
    link: "https://www.tving.com/contents/yumis-cells",
  },
  {
    id: "sweet-home",
    title: "Sweet Home",
    titleKorean: "스위트홈",
    director: "이응복",
    distributor: "Netflix",
    productionPeriod: "2019.12 ~ 2020.08",
    investment: "₩2,700,000,000",
    description:
      "폐쇄된 아파트에서 괴물로 변해가는 사람들과 살아남기 위해 싸우는 주인공의 이야기. 공포와 생존을 주제로 한 웹툰 원작의 넷플릭스 오리지널 시리즈로, 국내외에서 큰 인기를 얻었습니다.",
    thumbnail: "/images/sweet-home.png",
    link: "https://www.netflix.com/title/81061734",
  },
  {
    id: "true-beauty",
    title: "True Beauty",
    titleKorean: "여신강림",
    director: "김상협",
    distributor: "tvN",
    productionPeriod: "2020.10 ~ 2021.02",
    investment: "₩1,200,000,000",
    description:
      "외모 콤플렉스를 가진 여고생이 메이크업을 통해 '여신'으로 변신하며 겪는 성장과 로맨스 이야기. 외모지상주의에 대한 비판과 자아 발견의 메시지를 담고 있는 인기 웹툰 원작 드라마입니다.",
    thumbnail: "/images/true-beauty.png",
    link: "https://www.tving.com/contents/true-beauty",
  },
]

// 웹툰 ID로 웹툰 정보 찾기
export function getWebtoonById(id: string): Webtoon | undefined {
  return webtoons.find((webtoon) => webtoon.id === id)
}
