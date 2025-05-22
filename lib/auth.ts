import { getUserByEmail, updateUserTheme, resetGuestData, verifyPassword, updateUserPassword } from "@/lib/db"

// User info type definition
export interface User {
  id?: string
  email: string
  name: string
  profileImage?: string
  theme?: string
  balance?: number
}

// Functions to save/retrieve/clear user info from local storage
export const saveUserToStorage = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("currentUser", JSON.stringify(user))
  }
}

export const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      return JSON.parse(userStr)
    }
  }
  return null
}

export const clearUserFromStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser")
  }
}

// Image storage related functions
export const saveImageToStorage = (key: string, imageUrl: string) => {
  if (typeof window !== "undefined") {
    const images = JSON.parse(localStorage.getItem("uploadedImages") || "{}")
    images[key] = imageUrl
    localStorage.setItem("uploadedImages", JSON.stringify(images))
  }
}

export const getImageFromStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const images = JSON.parse(localStorage.getItem("uploadedImages") || "{}")
    return images[key] || null
  }
  return null
}

// Profile update
export const updateUserProfile = async (name?: string, profileImage?: string, theme?: string) => {
  const user = getUserFromStorage()
  if (user) {
    if (name) user.name = name
    if (profileImage) user.profileImage = profileImage
    if (theme) {
      user.theme = theme
      // Update theme in database
      await updateUserTheme(user.email, theme)
    }
    saveUserToStorage(user)
    return true
  }
  return false
}

// Guest login
export const loginAsGuest = async () => {
  try {
    // Reset guest data
    await resetGuestData()

    // Get guest user data
    const guestData = await getUserByEmail("guest_social@guest.fake")

    if (!guestData) {
      throw new Error("Guest user not found")
    }

    // Save guest user to storage
    saveUserToStorage({
      id: guestData.id,
      email: guestData.email,
      name: guestData.name,
      theme: guestData.theme,
      balance: guestData.balance,
    })

    return true
  } catch (error) {
    console.error("Error logging in as guest:", error)
    return false
  }
}

// Check if user is a guest account
export const isGuestAccount = (email: string): boolean => {
  return email === "guest_social@guest.fake"
}

// Change user password
export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  const user = getUserFromStorage()
  if (!user || !user.email) return false

  try {
    // Verify current password
    const isPasswordValid = await verifyPassword(user.email, currentPassword)
    if (!isPasswordValid) return false

    // Update password
    const success = await updateUserPassword(user.email, newPassword)
    return success
  } catch (error) {
    console.error("Error changing password:", error)
    return false
  }
}
