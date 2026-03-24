import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const History = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchApplications()
    }, [user])

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('access_token')
            console.log('token:', token)
            const response = await fetch('http://127.0.0.1:8000/my-applications/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log('status:', response.status)
            const data = await response.json()
            console.log('data:', data)
            setApplications(data.results || data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const map = {
            'PENDING': { color: 'warning', text: 'Chờ xét duyệt' },
            'REVIEWING': { color: 'info', text: 'Đang xem xét' },
            'ACCEPTED': { color: 'success', text: 'Chấp nhận' },
            'REJECTED': { color: 'danger', text: 'Từ chối' },
        }
        return map[status] || { color: 'secondary', text: status }
    }

    if (loading) return <div className="text-center mt-5">Đang tải...</div>

    return (
        <div className="container mt-4" style={{ maxWidth: 800 }}>
            <h4 className="fw-bold mb-4">Lịch sử ứng tuyển</h4>

            {applications.length === 0 ? (
                <div className="text-center mt-5">
                    <p className="text-muted">Bạn chưa ứng tuyển vị trí nào.</p>
                    <Link to="/jobs" className="btn btn-primary">Tìm việc ngay</Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {applications.map(app => {
                        const badge = getStatusBadge(app.status)
                        return (
                            <div key={app.id} className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h5 className="fw-bold mb-1">
                                                <span>{app.job_title}</span>
                                            </h5>
                                            <p className="text-muted mb-1">
                                                <i className="bi bi-building me-2"></i>{app.company_name}
                                            </p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                                <i className="bi bi-calendar me-2"></i>
                                                Ngày ứng tuyển: {new Date(app.applied_date).toLocaleDateString('vi-VN')}
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
                                                <strong>Thư giới thiệu: </strong>{app.cover_letter}
                                            </p>
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