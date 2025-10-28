import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Hero from './Sections/Hero'
import Navbar from './Sections/Navbar'
import Editor from './Sections/Editor'
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </div>
  )
}

export default App