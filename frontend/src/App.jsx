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
import EmployerPostJob from './pages/EmployerPostJob'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerJobs from './pages/EmployerJobs'
import EmployerEditJob from './pages/EmployerEditJob'
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
        <Route path="/employer/jobs/post" element={<EmployerPostJob/>} />
        <Route path="employer/applications" element={<EmployerDashboard />} />
        <Route path="/employer/jobs" element={<EmployerJobs />} />
        <Route path="/employer/jobs/:jobId/edit" element={<EmployerEditJob />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App