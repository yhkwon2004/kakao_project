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

// 특정 투자 데이터만 남기고 나머지 삭제하는 함수
export const deleteSelectedInvestmentData = async () => {
  try {
    const supabase = getSupabase()

    // Get guest user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", "guest_social@guest.fake")
      .single()

    if (userError) {
      console.error("Error fetching guest user:", userError)
      throw userError
    }

    const userId = userData.id
    console.log("Guest user ID:", userId)

    // 현재 투자 데이터 조회
    const { data: currentInvestments, error: fetchError } = await supabase
      .from("investments")
      .select("*")
      .eq("user_id", userId)

    if (fetchError) {
      console.error("Error fetching current investments:", fetchError)
      throw fetchError
    }

    console.log("Current investments:", currentInvestments)

    // 남겨둘 투자 데이터 정의 (웹툰 ID와 금액으로 식별)
    const keepInvestments = [
      { webtoon_id: "blood-sword-family-hunting-dog", amount: 750000 },
      { webtoon_id: "bad-secretary", amount: 500000 },
    ]

    // 삭제할 투자 데이터 필터링
    const investmentsToDelete =
      currentInvestments?.filter((investment) => {
        const shouldKeep = keepInvestments.some(
          (keep) => keep.webtoon_id === investment.webtoon_id && keep.amount === investment.amount,
        )
        return !shouldKeep
      }) || []

    console.log("Investments to delete:", investmentsToDelete)
    console.log("Number of investments to delete:", investmentsToDelete.length)

    if (investmentsToDelete.length > 0) {
      // 삭제할 투자 ID 목록
      const investmentIdsToDelete = investmentsToDelete.map((inv) => inv.id)

      // 투자 데이터 삭제
      const { error: deleteError } = await supabase.from("investments").delete().in("id", investmentIdsToDelete)

      if (deleteError) {
        console.error("Error deleting investments:", deleteError)
        throw deleteError
      }

      console.log(`Successfully deleted ${investmentIdsToDelete.length} investments`)
    }

    // 차트 데이터도 업데이트 (남은 투자에 맞게)
    const { error: deleteChartError } = await supabase.from("charts").delete().eq("user_id", userId)

    if (deleteChartError) {
      console.error("Error deleting chart data:", deleteChartError)
      throw deleteChartError
    }

    // 남은 투자 데이터를 기반으로 새로운 차트 데이터 생성
    const remainingInvestments =
      currentInvestments?.filter((investment) => {
        return keepInvestments.some(
          (keep) => keep.webtoon_id === investment.webtoon_id && keep.amount === investment.amount,
        )
      }) || []

    if (remainingInvestments.length > 0) {
      // 남은 투자 데이터를 기반으로 차트 데이터 재생성
      const newChartData = [
        {
          user_id: userId,
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          invested: 750000, // 철혈검가 사냥개의 회귀
          expected_return: 861750, // 14.9% ROI
        },
        {
          user_id: userId,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          invested: 1250000, // 철혈검가 + 나쁜 비서
          expected_return: 1426750,
        },
        {
          user_id: userId,
          date: new Date().toISOString().split("T")[0],
          invested: 1250000,
          expected_return: 1426750,
        },
      ]

      const { error: chartError } = await supabase.from("charts").insert(newChartData)
      if (chartError) {
        console.error("Error inserting new chart data:", chartError)
        throw chartError
      }
    }

    // 사용자 잔액 업데이트 (삭제된 투자 금액만큼 복구)
    // const deletedAmount = investmentsToDelete.reduce((sum, inv) => sum + inv.amount, 0)
    // console.log("Amount to refund:", deletedAmount)

    // if (deletedAmount > 0) {
    //   const { data: currentUser, error: userFetchError } = await supabase
    //     .from("users")
    //     .select("balance")
    //     .eq("id", userId)
    //     .single()

    //   if (userFetchError) {
    //     console.error("Error fetching user balance:", userFetchError)
    //     throw userFetchError
    //   }

    //   const newBalance = (currentUser.balance || 0) + deletedAmount
    //   console.log("New balance:", newBalance)

    //   const { error: balanceError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

    //   if (balanceError) {
    //     console.error("Error updating balance:", balanceError)
    //     throw balanceError
    //   }
    // }

    // 사용자 잔액을 150,000원으로 설정 (삭제된 투자 금액 환불 대신)
    const newBalance = 150000
    console.log("Setting balance to:", newBalance)

    const { error: balanceError } = await supabase.from("users").update({ balance: newBalance }).eq("id", userId)

    if (balanceError) {
      console.error("Error updating balance:", balanceError)
      throw balanceError
    }

    // 기타 관련 데이터 정리
    await supabase.from("favorites").delete().eq("user_id", userId)
    await supabase.from("user_preferences").delete().eq("user_id", userId)
    await supabase.from("sessions").delete().eq("user_id", userId)

    // 마일리지 데이터 초기화
    const { error: mileageDeleteError } = await supabase.from("mileage").delete().eq("user_id", userId)

    if (mileageDeleteError) {
      console.error("Error deleting mileage:", mileageDeleteError)
    }

    const { error: mileageHistoryDeleteError } = await supabase.from("mileage_history").delete().eq("user_id", userId)

    if (mileageHistoryDeleteError) {
      console.error("Error deleting mileage history:", mileageHistoryDeleteError)
    }

    // 새로운 마일리지 데이터 추가 (남은 투자에 대한 마일리지만)
    const totalRemainingAmount = remainingInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    const mileageFromInvestments = Math.floor(totalRemainingAmount / 1000) // 1000원당 1마일리지

    const newMileageData = {
      user_id: userId,
      total_points: mileageFromInvestments,
      attendance_streak: 0,
      last_attendance: null,
    }

    const { error: newMileageError } = await supabase.from("mileage").insert(newMileageData)
    if (newMileageError) {
      console.error("Error inserting new mileage:", newMileageError)
    }

    // 마일리지 히스토리 추가
    if (mileageFromInvestments > 0) {
      const mileageHistory = remainingInvestments.map((inv) => ({
        user_id: userId,
        points: Math.floor(inv.amount / 1000),
        type: "investment",
        description: `웹툰 투자 마일리지 (${inv.webtoon_id})`,
        created_at: inv.created_at,
      }))

      const { error: historyError } = await supabase.from("mileage_history").insert(mileageHistory)
      if (historyError) {
        console.error("Error inserting mileage history:", historyError)
      }
    }

    // 로컬스토리지에 남은 투자 데이터 설정
    const remainingInvestmentsForLocal = [
      {
        id: "blood-sword-family-hunting-dog",
        title: "철혈검가 사냥개의 회귀",
        amount: 750000,
        expectedROI: 14.9,
        status: "진행중",
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        thumbnail: "/images/철혈검가-사냥개의-회귀.png",
        slug: "blood-sword-family-hunting-dog",
      },
      {
        id: "bad-secretary",
        title: "나쁜 비서",
        amount: 500000,
        expectedROI: 18.5,
        status: "진행중",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        thumbnail: "/webtoons/나쁜-비서.png",
        slug: "bad-secretary",
      },
    ]

    // 브라우저 환경에서만 로컬스토리지 업데이트
    if (typeof window !== "undefined") {
      localStorage.setItem("userInvestments", JSON.stringify(remainingInvestmentsForLocal))
    }

    console.log("Successfully completed selective investment data deletion")
    return true
  } catch (error) {
    console.error("Error in deleteSelectedInvestmentData:", error)
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

    // Reset guest balance and theme
    await supabase.from("users").update({ balance: 150000, theme: "light", name: "홍길동" }).eq("id", userId)

    // Add dummy investment history data with proper schema
    const dummyInvestments = [
      {
        user_id: userId,
        webtoon_id: "1",
        amount: 50000,
        investment_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        expected_return: 57500,
      },
      {
        user_id: userId,
        webtoon_id: "3",
        amount: 75000,
        investment_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        expected_return: 84000,
      },
      {
        user_id: userId,
        webtoon_id: "5",
        amount: 100000,
        investment_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        expected_return: null,
      },
      {
        user_id: userId,
        webtoon_id: "2",
        amount: 120000,
        investment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_progress",
        expected_return: null,
      },
      {
        user_id: userId,
        webtoon_id: "6",
        amount: 2800000,
        investment_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        expected_return: 3304000,
      },
      {
        user_id: userId,
        webtoon_id: "7",
        amount: 3400000,
        investment_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        expected_return: 4148000,
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

// Helper function to get user ID by email (for cases where we only have email)
export const getUserIdByEmail = async (email: string): Promise<string | null> => {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("users").select("id").eq("email", email).single()

  if (error) {
    console.error("Error fetching user ID:", error)
    return null
  }

  return data?.id || null
}

// Investments related functions
export const getInvestments = async (userIdentifier: string) => {
  const supabase = getSupabase()

  // Check if userIdentifier is a UUID or email
  let userId = userIdentifier

  // If it looks like an email, get the UUID
  if (userIdentifier.includes("@")) {
    const fetchedUserId = await getUserIdByEmail(userIdentifier)
    if (!fetchedUserId) {
      console.error("Could not find user ID for email:", userIdentifier)
      return []
    }
    userId = fetchedUserId
  }

  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching investments:", error)
    return []
  }

  return data
}

export const addInvestment = async (userIdentifier: string, webtoonId: string, amount: number) => {
  const supabase = getSupabase()

  // Check if userIdentifier is a UUID or email
  let userId = userIdentifier

  // If it looks like an email, get the UUID
  if (userIdentifier.includes("@")) {
    const fetchedUserId = await getUserIdByEmail(userIdentifier)
    if (!fetchedUserId) {
      console.error("Could not find user ID for email:", userIdentifier)
      return false
    }
    userId = fetchedUserId
  }

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
    console.error("Error checking existing investment:", checkError)
    await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
    return false
  }

  if (existingInvestment) {
    // Update existing investment by adding to the amount
    const { error: updateInvestError } = await supabase
      .from("investments")
      .update({
        amount: Number(existingInvestment.amount) + amount,
        updated_at: new Date().toISOString(),
        status: "in_progress",
      })
      .eq("user_id", userId)
      .eq("webtoon_id", webtoonId)

    if (updateInvestError) {
      console.error("Error updating investment:", updateInvestError)
      await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
      return false
    }
  } else {
    // Add new investment
    const { error: investError } = await supabase.from("investments").insert([
      {
        user_id: userId,
        webtoon_id: webtoonId,
        amount,
        status: "in_progress",
        investment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    ])

    if (investError) {
      console.error("Error adding investment:", investError)
      await supabase.from("users").update({ balance: user.balance }).eq("id", userId)
      return false
    }
  }

  return true
}
