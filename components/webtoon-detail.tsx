"use client"
import { useState } from "react"
import Image from "next/image"
import { Dialog } from "@headlessui/react"

interface Webtoon {
  id: number
  title: string
  thumbnail: string
  description: string
  genre: string
  author: string
  investmentGoal: number
  currentInvestment: number
  investors: number
  startDate: string
  endDate: string
}

interface WebtoonDetailProps {
  webtoon: Webtoon | undefined
}

export function WebtoonDetail({ webtoon }: WebtoonDetailProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isInvested, setIsInvested] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const handleInvest = () => {
    // 투자 로직 (API 호출 등)
    setIsInvested(true)
    // 실제 투자 로직에서는 투자 성공/실패에 따라 setIsInvested를 설정해야 합니다.
  }

  return (
    <div className="container mx-auto p-4">
      {webtoon ? (
        <>
          {/* 웹툰 썸네일 */}
          <div className="relative w-full h-[200px] md:h-[300px] rounded-xl overflow-hidden mb-4">
            <Image
              src={
                webtoon?.thumbnail ||
                `/placeholder.svg?height=300&width=500&query=${encodeURIComponent(webtoon?.title || "웹툰")}`
              }
              alt={webtoon?.title || "웹툰 이미지"}
              fill
              className="object-cover"
            />
          </div>

          {/* 웹툰 정보 */}
          <h1 className="text-2xl font-bold mb-2">{webtoon.title}</h1>
          <p className="text-gray-600 mb-4">{webtoon.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
              #{webtoon.genre}
            </span>
            <span className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
              #{webtoon.author}
            </span>
          </div>

          {/* 투자 정보 */}
          <div className="mb-4">
            <p className="text-lg font-semibold">투자 정보</p>
            <p>목표 투자액: {webtoon.investmentGoal.toLocaleString()} 원</p>
            <p>현재 투자액: {webtoon.currentInvestment.toLocaleString()} 원</p>
            <p>투자자 수: {webtoon.investors} 명</p>
            <p>
              투자 기간: {webtoon.startDate} ~ {webtoon.endDate}
            </p>
          </div>

          {/* 투자 버튼 */}
          {!isInvested ? (
            <button
              type="button"
              onClick={openModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              투자하기
            </button>
          ) : (
            <p className="text-green-500 font-semibold">투자 완료!</p>
          )}

          {/* 투자 다이얼로그 */}
          <Dialog open={isOpen && !isInvested} onClose={closeModal} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md bg-white rounded-xl p-6">
                <Dialog.Title className="text-lg font-bold mb-4">웹툰 투자</Dialog.Title>
                {/* 웹툰 썸네일 (다이얼로그) */}
                <div className="relative w-full h-[150px] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={
                      webtoon?.thumbnail ||
                      `/placeholder.svg?height=150&width=300&query=${encodeURIComponent(webtoon?.title || "웹툰")}`
                    }
                    alt={webtoon?.title || "웹툰 이미지"}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mb-4">정말로 투자하시겠습니까?</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleInvest}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    투자
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          {/* 투자 완료 다이얼로그 */}
          <Dialog open={isInvested} onClose={() => setIsInvested(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md bg-white rounded-xl p-6">
                <Dialog.Title className="text-lg font-bold mb-4">투자 완료!</Dialog.Title>
                {/* 웹툰 썸네일 (투자 완료 다이얼로그) */}
                <div className="relative w-full h-[150px] rounded-xl overflow-hidden mb-4">
                  <Image
                    src={
                      webtoon?.thumbnail ||
                      `/placeholder.svg?height=150&width=300&query=${encodeURIComponent(webtoon?.title || "웹툰")}`
                    }
                    alt={webtoon?.title || "웹툰 이미지"}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mb-4">웹툰 투자에 참여해주셔서 감사합니다!</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsInvested(false)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    확인
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      ) : (
        <p>웹툰 정보를 불러오는 중...</p>
      )}
    </div>
  )
}
