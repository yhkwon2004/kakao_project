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
