// webtoons.ts - 웹툰 데이터 소스
// 이 파일은 웹툰 정보를 저장하는 데이터 소스입니다.
// 실제 프로덕션에서는 API나 데이터베이스에서 가져올 수 있습니다.

export interface Webtoon {
  id: string
  title: string
  titleEnglish?: string
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
  genre?: string
  ageRating?: string
  productionCompany?: string
  isDramatized?: boolean // 드라마화 여부를 표시하는 새 필드
  currentROI?: number
}

// 드라마화된 인기 웹툰 데이터
export const featuredDramas: Webtoon[] = [
  {
    id: "true-beauty",
    title: "여신강림",
    titleEnglish: "True Beauty",
    director: "김상협",
    distributor: "tvN",
    productionPeriod: "2020.10 ~ 2021.02",
    investment: "₩1,200,000,000",
    description:
      "외모 콤플렉스를 가진 여고생이 메이크업을 통해 '여신'으로 변신하며 겪는 성장과 로맨스 이야기. 외모지상주의에 대한 비판과 자아 발견의 메시지를 담고 있는 인기 웹툰 원작 드라마입니다.",
    thumbnail: "/images/true-beauty.jpeg",
    link: "https://www.tving.com/contents/true-beauty",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 1200000000,
    goalAmount: 1200000000,
    totalInvestors: 3500,
    isDramatized: true,
    summary:
      "외모 콤플렉스를 가진 주경은 우연히 메이크업을 알게 되고 '여신'으로 변신하게 됩니다. 학교에서 인기 많은 수호와 서준 사이에서 벌어지는 로맨스와 함께, 자신의 진정한 모습을 숨기며 살아가는 주경의 성장 이야기를 그립니다. 외모지상주의 사회에 대한 비판과 진정한 아름다움의 의미를 되새기게 하는 작품입니다.",
  },
  {
    id: "yumis-cells",
    title: "유미의 세포들",
    titleEnglish: "Yumi's Cells",
    director: "이상엽",
    distributor: "tvN",
    productionPeriod: "2020.08 ~ 2021.05",
    investment: "₩1,500,000,000",
    description:
      "평범한 직장인 유미의 일상과 연애를 그녀의 뇌 속 세포들의 관점에서 그린 독특한 로맨스 드라마. 애니메이션과 실사를 결합한 새로운 형식의 드라마로 원작 웹툰의 인기를 이어갔습니다.",
    thumbnail: "/images/yumis-cells.webp",
    link: "https://www.tving.com/contents/yumis-cells",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 1500000000,
    goalAmount: 1500000000,
    totalInvestors: 4200,
    isDramatized: true,
    summary:
      "평범한 직장인 유미의 일상과 연애를 그녀의 뇌 속에서 일하는 다양한 세포들의 관점에서 그린 독특한 로맨스 드라마입니다. 사랑, 우정, 직장 생활 등 일상의 모든 결정이 세포들의 활동으로 이루어진다는 재미있는 설정을 통해 인간의 감정과 행동을 유쾌하게 표현합니다. 애니메이션과 실사를 결합한 새로운 형식으로 원작 웹툰의 인기를 성공적으로 이어갔습니다.",
  },
  {
    id: "sweet-home",
    title: "스위트홈",
    titleEnglish: "Sweet Home",
    director: "이응복",
    distributor: "Netflix",
    productionPeriod: "2019.12 ~ 2020.08",
    investment: "₩2,700,000,000",
    description:
      "폐쇄된 아파트에서 괴물로 변해가는 사람들과 살아남기 위해 싸우는 주인공의 이야기. 공포와 생존을 주제로 한 웹툰 원작의 넷플릭스 오리지널 시리즈로, 국내외에서 큰 인기를 얻었습니다.",
    thumbnail: "/images/sweet-home.webp",
    link: "https://www.netflix.com/title/81061734",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 2700000000,
    goalAmount: 2700000000,
    totalInvestors: 5800,
    isDramatized: true,
    summary:
      "인간의 욕망이 괴물로 형상화되는 세상에서, 폐쇄된 아파트에 고립된 사람들의 생존 이야기를 그린 작품입니다. 은둔형 외톨이 현수가 가족을 잃고 이사 온 그린홈 아파트에서 사람들이 괴물로 변해가는 기이한 현상을 목격하게 됩니다. 인간성의 상실과 회복, 생존을 위한 투쟁과 희생을 통해 인간 본연의 모습에 대한 질문을 던지는 묵직한 메시지를 담고 있습니다.",
  },
  {
    id: "itaewon-class",
    title: "이태원 클라쓰",
    titleEnglish: "Itaewon Class",
    director: "김성윤",
    distributor: "JTBC, Netflix",
    productionPeriod: "2019.07 ~ 2020.01",
    investment: "₩2,200,000,000",
    description:
      "청춘과 복수를 주제로 한 웹툰 원작 드라마. 서울 이태원을 배경으로 창업과 정의에 관한 강한 주제를 다룹니다. 박새로이의 성공 스토리와 함께 사회적 불평등에 대한 비판을 담고 있습니다.",
    thumbnail: "/images/itaewon.webp",
    link: "https://tv.jtbc.co.kr/itaewonclass",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 2200000000,
    goalAmount: 2200000000,
    totalInvestors: 4800,
    isDramatized: true,
    summary:
      "아버지의 억울한 죽음 이후 복수를 다짐한 박새로이가 이태원에서 펍 사업을 시작하며 대형 외식 기업 장가와 맞서는 이야기입니다. 전과자, 트랜스젠더, 흑인 등 사회적 소수자들과 함께 꾸린 팀으로 성공을 향해 나아가는 과정을 그립니다. 사회적 불평등과 차별에 맞서는 정의로운 투쟁과 함께, 꿈을 향해 나아가는 청춘들의 열정과 성장을 담아낸 작품입니다.",
  },
  {
    id: "uncanny-counter",
    title: "경이로운 소문",
    titleEnglish: "The Uncanny Counter",
    director: "유선동",
    distributor: "OCN, Netflix",
    productionPeriod: "2020.11 ~ 2021.01",
    investment: "₩1,800,000,000",
    description:
      "악귀를 잡는 카운터들의 활약을 그린 액션 판타지 드라마. 평범한 국수집 직원들이 밤에는 악귀 사냥꾼으로 변신하는 독특한 설정과 화려한 액션으로 인기를 얻었습니다.",
    thumbnail: "/images/uncanny-counter.jpeg",
    link: "https://www.netflix.com/title/81323551",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 1800000000,
    goalAmount: 1800000000,
    totalInvestors: 3800,
    isDramatized: true,
    summary:
      "낮에는 국수집에서 일하고 밤에는 악귀를 사냥하는 '카운터'들의 이야기입니다. 특별한 능력을 가진 소년 소문이 카운터 팀에 합류하면서 벌어지는 액션 판타지 드라마로, 악귀들과의 전투와 함께 소문의 과거와 연결된 비밀이 서서히 밝혀집니다. 화려한 액션과 따뜻한 인간애, 그리고 정의를 향한 투쟁을 그린 작품으로, 독특한 설정과 매력적인 캐릭터들로 많은 사랑을 받았습니다.",
  },
  {
    id: "moving",
    title: "무빙",
    titleEnglish: "Moving",
    director: "박인제",
    distributor: "Disney+",
    productionPeriod: "2021.05 ~ 2023.02",
    investment: "₩3,500,000,000",
    description: "초능력을 가진 부모와 그 능력을 물려받은 아이들의 이야기를 그린 액션 드라마.",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Z0AGqK3cuZM9JSvek7kONbiOiqh9xEyDCFArvgbKBq2I_7YYWJVkFJwy88xk7UXpsKDFgaNR9CD9ZguIZHZ3Ow-BjnzHcma5eiSremARGpgXQq0ts5Fs9.webp",
    link: "https://www.disneyplus.com/ko-kr/series/moving/4iy3zBgWsVXV",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 3500000000,
    goalAmount: 3500000000,
    totalInvestors: 7200,
    genre: "액션, 판타지",
    ageRating: "15",
    director: "박인제",
    productionCompany: "스튜디오드래곤",
    distributor: "Disney+",
    isDramatized: true,
    summary:
      "강대규 작가의 인기 웹툰 '무빙'은 초능력을 가진 부모들과 그 능력을 물려받은 아이들의 이야기를 그립니다. 과거 국가의 비밀 프로젝트에 참여했던 초능력자들이 은둔하며 살아가던 중, 그들의 자녀들이 평범한 고등학생으로 자라 자신의 능력을 숨기고 살아가는 이야기를 담고 있습니다. 하지만 과거의 적들이 다시 나타나면서 아이들과 부모들은 각자의 능력을 받아들이고 위기에 맞서게 됩니다. 하늘을 나는 능력, 초인적인 힘과 속도, 불사의 능력 등 다양한 초능력자들의 활약과 함께 가족의 의미와 정체성에 대한 깊은 메시지를 담은 작품입니다.",
  },
  {
    id: "hospital-playlist",
    title: "슬기로운 의사생활",
    titleEnglish: "Hospital Playlist",
    director: "신원호",
    distributor: "tvN, Netflix",
    productionPeriod: "2019.10 ~ 2021.06",
    investment: "₩2,800,000,000",
    description: "의과대학 시절부터 함께한 다섯 명의 의사들의 병원 생활과 우정, 사랑을 그린 의학 드라마.",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oWgn-zmCXeWq0fDCyE-E0FGc2UJHhghlPq-_APkwwjg7Di5K6tA1jPeiZ_73mTf0nYJsfeE1MEdW0LWBDYmSnQ-82RwcNKkENUJ1FsjgEB2Z9Hz5e1SWh.webp",
    link: "https://www.netflix.com/title/81239224",
    status: "completed",
    fundingPercentage: 100,
    currentRaised: 2800000000,
    goalAmount: 2800000000,
    totalInvestors: 6100,
    genre: "의학, 드라마, 코미디",
    ageRating: "15",
    director: "신원호",
    productionCompany: "에그이즈커밍",
    distributor: "tvN, Netflix",
    isDramatized: true,
    summary:
      "이우정 작가의 웹툰 '슬기로운 의사생활'은 의과대학 시절부터 20년 지기 친구인 다섯 명의 의사들이 한 병원에서 근무하며 겪는 일상, 우정, 사랑을 그린 의학 드라마입니다. 각기 다른 성격과 전문 분야를 가진 의사들이 바쁜 병원 생활 속에서도 밴드 활동을 하며 서로에게 위안을 얻습니다. 환자들의 생명을 다루는 무거운 책임감 속에서도 유머와 따뜻함을 잃지 않는 의사들의 모습을 통해 의료진의 진정한 모습과 인간적인 면모를 보여줍니다. 현실적인 병원 생활과 의사들의 고민, 그리고 그 속에서 피어나는 우정과 사랑을 섬세하게 그려낸 작품입니다.",
  },
]

// 투자 가능한 웹툰 데이터 - 업데이트된 정보
export const investmentWebtoons: Webtoon[] = [
  {
    id: "princess-imprinting-traitor",
    title: "황녀, 반역자를 각인시키다",
    titleEnglish: "Princess Imprinting Traitor",
    daysLeft: 7,
    fundingPercentage: 65,
    category: "판타지",
    status: "ongoing",
    expectedROI: "12%",
    fundingGoal: "₩8,500,000,000",
    description: "드라마 제작 진행 중",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%ED%99%A9%EB%85%80%20%EB%B0%98%EC%97%AD%EC%9E%90%EB%A5%BC%20%EA%B0%81%EC%9D%B8%EC%8B%9C%ED%82%A4%EB%8B%A4-Jbo8GECRSceXINDEwkFXNsRcbG4Hv9.webp",
    currentRaised: 4225000000,
    goalAmount: 6500000000,
    totalInvestors: 1000,
    currentROI: 10.8,
    genre: "판타지, 로맨스",
    ageRating: "15",
    director: "김지원",
    productionCompany: "드림스튜디오",
    distributor: "넷플릭스",
    isDramatized: false,
    summary:
      "판타지 로맨스 웹툰으로, 반역자로 몰린 황녀 아리아나가 자신의 결백을 증명하고 왕국을 되찾기 위한 여정을 그립니다.",
    updateLog: "제작팀이 주요 캐릭터 캐스팅을 완료했습니다. 대본 수정 작업이 진행 중입니다.",
  },
  {
    id: "becoming-family-head-this-life",
    title: "이번 생은 가주가 되겠습니다",
    titleEnglish: "Becoming Family Head This Life",
    daysLeft: 5,
    fundingPercentage: 72,
    category: "판타지",
    status: "ongoing",
    expectedROI: "15%",
    fundingGoal: "₩10,000,000,000",
    description: "영화 각색 진행 중",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%9D%B4%EB%B2%88%EC%83%9D%EC%9D%80%20%EA%B0%80%EC%A3%BC%EA%B0%80%20%EB%90%98%EA%B2%A0%EC%8A%B5%EB%8B%88%EB%8B%A4.jpg-W5inA1RVRC63Mq6QnASh4BOeLfyW9c.jpeg",
    currentRaised: 6120000000,
    goalAmount: 8500000000,
    totalInvestors: 1745,
    currentROI: 10.9,
    genre: "판타지, 액션",
    ageRating: "15",
    director: "이수진",
    productionCompany: "영화제작소",
    distributor: "CGV",
    isDramatized: false,
    summary: "몰락한 귀족 가문의 후계자가 시간을 되돌려 가문을 재건하는 과정을 그린 판타지 작품입니다.",
    updateLog: "영화 각본 작업 완료. 주연 배우 캐스팅 진행 중입니다.",
  },
  {
    id: "villain-orca-baby",
    title: "흑막 범고래 아기님",
    titleEnglish: "Villain Orca Baby",
    daysLeft: 12,
    fundingPercentage: 55,
    category: "판타지",
    status: "ongoing",
    expectedROI: "13%",
    fundingGoal: "₩7,200,000,000",
    description: "애니메이션 제작",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%ED%9D%91%EB%A7%89%20%EB%B2%94%EA%B3%A0%EB%9E%98%20%EC%95%84%EA%B8%B0%EB%8B%98.jpg-utWhRepRcWcST3q00IbLH6wzFaotML.jpeg",
    currentRaised: 4125000000,
    goalAmount: 7500000000,
    totalInvestors: 1540,
    currentROI: 10.2,
    genre: "판타지, 코미디",
    ageRating: "전체",
    director: "박서준",
    productionCompany: "키즈 애니메이션",
    distributor: "디즈니+",
    isDramatized: false,
    summary: "악역으로 태어났지만 귀여운 범고래 아기가 세상을 구하는 히어로가 되어가는 과정을 그린 판타지 작품입니다.",
    updateLog: "애니메이션 제작사 선정 완료. 캐릭터 디자인 및 스토리보드 작업 중입니다.",
  },
  {
    id: "rabbit-jerky-wolf-symbiotic-relationship",
    title: "토끼와 육포범의 공생관계",
    titleEnglish: "Rabbit and Jerky Wolf Symbiotic Relationship",
    daysLeft: 3,
    fundingPercentage: 85,
    category: "로맨스",
    status: "ongoing",
    expectedROI: "14%",
    fundingGoal: "₩6,000,000,000",
    description: "드라마 제작 기획",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%ED%86%A0%EB%81%BC%EC%99%80%20%EC%9C%A1%ED%8F%AC%EB%B2%94%EC%9D%98%20%EA%B3%B5%EC%83%9D%EA%B4%80%EA%B3%84-WsUNXB14hVKWCjqf11WCXyE9Q74wcG.webp",
    currentRaised: 5950000000,
    goalAmount: 7000000000,
    totalInvestors: 1635,
    currentROI: 12.3,
    genre: "로맨스, 코미디",
    ageRating: "15",
    director: "정다은",
    productionCompany: "로맨스 스튜디오",
    distributor: "티빙",
    isDramatized: false,
    summary: "성격이 전혀 다른 두 사람이 우연한 계기로 함께 살게 되면서 벌어지는 로맨틱 코미디입니다.",
    updateLog: "드라마 제작 기획안 승인. 각본 작업 시작 예정입니다.",
  },
  {
    id: "sword-family-youngest-son",
    title: "검술명가 막내아들",
    titleEnglish: "Sword Family Youngest Son",
    daysLeft: 10,
    fundingPercentage: 45,
    category: "액션",
    status: "ongoing",
    expectedROI: "10%",
    fundingGoal: "₩9,500,000,000",
    description: "애니메이션 프로젝트",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EA%B2%80%EC%88%A0%EB%AA%85%EA%B0%80%20%EB%A7%89%EB%82%B4%EC%95%84%EB%93%A4.jpg-QoBfgDb2gahteRFLThe2MBCTdVGlzr.jpeg",
    currentRaised: 2700000000,
    goalAmount: 6000000000,
    totalInvestors: 913,
    currentROI: 8.6,
    genre: "액션, 판타지",
    ageRating: "15",
    director: "박민호",
    productionCompany: "애니메이션 스튜디오",
    distributor: "크런치롤",
    isDramatized: false,
    summary: "검술명가의 막내아들이 가문의 비밀을 알게 되면서 시작되는 모험과 성장을 그린 작품입니다.",
    updateLog: "애니메이션 제작사와 계약 체결 완료. 캐릭터 디자인 작업 중입니다.",
  },
  {
    id: "ancient-magus-bride",
    title: "마법사의 신부",
    titleEnglish: "The Ancient Magus' Bride",
    daysLeft: 8,
    fundingPercentage: 60,
    category: "판타지",
    status: "ongoing",
    expectedROI: "11%",
    fundingGoal: "₩8,000,000,000",
    description: "애니메이션 제작",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%A7%88%EB%B2%95%EC%82%AC%EC%9D%98%20%EC%8B%A0%EB%B6%80.jpg-0TuwngyXJA9O9GnrcbZMOJZr2qPbZI.jpeg",
    currentRaised: 3900000000,
    goalAmount: 6500000000,
    totalInvestors: 1215,
    currentROI: 9.3,
    genre: "판타지, 로맨스",
    ageRating: "15",
    director: "김현지",
    productionCompany: "판타지 스튜디오",
    distributor: "애니플러스",
    isDramatized: false,
    summary: "마법의 세계에서 인간 소녀와 마법사의 만남을 그린 판타지 로맨스입니다.",
    updateLog: "애니메이션 제작 기획 단계. 스토리보드 작업 중입니다.",
  },
  {
    id: "contract-husband-resembles-male-lead",
    title: "계약 남편이 남자 주인공과 닮았다",
    titleEnglish: "Contract Husband Resembles Male Lead",
    daysLeft: 15,
    fundingPercentage: 30,
    category: "로맨스",
    status: "ongoing",
    expectedROI: "7%",
    fundingGoal: "₩5,500,000,000",
    description: "웹드라마 제작",
    thumbnail: "/images/contract-husband-resembles-male-lead-new.jpeg",
    currentRaised: 1650000000,
    goalAmount: 5500000000,
    totalInvestors: 710,
    currentROI: 5.7,
    genre: "로맨스, BL",
    ageRating: "15",
    director: "이지민",
    productionCompany: "BL 스튜디오",
    distributor: "왓챠",
    isDramatized: false,
    summary:
      "계약 결혼을 한 남편이 소설 속 남자 주인공과 사랑에 빠지게 되면서 벌어지는 코믹한 상황을 그린 BL 로맨스입니다.",
    updateLog: "웹드라마 기획안 승인. 캐스팅 작업 진행 중입니다.",
  },
  {
    id: "bad-secretary",
    title: "나쁜 비서",
    titleEnglish: "Bad Secretary",
    daysLeft: 0,
    fundingPercentage: 100,
    category: "로맨스",
    status: "completed",
    expectedROI: "8%",
    fundingGoal: "₩5,000,000,000",
    description: "웹드라마 제작",
    thumbnail: "/images/나쁜-비서-cover.png",
    currentRaised: 5000000000,
    goalAmount: 5000000000,
    totalInvestors: 1301,
    currentROI: 13.0,
    genre: "로맨스, 드라마",
    ageRating: "19",
    director: "김태희",
    productionCompany: "어덜트 컨텐츠",
    distributor: "웨이브",
    isDramatized: false,
    summary: "냉철한 CEO와 그의 비밀을 알게 된 비서의 로맨스를 그린 작품입니다.",
    updateLog: "웹드라마 제작 완료. OTT 플랫폼 공개 예정입니다.",
  },
  {
    id: "blood-sword-family-hunting-dog",
    title: "철혈검가 사냥개의 회귀",
    titleEnglish: "Blood Sword Family Hunting Dog",
    daysLeft: 0,
    fundingPercentage: 100,
    category: "액션",
    status: "completed",
    expectedROI: "9%",
    fundingGoal: "₩7,500,000,000",
    description: "애니메이션 제작",
    thumbnail:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EC%B2%A0%ED%98%88%EB%AA%85%EA%B0%80%20%EC%82%AC%EB%83%A5%EA%B0%9C%EC%9D%98%20%ED%9A%8C%EA%B7%80-X981ByQhltgljhDTJh5JqkCHp7yohw.webp",
    currentRaised: 8000000000,
    goalAmount: 8000000000,
    totalInvestors: 1770,
    currentROI: 14.1,
    genre: "액션, 판타지",
    ageRating: "15",
    director: "최준호",
    productionCompany: "액션 스튜디오",
    distributor: "넷플릭스",
    isDramatized: false,
    summary:
      "몰락한 검술 가문의 후계자가 과거로 돌아와 가문을 재건하고 복수를 완성해가는 과정을 그린 액션 판타지입니다.",
    updateLog: "애니메이션 제작 완료. 글로벌 스트리밍 서비스 계약 체결했습니다.",
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

// 웹툰 데이터 업데이트 함수
export function updateWebtoonData(id: string, updates: Partial<Webtoon>) {
  const storedWebtoons = localStorage.getItem("webtoonsData")
  const webtoonsData = storedWebtoons ? JSON.parse(storedWebtoons) : {}

  webtoonsData[id] = {
    ...webtoonsData[id],
    ...updates,
  }

  localStorage.setItem("webtoonsData", JSON.stringify(webtoonsData))

  // 이벤트 발생으로 다른 컴포넌트에 알림
  window.dispatchEvent(new Event("webtoonDataChanged"))
}

// 업데이트된 웹툰 데이터 가져오기
export function getUpdatedWebtoonById(id: string): Webtoon | undefined {
  const baseWebtoon = getWebtoonById(id)
  if (!baseWebtoon) return undefined

  const storedWebtoons = localStorage.getItem("webtoonsData")
  if (storedWebtoons) {
    const webtoonsData = JSON.parse(storedWebtoons)
    if (webtoonsData[id]) {
      return {
        ...baseWebtoon,
        currentRaised: webtoonsData[id].currentRaised || baseWebtoon.currentRaised,
        fundingPercentage: webtoonsData[id].progress || baseWebtoon.fundingPercentage,
        totalInvestors: webtoonsData[id].totalInvestors || baseWebtoon.totalInvestors,
        status: webtoonsData[id].status || baseWebtoon.status,
        currentROI: webtoonsData[id].currentROI || baseWebtoon.currentROI,
      }
    }
  }

  return baseWebtoon
}

// 모든 웹툰 데이터를 업데이트된 버전으로 가져오기
export function getAllUpdatedWebtoons(): Webtoon[] {
  const storedWebtoons = localStorage.getItem("webtoonsData")
  const webtoonsData = storedWebtoons ? JSON.parse(storedWebtoons) : {}

  return allWebtoons.map((webtoon) => {
    if (webtoonsData[webtoon.id]) {
      return {
        ...webtoon,
        currentRaised: webtoonsData[webtoon.id].currentRaised || webtoon.currentRaised,
        fundingPercentage: webtoonsData[webtoon.id].progress || webtoon.fundingPercentage,
        totalInvestors: webtoonsData[webtoon.id].totalInvestors || webtoon.totalInvestors,
        status: webtoonsData[webtoon.id].status || webtoon.status,
        currentROI: webtoonsData[webtoon.id].currentROI || webtoon.currentROI,
      }
    }
    return webtoon
  })
}
