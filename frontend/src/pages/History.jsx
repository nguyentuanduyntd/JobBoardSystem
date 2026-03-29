import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const History = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchApplications()
  }, [user, navigate])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('access_token')

      const response = await fetch('http://127.0.0.1:8000/my-applications/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error('Không thể tải lịch sử ứng tuyển')
      }

      setApplications(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error('Fetch history error:', err)
      setError('Không thể tải lịch sử ứng tuyển')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { color: 'warning', text: 'Chờ xét duyệt' },
      REVIEWING: { color: 'info', text: 'Đang xem xét' },
      ACCEPTED: { color: 'success', text: 'Chấp nhận' },
      REJECTED: { color: 'danger', text: 'Từ chối' },
    }

    return map[status] || { color: 'secondary', text: status }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''

    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return ''

    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center mt-5">Đang tải...</div>
  }

  if (error) {
    return (
      <div className="container mt-4" style={{ maxWidth: 800 }}>
        <h4 className="fw-bold mb-4">Lịch sử ứng tuyển</h4>
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <h4 className="fw-bold mb-4">Lịch sử ứng tuyển</h4>

      {applications.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">Bạn chưa ứng tuyển vị trí nào.</p>
          <Link to="/jobs" className="btn btn-primary">
            Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {applications.map((app) => {
            const badge = getStatusBadge(app.status)

            return (
              <div key={app.id} className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold mb-1">
                        <span>{app.job_title}</span>
                      </h5>

                      {app.company_name && (
                        <p className="text-muted mb-1">
                          <i className="bi bi-building me-2"></i>
                          {app.company_name}
                        </p>
                      )}

                      <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                        <i className="bi bi-calendar me-2"></i>
                        Ngày ứng tuyển: {formatDate(app.applied_date)}
                      </p>
                    </div>

                    <span className={`badge bg-${badge.color} fs-6`}>
                      {badge.text}
                    </span>
                  </div>

                  {app.cover_letter && (
                    <>
                      <hr />
                      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        <strong>Thư giới thiệu: </strong>
                        {app.cover_letter}
                      </p>
                    </>
                  )}

                  {app.status === 'ACCEPTED' && app.interview_date && (
                    <>
                      <hr />
                      <div className="alert alert-success mb-0">
                        <div className="fw-bold mb-2">
                          <i className="bi bi-calendar-event me-2"></i>
                          Lịch phỏng vấn
                        </div>

                        <div className="mb-1">
                          <strong>Thời gian:</strong> {formatDateTime(app.interview_date)}
                        </div>

                        {app.interview_address && (
                          <div>
                            <strong>Địa chỉ:</strong> {app.interview_address}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default History