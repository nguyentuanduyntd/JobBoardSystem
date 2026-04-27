import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API_URL = 'http://127.0.0.1:8000'

const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('access_token')
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    })
}

const JOB_TYPES = [
    { value: 'FT', label: 'Full-time' },
    { value: 'PT', label: 'Part-time' },
    { value: 'RE', label: 'Remote' },
    { value: 'FR', label: 'Freelance' },
]

export default function EmployerEditJob() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { jobId } = useParams()

    const [categories, setCategories] = useState([])
    const [skills, setSkills] = useState([])
    const [selectedSkills, setSelectedSkills] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        title: '', description: '', requirements: '',
        location: '', job_type: 'FT',
        salary_min: '', salary_max: '',
        deadline: '', slots: 1, category: '',
    })

    useEffect(() => {
        if (!user || user.role !== 'EMPLOYER') {
            navigate('/')
            return
        }

        // Load categories, skills và job data song song
        Promise.all([
            fetch(`${API_URL}/jobcategories/`).then(r => r.json()),
            fetch(`${API_URL}/skills/`).then(r => r.json()),
            authFetch(`${API_URL}/employer/jobs/${jobId}/`).then(r => r.json()),
        ]).then(([catData, skillData, jobData]) => {
            setCategories(Array.isArray(catData) ? catData : (catData.results || []))
            setSkills(Array.isArray(skillData) ? skillData : (skillData.results || []))

            // Pre-fill form với data của job hiện tại
            setForm({
                title: jobData.title || '',
                description: jobData.description || '',
                requirements: jobData.requirements || '',
                location: jobData.location || '',
                job_type: jobData.job_type || 'FT',
                salary_min: jobData.salary_min || '',
                salary_max: jobData.salary_max || '',
                deadline: jobData.deadline ? jobData.deadline.slice(0, 16) : '',
                slots: jobData.slots || 1,
                category: jobData.category || '',
            })

            // Pre-select skills của job
            if (jobData.skills && Array.isArray(jobData.skills)) {
                setSelectedSkills(jobData.skills.map(s => typeof s === 'object' ? s.id : s))
            }
        }).catch(() => {
            setError('Không thể tải dữ liệu job')
        }).finally(() => {
            setFetching(false)
        })
    }, [user, jobId])

    const handleChange = e => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const toggleSkill = (id) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const body = {
                ...form,
                slots: Number(form.slots),
                category: form.category || null,
                salary_min: form.salary_min || null,
                salary_max: form.salary_max || null,
                deadline: form.deadline || null,
                skills: selectedSkills,
            }
            const res = await authFetch(`${API_URL}/employer/jobs/${jobId}/`, {
                method: 'PUT',
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess(true)
                setTimeout(() => navigate('/employer/jobs'), 1500)
            } else {
                setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Có lỗi xảy ra')
            }
        } catch {
            setError('Không thể kết nối server')
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    if (fetching) return (
        <div className="container mt-5 text-center">
            <p className="text-muted">Đang tải dữ liệu...</p>
        </div>
    )

    if (success) return (
        <div className="container mt-5 text-center">
            <div style={{ fontSize: '4rem' }}>✅</div>
            <h4 className="fw-bold text-success mt-3">Cập nhật thành công!</h4>
            <p className="text-muted">Đang chuyển hướng...</p>
        </div>
    )

    return (
        <div className="container mt-4 mb-5" style={{ maxWidth: 800 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <button className="btn btn-light" onClick={() => navigate(-1)}>←</button>
                <div>
                    <h4 className="fw-bold mb-0">Cập nhật tin tuyển dụng</h4>
                    <p className="text-muted mb-0 small">Chỉnh sửa thông tin vị trí tuyển dụng</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Thông tin cơ bản */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">📋 Thông tin cơ bản</h6>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Tên vị trí <span className="text-danger">*</span></label>
                            <input name="title" className="form-control" placeholder="VD: Senior Frontend Developer"
                                value={form.title} onChange={handleChange} required />
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Loại công việc</label>
                                <select name="job_type" className="form-select" value={form.job_type} onChange={handleChange}>
                                    {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Danh mục</label>
                                <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="form-label fw-bold">Địa điểm <span className="text-danger">*</span></label>
                            <input name="location" className="form-control" placeholder="VD: Hà Nội, TP.HCM, Remote..."
                                value={form.location} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                {/* Mô tả */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">📝 Mô tả công việc</h6>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Mô tả <span className="text-danger">*</span></label>
                            <textarea name="description" className="form-control" rows={5}
                                placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                                value={form.description} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="form-label fw-bold">Yêu cầu ứng viên</label>
                            <textarea name="requirements" className="form-control" rows={4}
                                placeholder="Kinh nghiệm, kỹ năng, bằng cấp yêu cầu..."
                                value={form.requirements} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Lương & Slots */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">💰 Đãi ngộ & Chỉ tiêu</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Lương tối thiểu (VNĐ)</label>
                                <input name="salary_min" type="number" className="form-control"
                                    placeholder="VD: 10000000"
                                    value={form.salary_min} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Lương tối đa (VNĐ)</label>
                                <input name="salary_max" type="number" className="form-control"
                                    placeholder="VD: 20000000"
                                    value={form.salary_max} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Số lượng tuyển</label>
                                <input name="slots" type="number" min="1" className="form-control"
                                    value={form.slots} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <label className="form-label fw-bold">Hạn nộp hồ sơ</label>
                            <input name="deadline" type="datetime-local" className="form-control"
                                value={form.deadline} onChange={handleChange}
                                min={new Date().toISOString().slice(0, 16)} />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">🛠 Kỹ năng yêu cầu</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {skills.map(s => (
                                <button key={s.id} type="button"
                                    onClick={() => toggleSkill(s.id)}
                                    className={`btn btn-sm ${selectedSkills.includes(s.id) ? 'btn-primary' : 'btn-outline-secondary'}`}>
                                    {s.content}
                                </button>
                            ))}
                        </div>
                        {skills.length === 0 && <p className="text-muted small mb-0">Không có skill nào</p>}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-5" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : '💾 Lưu thay đổi'}
                    </button>
                    <button type="button" className="btn btn-light px-4" onClick={() => navigate(-1)}>
                        Huỷ
                    </button>
                </div>
            </form>
        </div>
    )
}