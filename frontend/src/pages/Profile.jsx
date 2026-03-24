import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('info')
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    })
    const [avatar, setAvatar] = useState(null)
    const [bio, setBio] = useState('')
    const [cvFile, setCvFile] = useState(null)
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    })
    const [message, setMessage] = useState({ type: '', text: '' })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
        })
    }, [user])

    const getToken = () => localStorage.getItem('access_token')

    const handleUpdateInfo = async (e) => {
        e.preventDefault()
        setLoading(true)
        const data = new FormData()
        Object.keys(formData).forEach(k => data.append(k, formData[k]))
        if (avatar) data.append('avatar', avatar)

        try {
            const response = await fetch('http://127.0.0.1:8000/users/current-user/', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: data,
            })
            if (response.ok) {
                setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
            } else {
                setMessage({ type: 'danger', text: 'Cập nhật thất bại!' })
            }
        } catch {
            setMessage({ type: 'danger', text: 'Lỗi kết nối server' })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateCV = async (e) => {
        e.preventDefault()
        if (!cvFile) return
        setLoading(true)
        const data = new FormData()
        data.append('cv_file', cvFile)
        data.append('bio', bio)

        try {
            const response = await fetch('http://127.0.0.1:8000/users/update-profile/', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: data,
            })
            if (response.ok) {
                setMessage({ type: 'success', text: 'Cập nhật CV thành công!' })
            } else {
                setMessage({ type: 'danger', text: 'Cập nhật thất bại!' })
            }
        } catch {
            setMessage({ type: 'danger', text: 'Lỗi kết nối server' })
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (passwords.new_password !== passwords.confirm_password) {
            setMessage({ type: 'danger', text: 'Mật khẩu mới không khớp!' })
            return
        }
        setLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:8000/users/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    old_password: passwords.old_password,
                    new_password: passwords.new_password,
                }),
            })
            if (response.ok) {
                setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
                setPasswords({ old_password: '', new_password: '', confirm_password: '' })
            } else {
                setMessage({ type: 'danger', text: 'Mật khẩu cũ không đúng!' })
            }
        } catch {
            setMessage({ type: 'danger', text: 'Lỗi kết nối server' })
        } finally {
            setLoading(false)
        }
    }

    if (!user) return null

    return (
        <div className="container mt-4" style={{ maxWidth: 800 }}>
            <h4 className="fw-bold mb-4">Hồ sơ cá nhân</h4>

            {/* Avatar + tên */}
            <div className="card shadow-sm mb-4">
                <div className="card-body d-flex align-items-center gap-4">
                    {user.avatar_url
                        ? <img src={user.avatar_url} alt="avatar" width="80" height="80"
                            className="rounded-circle object-fit-cover border" />
                        : <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 80, height: 80, fontSize: '2rem' }}>
                            {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                        </div>
                    }
                    <div>
                        <h5 className="fw-bold mb-0">{user.first_name} {user.last_name}</h5>
                        <p className="text-muted mb-0">{user.email}</p>
                        <span className="badge bg-primary mt-1">{user.role}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('info'); setMessage({}) }}>
                        Thông tin cá nhân
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'cv' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('cv'); setMessage({}) }}>
                        CV & Bio
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('password'); setMessage({}) }}>
                        Đổi mật khẩu
                    </button>
                </li>
            </ul>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Tab: Thông tin cá nhân */}
            {activeTab === 'info' && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleUpdateInfo}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Họ</label>
                                    <input type="text" className="form-control"
                                        value={formData.last_name}
                                        onChange={e => setFormData({...formData, last_name: e.target.value})} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Tên</label>
                                    <input type="text" className="form-control"
                                        value={formData.first_name}
                                        onChange={e => setFormData({...formData, first_name: e.target.value})} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Avatar</label>
                                <input type="file" className="form-control" accept="image/*"
                                    onChange={e => setAvatar(e.target.files[0])} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tab: CV & Bio */}
            {activeTab === 'cv' && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleUpdateCV}>
                            <div className="mb-3">
                                <label className="form-label">Giới thiệu bản thân</label>
                                <textarea className="form-control" rows={4}
                                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                                    value={bio}
                                    onChange={e => setBio(e.target.value)} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Upload CV (PDF, DOC)</label>
                                <input type="file" className="form-control"
                                    accept=".pdf,.doc,.docx"
                                    onChange={e => setCvFile(e.target.files[0])} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tab: Đổi mật khẩu */}
            {activeTab === 'password' && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <form onSubmit={handleChangePassword}>
                            <div className="mb-3">
                                <label className="form-label">Mật khẩu cũ</label>
                                <input type="password" className="form-control"
                                    value={passwords.old_password}
                                    onChange={e => setPasswords({...passwords, old_password: e.target.value})}
                                    required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Mật khẩu mới</label>
                                <input type="password" className="form-control"
                                    value={passwords.new_password}
                                    onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                                    required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Xác nhận mật khẩu mới</label>
                                <input type="password" className="form-control"
                                    value={passwords.confirm_password}
                                    onChange={e => setPasswords({...passwords, confirm_password: e.target.value})}
                                    required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile