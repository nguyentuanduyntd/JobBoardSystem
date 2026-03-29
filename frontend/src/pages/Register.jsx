import {useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'CANDIDATE',
    })
    const [avatar, setAvatar] = useState(null)
    const [companies, setCompanies] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetch('http://127.0.0.1:8000/companies/')
            .then(res => res.json())
            .then(data => setCompanies(data))
            .catch(() => setCompanies([]))
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const data = new FormData()
        Object.keys(formData).forEach(key => {
            if(key === 'company' && formData.role !== 'EMPLOYER') return
            data.append(key, formData[key])

        })
        if (avatar) data.append('avatar', avatar)

        try {
            const response = await fetch('http://127.0.0.1:8000/users/', {
                method: 'POST',
                body: data,
            })
            const result = await response.json()
            if (response.ok) {
                navigate('/login')
            } else {
                setError(JSON.stringify(result))
            }
        } catch (err) {
            setError('Lỗi kết nối server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body p-4">
                  <h3 className="card-title text-center mb-4 fw-bold">Đăng ký</h3>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Họ</label>
                        <input type="text" name="last_name" className="form-control"
                          placeholder="Nhập họ" value={formData.last_name} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tên</label>
                        <input type="text" name="first_name" className="form-control"
                          placeholder="Nhập tên" value={formData.first_name} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input type="text" name="username" className="form-control"
                        placeholder="Nhập username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" name="email" className="form-control"
                        placeholder="Nhập email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" name="password" className="form-control"
                        placeholder="Nhập password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Vai trò</label>
                      <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                        <option value="CANDIDATE">Ứng viên</option>
                        <option value="EMPLOYER">Nhà tuyển dụng</option>
                      </select>
                    </div>

                    {formData.role === 'EMPLOYER' && (
                        <div className="mb-3">
                            <label className="form-label">Công ty</label>
                            <select name="company" className="form-select"
                            value={formData.company} onChange={handleChange} required>
                            <option value="">-- Chọn công ty --</option>
                            {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            </select>
                        </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label">Avatar</label>
                      <input type="file" className="form-control" accept="image/*"
                        onChange={(e) => setAvatar(e.target.files[0])} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  </form>
                  <p className="text-center mt-3">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}

export default Register