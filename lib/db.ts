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

    // Reset guest balance and theme - 게스트 계정은 15만원 유지
    await supabase.from("users").update({ balance: 150000, theme: "light" }).eq("id", userId)

    // Add dummy investment history data
    const dummyInvestments = [
      {
        user_id: userId,
        webtoon_id: "1",
        amount: 50000,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
        status: "completed",
        roi: 15,
      },
      {
        user_id: userId,
        webtoon_id: "3",
        amount: 75000,
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
        status: "completed",
        roi: 12,
      },
      {
        user_id: userId,
        webtoon_id: "5",
        amount: 100000,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        status: "in_progress",
        roi: null,
      },
      {
        user_id: userId,
        webtoon_id: "2",
        amount: 120000,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        status: "in_progress",
        roi: null,
      },
      {
        user_id: userId,
        webtoon_id: "6", // 철혈검가 사냥개의 회귀
        amount: 2800000,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
        status: "completed",
        roi: 18,
      },
      {
        user_id: userId,
        webtoon_id: "7", // 나쁜 비서 [19세 완전판]
        amount: 3400000,
        created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), // 75 days ago
        status: "completed",
        roi: 22,
      },
    ]

    // Insert dummy investments
    const { error: investError } = await supabase.from("investments").insert(dummyInvestments)
    if (investError) throw investError

    // Add dummy chart data
    const dummyChartData = [
      {
        user_id: userId,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        invested: 50000,
        expected_return: 57500,
      },
      {
        user_id: userId,
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        invested: 125000,
        expected_return: 141000,
      },
      {
        user_id: userId,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        invested: 225000,
        expected_return: 254000,
      },
      {
        user_id: userId,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        invested: 345000,
        expected_return: 386000,
      },
      {
        user_id: userId,
        date: new Date().toISOString().split("T")[0],
        invested: 345000,
        expected_return: 386000,
      },
    ]

    // Insert dummy chart data
    const { error: chartError } = await supabase.from("charts").insert(dummyChartData)
    if (chartError) throw chartError

    // Add dummy mileage data
    const dummyMileage = {
      user_id: userId,
      total_points: 250,
      attendance_streak: 3,
      last_attendance: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0], // yesterday
    }

    // Insert or update mileage data
    const { error: mileageError } = await supabase.from("mileage").upsert(dummyMileage, { onConflict: "user_id" })

    if (mileageError) throw mileageError

    // Add dummy mileage history
    const dummyMileageHistory = [
      {
        user_id: userId,
        points: 5,
        type: "attendance",
        description: "출석 체크",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        user_id: userId,
        points: 5,
        type: "attendance",
        description: "출석 체크",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        user_id: userId,
        points: 5,
        type: "attendance",
        description: "출석 체크",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
      },
      {
        user_id: userId,
        points: 50,
        type: "investment",
        description: "웹툰 '이번 생은 가주가 되겠습니다' 투자",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      },
      {
        user_id: userId,
        points: 75,
        type: "investment",
        description: "웹툰 '황녀, 반역자를 각인시키다' 투자",
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      },
      {
        user_id: userId,
        points: 100,
        type: "investment",
        description: "웹툰 '검술명가 막내아들' 투자",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      },
      {
        user_id: userId,
        points: -100,
        type: "redemption",
        description: "웹툰 캐릭터 피규어 교환",
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      },
    ]

    // Insert dummy mileage history
    const { error: historyError } = await supabase.from("mileage_history").insert(dummyMileageHistory)
    if (historyError) throw historyError

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

  // Add investment
  const { error: investError } = await supabase
    .from("investments")
    .insert([{ user_id: userId, webtoon_id: webtoonId, amount }])

  if (investError) {
    console.error("Error adding investment:", investError)
    // Rollback balance change
    await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
    return false
  }

  return true
}
