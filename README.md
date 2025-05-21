# Kakao FANance 🎬📈

**팬이 웹툰에 투자하고, 드라마로 수익을 창출하는 새로운 문화 펀딩 플랫폼**

👉 [실시간 데모 앱 보기](https://kakaofanance.vercel.app/)  
👉 GitHub 저장소: [kakao_project](git@github.com:yhkwon2004/kakao_project.git)

---

## 🧩 프로젝트 소개

**Kakao FANance**는 팬들이 직접 좋아하는 웹툰에 투자하여, 그 웹툰의 **드라마화** 제작을 함께 완성해가는 **문화 투자 펀딩 플랫폼**입니다.

### 🎯 컨셉: 팬이 만드는 드라마

- 기존 드라마 제작은 고비용, 폐쇄적 구조로 인해 **일반인의 참여가 어려움**
- Kakao FANance는 **웹툰을 기반으로 한 드라마 제작비**를 **팬들의 소액 펀딩**으로 모읍니다.
- 투자자들은 **작품의 성공과 함께 수익을 배분받는 구조**입니다.

---

## 📌 시스템 구조 및 이점

### 🖋 웹툰 작가

- 작품이 드라마화되며 **홍보효과 상승**
- 팬덤 기반 투자로 **제작 속도 가속**

### 🎥 영상 제작자 (감독, 제작사 등)

- 안정적인 제작비 확보로 **재정적 리스크 최소화**

### 👥 사용자 (팬)

- **내가 좋아하는 웹툰에 투자** 가능
- 드라마화 성공 시 **수익 창출 쾌감**과 실질 보상

---

## 💡 유사 사례

### 🐄 토스 송아지 펀딩 (Toss)

- 유저가 송아지에 투자 → 송아지 성장 → 판매 → **수익금 분배**
- Kakao FANance는 이를 **콘텐츠 투자로 확장한 구조**입니다.

---

## 💰 수익 모델

- **펀딩 수수료 모델**  
- 드라마화 성공 시 수익금의 일부를 플랫폼이 수수료로 취득

---

## 🖼 주요 화면

| 홈화면 (웹툰 목록) | 상세 투자 페이지 |
|-------------------|------------------|
| ![홈](./screenshots/home.png) | ![상세](./screenshots/detail.png) |

> 전체 스크린샷은 `/screenshots` 폴더에서 확인 가능합니다.

---

## 🔍 DB Schema (Supabase)

![DB Schema](./supabase-schema-ugbdytdsoqimkrsboyif.svg)

> Supabase에서 관리되는 Kakao FANance의 전체 DB 구조 시각화입니다.
> 주요 테이블: `users`, `webtoons`, `webtoon_details`, `investments`, `favorites`, `asset_history`, `sessions` 등

## 📁 Project File Structure

> 각 폴더/파일의 역할을 주석으로 설명한 구조입니다.

```plaintext
kakao_project/
├── components/                            # UI 재사용 컴포넌트 모음
│   ├── webtoon-detail.tsx                # 웹툰 상세페이지 뷰
│   ├── chart.tsx                         # Recharts 기반 수익률 그래프 컴포넌트
│   ├── investment-card.tsx               # 홈에 보이는 웹툰 투자 카드
│   ├── header.tsx                        # 상단 네비게이션 (로고/검색/테마토글)
│   ├── footer.tsx                        # 하단 정보영역
│   └── ...                               # 기타 버튼, 탭 등 단위 컴포넌트
│
├── pages/                                 # Next.js 페이지 라우팅 디렉토리
│   ├── index.tsx                         # 홈 화면 (웹툰 목록)
│   ├── login.tsx                         # 로그인 / 회원가입 탭
│   ├── webtoon/                          # 슬러그 기반 동적 웹툰 라우팅
│   │   └── [slug].tsx                    # 웹툰 상세페이지 (투자 기능 포함)
│   ├── community.tsx                     # 커뮤니티 게시판
│   ├── mypage.tsx                        # 마이페이지 (언어설정, 테마, 계정관리)
│   └── investment.tsx                    # 자산 관리 및 투자현황 페이지
│
├── lib/                                   # 외부 연동, Supabase 헬퍼 함수
│   ├── supabaseClient.ts                 # Supabase 인스턴스 초기화
│   ├── api.ts                            # 공통 API 요청 함수
│   └── utils.ts                          # 숫자 포맷, 날짜 처리 등 유틸 함수
│
├── public/                                # 정적 리소스 파일
│   ├── webtoons/                         # 각 웹툰의 썸네일 이미지 폴더
│   │   ├── yumis-cells.jpg
│   │   ├── true-beauty.jpg
│   │   └── ...
│   ├── screenshots/                      # README용 UI 캡처 이미지
│   │   ├── home.png
│   │   ├── login.png
│   │   └── detail.png
│   └── favicon.ico                       # 브라우저 파비콘
│
├── styles/                                # 글로벌 CSS 및 Tailwind 설정
│   ├── globals.css                       # 전체 앱에 적용되는 기본 스타일
│   └── tailwind.config.ts               # Tailwind 테마 설정
│
├── supabase-schema.svg                    # Supabase DB 시각화 이미지
├── README.md                              # 프로젝트 설명 문서
├── .env.local                             # 환경 변수 설정 (Supabase 키 등)
├── package.json                           # 의존성, 스크립트 정의
├── tsconfig.json                          # TypeScript 설정
└── next.config.js                         # Next.js 설정
```

## 🛠 사용 기술

- **Frontend**: React (Next.js), TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **배포**: Vercel
- **Social Login**: Google, Kakao, Naver OAuth
- **Chart**: Recharts.js

---

## 📦 설치 및 실행

```bash
# 1. Clone
git clone git@github.com:yhkwon2004/kakao_project.git
cd kakao_project

# 2. 환경변수 설정
cp .env.example .env.local
# 필요한 환경변수 (Supabase URL, Key 등) 입력

# 3. 설치 및 실행
npm install
npm run dev
```

## 👥 Team Introduction – Art in Vest

### 🧑‍💻 팀명: **아트 인 베스트 (Art in Vest)**

> **Art + Invest**의 중의적 조합으로,  
> 예술(웹툰·드라마)과 투자(펀딩)를 연결하는 이 플랫폼의 방향성을 잘 표현합니다.

- ✅ 기억하기 쉬운 발음과 감성적 메시지 내포  
- ✅ "Vest" = 투자 + 입다 → 예술을 입는 투자 경험  
- ✅ PPT/IR에서 예술 + 그래프 이미지 결합 로고 활용 시 강한 인상 기대

---

### 💡 플랫폼명: **Kakao FANance**

> **Finance + Fan** → 팬이 곧 투자자  
> 팬덤의 감정적 소비를 실질적 금융 활동으로 확장한 브랜드 네이밍입니다.

- ✅ 카카오 브랜딩과도 어울리는 자연스러운 명칭  
- ✅ 팬 기반 투자 서비스라는 정체성을 직관적으로 표현

---

### 👨‍👩‍👧‍👦 팀원 구성 및 역할

| 전공 구분    | 이름     | 주요 담당 역할                           |
|-------------|----------|------------------------------------------|
| 컴퓨터공학     | 권용현   | 웹 구현 (프론트엔드 개발, Supabase 연동)   |
| 경영학부     | 김지은   | 발표용 PPT 제작, 사용자 흐름 시각화            |
| 경영학과     | 김지은   | 로고 디자인, 최종 발표 자료 구성               |

> 경영/개발이 유기적으로 협업하여,  
> 예술 기반 투자 플랫폼의 사업성과 기술성을 균형 있게 구현했습니다.
