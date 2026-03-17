import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getJobDetail } from "../services/jobService"

const JobDetail = () => {
    const { id } = useParams()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)

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
        <div className="container mt-4">

            <Link to="/jobs" className="btn btn-light mb-3">
                ← Quay lại danh sách
            </Link>

            <div className="card shadow-sm">
                <div className="card-body">

                    <h3 className="fw-bold">{job.title}</h3>

                    <p className="text-muted mb-1">
                        <i className="bi bi-building me-2"></i>
                        {job.company_name}
                    </p>

                    <p className="text-muted mb-1">
                        <i className="bi bi-geo-alt me-2"></i>
                        {job.location}
                    </p>

                    <p className="text-muted mb-1">
                        <i className="bi bi-clock me-2"></i>
                        {job.job_type}
                    </p>

                    {job.salary_min && (
                        <p className="text-success fw-bold">
                            {Number(job.salary_min).toLocaleString()} - {Number(job.salary_max).toLocaleString()} VNĐ
                        </p>
                    )}

                    <hr />

                    <h5 className="fw-bold">Mô tả công việc</h5>
                    <p>{job.description}</p>

                    <hr />

                    <button className="btn btn-primary">
                        Ứng tuyển ngay
                    </button>

                </div>
            </div>
        </div>
    )
}

export default JobDetail