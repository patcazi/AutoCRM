// Remove the React import since we're not using it directly
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Tickets from './pages/Tickets'
import CreateTicket from './pages/CreateTicket'
import EmployeeDashboard from './pages/EmployeeDashboard'
import CustomerTicketDetail from './pages/CustomerTicketDetail'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:ticketId" element={<CustomerTicketDetail />} />
          <Route path="/tickets/create" element={<CreateTicket />} />
          <Route path="/dashboard" element={<EmployeeDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App