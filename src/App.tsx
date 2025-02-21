import { useState } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import ThisModuleDoesNotExist from './this-will-break'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App