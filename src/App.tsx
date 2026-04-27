import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MobileShell } from './components/layout/MobileShell'
import { AppToaster } from './components/ui/Toast'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Booking from './pages/Booking'
import Alerts from './pages/Alerts'

export default function App() {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/booking/:flightId" element={<Booking />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </MobileShell>
      <AppToaster />
    </BrowserRouter>
  )
}
