import 'react'
import './App.css'
import Home from './pages/Home/Home'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/Layouts/MainLayout'
import Contact from './pages/Contact/Contact'
import About from './pages/About/About'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}
