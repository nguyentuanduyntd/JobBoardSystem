import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
const API_URL = 'http://127.0.0.1:8000'

const getLocalDateTimeMin = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('access_token')

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
}

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7', dot: '#f59e0b' },
  REVIEWING: { label: 'Đang xem xét', color: '#3b82f6', bg: '#dbeafe', dot: '#3b82f6' },
  ACCEPTED: { label: 'Chấp nhận', color: '#10b981', bg: '#d1fae5', dot: '#10b981' },
  REJECTED: { label: 'Từ chối', color: '#ef4444', bg: '#fee2e2', dot: '#ef4444' },
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return await res.json()
  }

  const text = await res.text()
  return { detail: text || 'Server trả về dữ liệu không hợp lệ' }
}

function UpdateModal({ application, onClose, onSaved }) {
  const [status, setStatus] = useState(application.status)
  const [interviewDate, setInterviewDate] = useState(
    application.interview_date ? application.interview_date.slice(0, 16) : ''
  )
  const [interviewAddress, setInterviewAddress] = useState(
    application.interview_address || ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const body = { status }

      if (interviewDate) {
        body.interview_date = new Date(interviewDate).toISOString()
      } else {
        body.interview_date = null
      }
      body.interview_address = interviewAddress.trim() || null
      const res = await authFetch(`${API_URL}/applications/${application.id}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await parseResponse(res)

      if (!res.ok) {
        let msg = 'Có lỗi xảy ra'

        if (typeof data === 'object' && data !== null) {
          if (data.detail && typeof data.detail === 'string') {
            msg = data.detail
          } else {
            msg = Object.values(data).flat().join(' ')
          }
        }

        setError(msg)
        return
      }

      onSaved(
        data.data || {
          ...application,
          status,
          interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
        }
      )
      onClose()
    } catch (err) {
      console.error('Update application error:', err)
      setError('Không thể kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <p style={styles.modalSub}>Cập nhật đơn ứng tuyển</p>
            <h2 style={styles.modalTitle}>{application.candidate_name}</h2>
            <p style={styles.modalJob}>📌 {application.job_title}</p>
          </div>

          <button style={styles.closeBtn} onClick={onClose}>
            X
          </button>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Trạng thái đơn</label>
          <div style={styles.statusGrid}>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                style={{
                  ...styles.statusChip,
                  background: status === key ? val.bg : '#f8fafc',
                  border: `2px solid ${status === key ? val.color : '#e2e8f0'}`,
                  color: status === key ? val.color : '#94a3b8',
                  fontWeight: status === key ? 700 : 500,
                }}
              >
                <span style={{ ...styles.dot, background: val.dot }} />
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>
            🗓 Lịch phỏng vấn
            <span style={styles.optional}> (tùy chọn) </span>
          </label>

          <input
            type="datetime-local"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            style={styles.dateInput}
            min={getLocalDateTimeMin()}
          />
        <div style={styles.section}>
            <label style={styles.label}>
                📍 Địa chỉ phỏng vấn
                <span style={styles.optional}> (tùy chọn) </span>
            </label>
            <input
                type="text"
                value={interviewAddress}
                onChange={(e) => setInterviewAddress(e.target.value)}
                placeholder="Nhập địa chỉ phỏng vấn"
                style={styles.dateInput}
            />
        </div>
          {interviewDate && (
            <button
              type="button"
              style={styles.clearDate}
              onClick={() => setInterviewDate('')}
            >
              Xóa lịch phỏng vấn
            </button>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.modalActions}>
          <button type="button" style={styles.cancelBtn} onClick={onClose}>
            Hủy
          </button>

          <button
            type="button"
            style={{
              ...styles.saveBtn,
              background: cfg.color,
              opacity: loading ? 0.7 : 1,
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ApplicationCard({ app, onEdit }) {
  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.PENDING

  const date = new Date(app.applied_date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const interview = app.interview_date
    ? new Date(app.interview_date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <div style={styles.avatar}>
          {(app.candidate_name || '?')[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.candidateName}>{app.candidate_name}</p>
          <p style={styles.candidateEmail}>{app.candidate_email}</p>
        </div>

        <span style={{ ...styles.badge, background: cfg.bg, color: cfg.color }}>
          <span style={{ ...styles.dot, background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      <div style={styles.cardMid}>
        <span style={styles.jobTag}>💼 {app.job_title}</span>
        <span style={styles.dateTag}>📅 Nộp: {date}</span>
      </div>

      {app.interview_date && (
        <div style={styles.interviewBanner}>
            🗓 Phỏng vấn: <strong>{interview}</strong>
            {app.interview_address && (
            <>
            <br />
        📍    Địa chỉ: <strong>{app.interview_address}</strong>
            </>
            )}
        </div>
      )}

      {app.cover_letter && (
        <p style={styles.coverLetter}>
          "{app.cover_letter.slice(0, 120)}
          {app.cover_letter.length > 120 ? '…' : ''}"
        </p>
      )}

      <div style={styles.cardActions}>
        {app.cv_file && (
          <a href={app.cv_file} target="_blank" rel="noreferrer" style={styles.cvLink}>
            📄 Xem CV
          </a>
        )}

        <button type="button" style={styles.editBtn} onClick={() => onEdit(app)}>
          ✏ Cập nhật
        </button>
      </div>
    </div>
  )
}

export default function EmployerDashboard() {
  const [applications, setApplications] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const res = await authFetch(`${API_URL}/applications/`)
      const data = await parseResponse(res)

      if (!res.ok) {
        throw new Error(
          typeof data === 'object' && data?.detail
            ? data.detail
            : 'Không thể tải danh sách ứng tuyển'
        )
      }

      setApplications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch applications error:', err)
      setError('Không thể tải danh sách ứng tuyển')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    let list = [...applications]

    if (filterStatus !== 'ALL') {
      list = list.filter((a) => a.status === filterStatus)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.candidate_name?.toLowerCase().includes(q) ||
          a.job_title?.toLowerCase().includes(q) ||
          a.candidate_email?.toLowerCase().includes(q)
      )
    }

    setFiltered(list)
  }, [applications, filterStatus, search])

  const handleSaved = (updated) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = applications.filter((a) => a.status === key).length
    return acc
  }, {})

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Quản lý ứng tuyển</h1>
          <p style={styles.pageSub}>{applications.length} đơn ứng tuyển tổng cộng</p>
        </div>
        <Link to="/employer/jobs" style={styles.manageJobsLink}>
            Quản lý job đã đăng
        </Link>
      </div>

      <div style={styles.statsRow}>
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <div key={key} style={{ ...styles.statCard, borderTop: `3px solid ${val.color}` }}>
            <p style={{ ...styles.statNum, color: val.color }}>{counts[key] || 0}</p>
            <p style={styles.statLabel}>{val.label}</p>
          </div>
        ))}
      </div>

      <div style={styles.filterBar}>
        <input
          placeholder="🔍 Tìm theo tên, email, vị trí..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.filterChips}>
          <button
            type="button"
            style={{
              ...styles.filterChip,
              ...(filterStatus === 'ALL' ? styles.filterActive : {}),
            }}
            onClick={() => setFilterStatus('ALL')}
          >
            Tất cả ({applications.length})
          </button>

          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button
              type="button"
              key={key}
              style={{
                ...styles.filterChip,
                ...(filterStatus === key
                  ? {
                      background: val.bg,
                      color: val.color,
                      borderColor: val.color,
                    }
                  : {}),
              }}
              onClick={() => setFilterStatus(key)}
            >
              {val.label} ({counts[key] || 0})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={styles.center}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>Đang tải...</p>
        </div>
      ) : error ? (
        <div style={styles.center}>
          <p style={{ color: '#ef4444', fontSize: 16 }}>{error}</p>
          <button type="button" style={styles.retryBtn} onClick={fetchApplications}>
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.center}>
          <p style={{ fontSize: 40 }}>📭</p>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>Không có đơn ứng tuyển nào</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((app) => (
            <ApplicationCard key={app.id} app={app} onEdit={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <UpdateModal
          application={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: "'DM Sans', sans-serif",
    padding: '32px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSub: {
    fontSize: 14,
    color: '#64748b',
    margin: '4px 0 0',
  },

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  statNum: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    margin: '4px 0 0',
    fontWeight: 500,
  },

  filterBar: {
    background: '#fff',
    borderRadius: 14,
    padding: '16px 20px',
    marginBottom: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  filterChips: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1.5px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    color: '#475569',
    transition: 'all .15s',
  },
  filterActive: {
    background: '#0f172a',
    color: '#fff',
    borderColor: '#0f172a',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 16,
  },

  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0,
  },
  candidateName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 15,
    color: '#0f172a',
  },
    manageJobsLink: {
      textDecoration: 'none',
      background: '#0f172a',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
    },
  candidateEmail: {
    margin: 0,
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },

  cardMid: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  jobTag: {
    fontSize: 12,
    background: '#f1f5f9',
    color: '#475569',
    padding: '4px 10px',
    borderRadius: 8,
    fontWeight: 500,
  },
  dateTag: {
    fontSize: 12,
    background: '#f1f5f9',
    color: '#475569',
    padding: '4px 10px',
    borderRadius: 8,
    fontWeight: 500,
  },

  interviewBanner: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#1d4ed8',
  },

  coverLetter: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 1.5,
    margin: 0,
    padding: '10px 12px',
    background: '#f8fafc',
    borderRadius: 8,
    borderLeft: '3px solid #e2e8f0',
  },

  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  cvLink: {
    flex: 1,
    padding: '8px 0',
    textAlign: 'center',
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
    border: '1.5px solid #e2e8f0',
  },
  editBtn: {
    flex: 2,
    padding: '8px 0',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    margin: '0 0 4px',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  modalJob: {
    fontSize: 13,
    color: '#64748b',
    margin: '4px 0 0',
  },
  closeBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 8,
    width: 32,
    height: 32,
    cursor: 'pointer',
    fontSize: 14,
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    display: 'block',
    marginBottom: 10,
  },
  optional: {
    fontWeight: 400,
    color: '#94a3b8',
  },

  statusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  statusChip: {
    padding: '10px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all .15s',
    fontFamily: 'inherit',
    background: '#fff',
  },

  dateInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#0f172a',
  },
  clearDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 600,
  },

  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 16,
  },

  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 0',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    padding: '12px 0',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity .15s',
  },

  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #0f172a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  retryBtn: {
    marginTop: 12,
    padding: '8px 20px',
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
}