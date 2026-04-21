import { Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import Navbar    from './components/layout/Navbar'
import Footer    from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'
import Home      from './pages/Home'
import './App.css'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <Navbar theme={theme} onThemeToggle={toggle} />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
      <BottomNav />
    </div>
  )
}
