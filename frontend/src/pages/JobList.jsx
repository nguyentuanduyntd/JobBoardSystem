import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getJobs } from '../services/jobService'

const PAGE_SIZE = 4

const JobList = () => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [count, setCount] = useState(0)
    const [nextPage, setNextPage] = useState(null)
    const [previousPage, setPreviousPage] = useState(null)
    const [error, setError] = useState('')

    const totalPages = Math.ceil(count / PAGE_SIZE)

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true)
            setError('')

            try {
                const data = await getJobs({ p: currentPage })

                setJobs(data.results || [])
                setCount(data.count || 0)
                setNextPage(data.next)
                setPreviousPage(data.previous)
            } catch (err) {
                console.error('Lỗi khi tải danh sách job:', err)
                setError('Không thể tải danh sách việc làm.')
            } finally {
                setLoading(false)
            }
        }

        fetchJobs()
    }, [currentPage])

    if (loading) {
        return <div className="text-center mt-5">Đang tải...</div>
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>
    }

    return (
        <div className="container mt-4">
            <h4 className="mb-2 fw-bold">Danh sách việc làm</h4>
            <p className="text-muted">Tổng số việc làm: {count}</p>

            <div className="row g-3">
                {jobs.length > 0 ? (
                    jobs.map(job => (
                        <div className="col-md-6 col-lg-3" key={job.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold">{job.title}</h5>

                                    <p className="text-muted mb-1">
                                        <i className="bi bi-building me-1"></i>
                                        {job.company_name || `Company #${job.company}`}
                                    </p>

                                    <p className="text-muted mb-1">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {job.location}
                                    </p>

                                    <p className="text-muted mb-2">
                                        <i className="bi bi-clock me-1"></i>
                                        {job.job_type}
                                    </p>

                                    {job.salary_min && job.salary_max && (
                                        <p className="text-success fw-bold mb-3">
                                            {Number(job.salary_min).toLocaleString()} - {Number(job.salary_max).toLocaleString()} VNĐ
                                        </p>
                                    )}

                                    <div className="mt-auto">
                                        <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm w-100">
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center text-muted">
                        Không có việc làm nào.
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${!previousPage ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    disabled={!previousPage}
                                >
                                    Trước
                                </button>
                            </li>

                            {[...Array(totalPages)].map((_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${!nextPage ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={!nextPage}
                                >
                                    Sau
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default JobList