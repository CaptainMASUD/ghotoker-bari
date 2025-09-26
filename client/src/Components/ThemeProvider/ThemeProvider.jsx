"use client"

import { useSelector } from "react-redux"
import { useEffect } from "react"

function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme)

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return (
    <div className="min-h-screen bg-white text-gray-700 dark:text-gray-200 dark:bg-[#021526] transition-colors duration-300">
      {children}
    </div>
  )
}

export default ThemeProvider
