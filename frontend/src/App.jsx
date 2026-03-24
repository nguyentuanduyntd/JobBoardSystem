import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import JobList from './pages/JobList'
import JobDetail from './pages/JobDetail'
import Navbar from './components/Navbar'
import ScrollToTop from './pages/ScrollToTopButton'


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
      </Routes>
    </BrowserRouter>
  )
}

export default App