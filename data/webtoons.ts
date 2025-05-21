// webtoons.ts - 웹툰 데이터 소스
// 이 파일은 웹툰 정보를 저장하는 데이터 소스입니다.
// 실제 프로덕션에서는 API나 데이터베이스에서 가져올 수 있습니다.

export interface Webtoon {
  id: string
  title: string
  titleKorean?: string
  director?: string
  distributor?: string
  productionPeriod?: string
  investment?: string | number
  description?: string
  thumbnail?: string
  link?: string
  daysLeft?: number
  fundingPercentage?: number
  category?: string
  status?: "ongoing" | "completed"
  expectedROI?: string
  fundingGoal?: string
  currentRaised?: number
  goalAmount?: number
  totalInvestors?: number
  summary?: string
  updateLog?: string
}

// 드라마화된 인기 웹툰 데이터
export const featuredDramas: Webtoon[] = [
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
    thumbnail: "/images/true-beauty.jpeg",
    link: "https://www.tving.com/contents/true-beauty",
    status: "completed",
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
    thumbnail: "/images/yumis-cells.webp",
    link: "https://www.tving.com/contents/yumis-cells",
    status: "completed",
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
    thumbnail: "/images/sweet-home.webp",
    link: "https://www.netflix.com/title/81061734",
    status: "completed",
  },
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
    thumbnail: "/images/itaewon.webp",
    link: "https://tv.jtbc.co.kr/itaewonclass",
    status: "completed",
  },
  {
    id: "uncanny-counter",
    title: "The Uncanny Counter",
    titleKorean: "경이로운 소문",
    director: "유선동",
    distributor: "OCN, Netflix",
    productionPeriod: "2020.11 ~ 2021.01",
    investment: "₩1,800,000,000",
    description:
      "악귀를 잡는 카운터들의 활약을 그린 액션 판타지 드라마. 평범한 국수집 직원들이 밤에는 악귀 사냥꾼으로 변신하는 독특한 설정과 화려한 액션으로 인기를 얻었습니다.",
    thumbnail: "/images/uncanny-counter.jpeg",
    link: "https://www.netflix.com/title/81323551",
    status: "completed",
  },
]

// 투자 가능한 웹툰 데이터
export const investmentWebtoons: Webtoon[] = [
  {
    id: "empress-marking-traitor",
    title: "황녀, 반역자를 각인시키다",
    daysLeft: 7,
    fundingPercentage: 65,
    category: "판타지",
    status: "ongoing",
    expectedROI: "12-18%",
    fundingGoal: "₩500,000,000",
    description: "드라마 제작 진행 중",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=황녀, 반역자를 각인시키다",
    currentRaised: 325000000,
    goalAmount: 500000000,
    totalInvestors: 1250,
    summary: `"황녀, 반역자를 각인시키다"는 판타지 로맨스 웹툰으로, 반역자로 몰린 황녀 아리아나가 자신의 결백을 증명하고 왕국을 되찾기 위한 여정을 그립니다.

아리아나는 어릴 적 친구이자 현재 적국의 왕자인 카이든과 재회하게 되고, 그들은 함께 아리아나를 모함한 진짜 반역자를 찾아 나섭니다.

이 작품은 웹툰으로 큰 인기를 얻었으며, 현재 드라마 제작이 진행 중입니다. 주요 배우 캐스팅이 완료되었으며, 2023년 3분기에 촬영을 시작할 예정입니다.`,
    updateLog:
      "제작팀이 주요 캐릭터 캐스팅을 완료했습니다. 대본 수정 작업이 진행 중입니다. 2023년 3분기에 촬영 시작 예정입니다.",
  },
  {
    id: "youngest-son-swordsman",
    title: "검술명가 막내아들",
    daysLeft: 10,
    fundingPercentage: 45,
    category: "액션",
    status: "ongoing",
    expectedROI: "15-22%",
    fundingGoal: "₩800,000,000",
    description: "애니메이션 프로젝트",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=검술명가 막내아들",
    currentRaised: 360000000,
    goalAmount: 800000000,
    totalInvestors: 850,
    summary:
      "검술명가의 막내아들이 가문의 비밀을 알게 되면서 시작되는 모험과 성장을 그린 작품입니다. 화려한 액션과 탄탄한 스토리로 많은 사랑을 받고 있습니다.",
    updateLog: "애니메이션 제작사와 계약 체결 완료. 캐릭터 디자인 작업 중입니다.",
  },
  {
    id: "this-life-family-head",
    title: "이번 생은 가주가 되겠습니다",
    daysLeft: 5,
    fundingPercentage: 72,
    category: "판타지",
    status: "ongoing",
    expectedROI: "18-25%",
    fundingGoal: "₩1,200,000,000",
    description: "영화 각색 진행 중",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=이번 생은 가주가 되겠습니다",
    currentRaised: 864000000,
    goalAmount: 1200000000,
    totalInvestors: 1500,
    summary:
      "몰락한 귀족 가문의 후계자가 시간을 되돌려 가문을 재건하는 과정을 그린 판타지 작품입니다. 정치적 음모와 성장 스토리가 잘 어우러진 인기작입니다.",
    updateLog: "영화 각본 작업 완료. 주연 배우 캐스팅 진행 중입니다.",
  },
  {
    id: "rabbit-jerky-symbiosis",
    title: "토끼와 육포범의 공생관계",
    daysLeft: 3,
    fundingPercentage: 85,
    category: "로맨스",
    status: "ongoing",
    expectedROI: "14-20%",
    fundingGoal: "₩600,000,000",
    description: "드라마 제작 기획",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=토끼와 육포범의 공생관계",
    currentRaised: 510000000,
    goalAmount: 600000000,
    totalInvestors: 1100,
    summary:
      "성격이 전혀 다른 두 사람이 우연한 계기로 함께 살게 되면서 벌어지는 로맨틱 코미디입니다. 유쾌한 전개와 따뜻한 감성으로 많은 독자들의 사랑을 받고 있습니다.",
    updateLog: "드라마 제작 기획안 승인. 각본 작업 시작 예정입니다.",
  },
  {
    id: "bad-secretary",
    title: "나쁜 비서 [19세 완전판]",
    daysLeft: 0,
    fundingPercentage: 100,
    category: "로맨스",
    status: "completed",
    expectedROI: "10-15%",
    fundingGoal: "₩300,000,000",
    description: "웹드라마 제작",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=나쁜 비서",
    currentRaised: 300000000,
    goalAmount: 300000000,
    totalInvestors: 750,
    summary:
      "냉철한 CEO와 그의 비밀을 알게 된 비서의 로맨스를 그린 작품입니다. 성인 소재를 다루고 있어 19세 이상 시청가로 제작되었습니다.",
    updateLog: "웹드라마 제작 완료. OTT 플랫폼 공개 예정입니다.",
  },
  {
    id: "iron-blood-hunting-dog",
    title: "철혈검가 사냥개의 회귀",
    daysLeft: 0,
    fundingPercentage: 100,
    category: "액션",
    status: "completed",
    expectedROI: "16-23%",
    fundingGoal: "₩700,000,000",
    description: "애니메이션 제작",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=철혈검가 사냥개의 회귀",
    currentRaised: 700000000,
    goalAmount: 700000000,
    totalInvestors: 1300,
    summary:
      "몰락한 검술 가문의 후계자가 과거로 돌아와 가문을 재건하고 복수를 완성해가는 과정을 그린 액션 판타지입니다.",
    updateLog: "애니메이션 제작 완료. 글로벌 스트리밍 서비스 계약 체결했습니다.",
  },
  {
    id: "contract-husband-ran-away",
    title: "계약 남편이 남자 주인공과 달았다",
    daysLeft: 15,
    fundingPercentage: 30,
    category: "로맨스",
    status: "ongoing",
    expectedROI: "12-18%",
    fundingGoal: "₩400,000,000",
    description: "웹드라마 제작",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=계약 남편이 남자 주인공과 달았다",
    currentRaised: 120000000,
    goalAmount: 400000000,
    totalInvestors: 450,
    summary:
      "계약 결혼을 한 남편이 소설 속 남자 주인공과 사랑에 빠지게 되면서 벌어지는 코믹한 상황을 그린 BL 로맨스입니다.",
    updateLog: "웹드라마 기획안 승인. 캐스팅 작업 진행 중입니다.",
  },
  {
    id: "villain-orca-baby",
    title: "흑막 범고래 아기님",
    daysLeft: 12,
    fundingPercentage: 55,
    category: "판타지",
    status: "ongoing",
    expectedROI: "18-25%",
    fundingGoal: "₩900,000,000",
    description: "애니메이션 제작",
    thumbnail: "/abstract-geometric-shapes.png?height=300&width=225&query=흑막 범고래 아기님",
    currentRaised: 495000000,
    goalAmount: 900000000,
    totalInvestors: 980,
    summary:
      "악역으로 태어났지만 귀여운 범고래 아기가 세상을 구하는 히어로가 되어가는 과정을 그린 판타지 작품입니다. 독특한 설정과 귀여운 캐릭터로 인기를 얻고 있습니다.",
    updateLog: "애니메이션 제작사 선정 완료. 캐릭터 디자인 및 스토리보드 작업 중입니다.",
  },
]

// 모든 웹툰 데이터 (드라마화된 웹툰 + 투자 가능한 웹툰)
export const allWebtoons: Webtoon[] = [...featuredDramas, ...investmentWebtoons]

// 웹툰 ID로 웹툰 정보 찾기
export function getWebtoonById(id: string): Webtoon | undefined {
  return allWebtoons.find((webtoon) => webtoon.id === id)
}

// 기존 allWebtoons를 webtoons라는 이름으로도 export
export const webtoons = allWebtoons
