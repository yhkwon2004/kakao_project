"use client"

export interface User {
  id: string
  name: string
  email: string
  profileImage?: string
  balance?: number
  theme?: "light" | "dark"
}

// 로컬 스토리지 키
const CURRENT_USER_KEY = "currentUser"

// 사용자 정보 저장
export const saveUserToStorage = (user: User): void => {
  try {
    // 새 사용자인 경우 기본 잔액 설정
    if (user.balance === undefined) {
      user.balance = 150000
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error("사용자 정보 저장 실패:", error)
  }
}

// 사용자 정보 가져오기
export const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    if (!userStr) return null

    const user = JSON.parse(userStr)

    // 기본값 설정
    if (user.balance === undefined) {
      user.balance = 150000
      saveUserToStorage(user) // 업데이트된 정보 저장
    }

    return user
  } catch (error) {
    console.error("사용자 정보 로드 실패:", error)
    return null
  }
}

// 사용자 정보 업데이트
export const updateUserInStorage = (updates: Partial<User>): boolean => {
  try {
    const currentUser = getUserFromStorage()
    if (!currentUser) return false

    const updatedUser = { ...currentUser, ...updates }
    saveUserToStorage(updatedUser)

    // 다른 컴포넌트에 변경 알림
    window.dispatchEvent(new Event("userDataChanged"))

    return true
  } catch (error) {
    console.error("사용자 정보 업데이트 실패:", error)
    return false
  }
}

// 사용자 로그아웃
export const logoutUser = (): void => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY)
    // 다른 사용자 관련 데이터도 정리할 수 있음
    window.dispatchEvent(new Event("userDataChanged"))
  } catch (error) {
    console.error("로그아웃 실패:", error)
  }
}

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  return getUserFromStorage() !== null
}

// 게스트 사용자 생성
export const createGuestUser = (): User => {
  const guestUser: User = {
    id: "guest_" + Date.now(),
    name: "게스트",
    email: "guest@example.com",
    balance: 150000,
    theme: "light",
  }

  saveUserToStorage(guestUser)
  return guestUser
}

// 사용자 잔액 업데이트
export const updateUserBalance = (newBalance: number): boolean => {
  return updateUserInStorage({ balance: newBalance })
}

// 사용자 테마 업데이트
export const updateUserTheme = (theme: "light" | "dark"): boolean => {
  return updateUserInStorage({ theme })
}
