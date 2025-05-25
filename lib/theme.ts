export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("theme") as "light" | "dark") || "light"
}

export function setTheme(theme: "light" | "dark") {
  if (typeof window === "undefined") return
  localStorage.setItem("theme", theme)

  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

export function toggleTheme() {
  const currentTheme = getTheme()
  const newTheme = currentTheme === "light" ? "dark" : "light"
  setTheme(newTheme)
  return newTheme
}

export function initializeTheme() {
  if (typeof window === "undefined") return
  const theme = getTheme()
  setTheme(theme)
}
