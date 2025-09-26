import { Outlet } from "react-router-dom"
import Navbar from "../Navbar/Navbar"
import ThemeProvider from "../ThemeProvider/ThemeProvider"
import Footer from "../Footer/Footer"

function Layout() {
  return (
    <ThemeProvider>
      <Navbar />
      <Outlet />
      <Footer/>
    </ThemeProvider>
  )
}

export default Layout
