import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance of the Supabase client
let supabase: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabase
}

// User related functions
export const getUserByEmail = async (email: string) => {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export const updateUserTheme = async (email: string, theme: string) => {
  const supabase = getSupabase()
  const { error } = await supabase.from("users").update({ theme }).eq("email", email)

  if (error) {
    console.error("Error updating user theme:", error)
    return false
  }

  return true
}

// Password related functions
export const verifyPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return !error
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export const updateUserPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    return !error
  } catch (error) {
    console.error("Error updating password:", error)
    return false
  }
}

// Guest account reset with dummy data
export const resetGuestData = async () => {
  try {
    const supabase = getSupabase()

    // Get guest user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", "guest_social@guest.fake")
      .single()

    if (userError) throw userError

    const userId = userData.id

    // Delete all guest data
    await supabase.from("favorites").delete().eq("user_id", userId)
    await supabase.from("investments").delete().eq("user_id", userId)
    await supabase.from("charts").delete().eq("user_id", userId)
    await supabase.from("user_preferences").delete().eq("user_id", userId)
    await supabase.from("sessions").delete().eq("user_id", userId)
    await supabase.from("mileage").delete().eq("user_id", userId)
    await supabase.from("mileage_history").delete().eq("user_id", userId)

    // Reset guest balance and theme - 게스트 계정은 15만원 유지, 더미 데이터는 생성하지 않음
    await supabase.from("users").update({ balance: 150000, theme: "light" }).eq("id", userId)

    return true
  } catch (error) {
    console.error("Error resetting guest data:", error)
    return false
  }
}

// Favorites related functions
export const getFavorites = async (userId: string) => {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching favorites:", error)
    return []
  }

  return data
}

export const addFavorite = async (userId: string, webtoonId: string) => {
  const supabase = getSupabase()
  const { error } = await supabase.from("favorites").insert([{ user_id: userId, webtoon_id: webtoonId }])

  if (error) {
    console.error("Error adding favorite:", error)
    return false
  }

  return true
}

export const removeFavorite = async (userId: string, webtoonId: string) => {
  const supabase = getSupabase()
  const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("webtoon_id", webtoonId)

  if (error) {
    console.error("Error removing favorite:", error)
    return false
  }

  return true
}

// Investments related functions
export const getInvestments = async (userId: string) => {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("investments").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching investments:", error)
    return []
  }

  return data
}

export const addInvestment = async (userId: string, webtoonId: string, amount: number) => {
  const supabase = getSupabase()

  // Start a transaction
  const { data: user, error: userError } = await supabase.from("users").select("balance").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user balance:", userError)
    return false
  }

  // Check if user has enough balance
  if (user.balance < amount) {
    return false
  }

  // Update user balance
  const { error: updateError } = await supabase
    .from("users")
    .update({ balance: user.balance - amount })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user balance:", updateError)
    return false
  }

  // Check if investment already exists for this webtoon
  const { data: existingInvestment, error: checkError } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .eq("webtoon_id", webtoonId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" error
    console.error("Error checking existing investment:", checkError)
    // Rollback balance change
    await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
    return false
  }

  if (existingInvestment) {
    // Update existing investment by adding to the amount
    const { error: updateInvestError } = await supabase
      .from("investments")
      .update({
        amount: existingInvestment.amount + amount,
        created_at: new Date().toISOString(), // Update timestamp to latest investment
      })
      .eq("user_id", userId)
      .eq("webtoon_id", webtoonId)

    if (updateInvestError) {
      console.error("Error updating investment:", updateInvestError)
      // Rollback balance change
      await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
      return false
    }
  } else {
    // Add new investment
    const { error: investError } = await supabase
      .from("investments")
      .insert([{ user_id: userId, webtoon_id: webtoonId, amount }])

    if (investError) {
      console.error("Error adding investment:", investError)
      // Rollback balance change
      await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
      return false
    }
  }

  return true
}
