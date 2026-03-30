import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">JobBoard</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/jobs">Việc làm</Link>
            </li>

            {/* ✅ Chỉ hiện khi là Employer */}
            {user?.role === 'EMPLOYER' && (
              <>
                <li className="nav-item">
                    <Link className="nav-link" to="/employer/applications">
                        <i className="bi bi-people me-1"></i>Quản lý ứng tuyển
                    </Link>
                </li>
                <li>
                    <Link className="nav-link" to="/employer/jobs/post">
                        <i className="bi bi-people me-1"></i>Đăng tin tuyển dụng
                    </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                  href="#" role="button" data-bs-toggle="dropdown">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="avatar" width="32" height="32"
                        className="rounded-circle object-fit-cover" />
                    : <i className="bi bi-person-circle fs-5"></i>
                  }
                  <span>Chào {user.first_name || user.username}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">Hồ sơ</Link></li>

                  {/* ✅ Candidate: xem lịch sử ứng tuyển */}
                  {user.role === 'CANDIDATE' && (
                    <li>
                      <Link className="dropdown-item" to="/history">
                        <i className="bi bi-file-text me-2"></i>Lịch sử ứng tuyển
                      </Link>
                    </li>
                  )}

                  {/* ✅ Employer: quản lý ứng tuyển */}
                  {user.role === 'EMPLOYER' && (
                    <li>
                      <Link className="dropdown-item" to="/employer/applications">
                        <i className="bi bi-people me-2"></i>Quản lý ứng tuyển
                      </Link>
                    </li>
                  )}

                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Đăng nhập</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Đăng ký</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar