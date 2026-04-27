import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MobileShell } from './components/layout/MobileShell'
import { AppToaster } from './components/ui/Toast'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Booking from './pages/Booking'

export default function App() {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/booking/:flightId" element={<Booking />} />
        </Routes>
      </MobileShell>
      <AppToaster />
    </BrowserRouter>
  )
}
