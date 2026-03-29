import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Apply from './pages/Apply'
import Profile from './pages/Profile'
import Register from './pages/Register'
import History from './pages/History'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import CompanyDetail from './pages/CompanyDetail'
import Navbar from './components/Navbar'
import ScrollToTop from './pages/ScrollToTopButton'
import EmployerDashboard from './pages/EmployerDashboard'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop/>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:id/apply" element={<Apply />} />
        <Route path="/companies/:id" element={<CompanyDetail/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/history" element={<History/>} />
        <Route path="employer/applications" element={<EmployerDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App