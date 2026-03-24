import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getJobDetail } from "../services/jobService"
import { useAuth } from "../contexts/AuthContext"

const JobDetail = () => {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await getJobDetail(id)
                setJob(data)
            } catch (error) {
                console.error("Lỗi khi tải job:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchJob()
    }, [id])

    if (loading) return <div className="text-center mt-5">Đang tải...</div>
    if (!job) return <div className="text-center mt-5">Không tìm thấy công việc</div>

    return (
        <div className="container mt-4" style={{ maxWidth: 800 }}>
            <Link to="/jobs" className="btn btn-light mb-3">← Quay lại danh sách</Link>

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h3 className="fw-bold">{job.title}</h3>

                    <p className="text-muted mb-1">
                        <i className="bi bi-building me-2"></i>{job.company_name}
                    </p>
                    <p className="text-muted mb-1">
                        <i className="bi bi-geo-alt me-2"></i>{job.location}
                    </p>
                    <p className="text-muted mb-1">
                        <i className="bi bi-clock me-2"></i>
                        {job.job_type === 'FT' ? 'Full-time' :
                         job.job_type === 'PT' ? 'Part-time' :
                         job.job_type === 'RE' ? 'Remote' : 'Freelance'}
                    </p>

                    {job.salary_min && (
                        <p className="text-success fw-bold">
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

            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="fw-bold mb-3">Mô tả công việc</h5>
                    <p>{job.description}</p>

                    {job.requirements && (
                        <>
                            <hr />
                            <h5 className="fw-bold mb-3">Yêu cầu</h5>
                            <p>{job.requirements}</p>
                        </>
                    )}

                    {job.skills && job.skills.length > 0 && (
                        <>
                            <hr />
                            <h5 className="fw-bold mb-3">Kỹ năng yêu cầu</h5>
                            <div className="d-flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                    <span key={index} className="badge bg-primary">{skill}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Button ứng tuyển */}
            <div className="d-flex gap-2">
                {user ? (
                    <Link to={`/jobs/${id}/apply`} className="btn btn-primary px-4">
                        Ứng tuyển ngay
                    </Link>
                ) : (
                    <Link to="/login" className="btn btn-primary px-4">
                        Đăng nhập để ứng tuyển
                    </Link>
                )}
                <Link to="/jobs" className="btn btn-light px-4">Xem việc làm khác</Link>
            </div>
        </div>
    )
}

export default JobDetail