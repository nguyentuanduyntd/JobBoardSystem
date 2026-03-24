import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getJobDetail } from "../services/jobService"
import { useAuth } from "../contexts/AuthContext"

const Apply = () => {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [coverLetter, setCoverLetter] = useState('')
    const [cvFile, setCvFile] = useState(null)
    const [applying, setApplying] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        getJobDetail(id)
            .then(data => setJob(data))
            .finally(() => setLoading(false))
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setApplying(true)
        setError('')

        const formData = new FormData()
        formData.append('job', id)
        formData.append('cover_letter', coverLetter)
        if (cvFile) formData.append('cv_file', cvFile)

        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('http://127.0.0.1:8000/apply/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            })
            const data = await response.json()
            if (response.ok) {
                setSuccess(true)
            } else {
                setError(JSON.stringify(data))
            }
        } catch (err) {
            setError('Lỗi kết nối server')
        } finally {
            setApplying(false)
        }
    }

    if (loading) return <div className="text-center mt-5">Đang tải...</div>
    if (!job) return <div className="text-center mt-5">Không tìm thấy công việc</div>

    if (success) return (
        <div className="container mt-5">
            <div className="text-center">
                <div className="mb-3" style={{ fontSize: '4rem' }}>🎉</div>
                <h4 className="fw-bold text-success">Ứng tuyển thành công!</h4>
                <p className="text-muted">Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p>
                <Link to="/jobs" className="btn btn-primary mt-2">Xem thêm việc làm</Link>
            </div>
        </div>
    )

    return (
        <div className="container mt-4" style={{ maxWidth: 800 }}>
            <Link to={`/jobs/${id}`} className="btn btn-light mb-3">← Quay lại</Link>

            <h4 className="fw-bold mb-4">Ứng tuyển vị trí</h4>

            {/* Thông tin job */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="fw-bold">{job.title}</h5>
                    <p className="text-muted mb-1">
                        <i className="bi bi-building me-2"></i>{job.company_name}
                    </p>
                    <p className="text-muted mb-1">
                        <i className="bi bi-geo-alt me-2"></i>{job.location}
                    </p>
                    <p className="text-muted mb-1">
                        <i className="bi bi-clock me-2"></i>{job.job_type}
                    </p>
                    {job.salary_min && (
                        <p className="text-success fw-bold mb-1">
                            {Number(job.salary_min).toLocaleString()} - {Number(job.salary_max).toLocaleString()} VNĐ
                        </p>
                    )}
                    {job.deadline && (
                        <p className="text-danger mb-0">
                            <i className="bi bi-calendar me-2"></i>
                            Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                        </p>
                    )}
                </div>
            </div>

            {/* Thông tin ứng viên */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h6 className="fw-bold mb-3">Thông tin ứng viên</h6>
                    <p className="mb-1">
                        <i className="bi bi-person me-2"></i>
                        {user.first_name} {user.last_name}
                    </p>
                    <p className="mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Form ứng tuyển */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h6 className="fw-bold mb-3">Hồ sơ ứng tuyển</h6>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Đính kèm CV <span className="text-muted fw-normal">(PDF, DOC)</span>
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setCvFile(e.target.files[0])}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Thư giới thiệu</label>
                            <textarea
                                className="form-control"
                                rows={6}
                                placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary px-4" disabled={applying}>
                                {applying ? 'Đang gửi...' : 'Gửi ứng tuyển'}
                            </button>
                            <Link to={`/jobs/${id}`} className="btn btn-light px-4">Hủy</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Apply