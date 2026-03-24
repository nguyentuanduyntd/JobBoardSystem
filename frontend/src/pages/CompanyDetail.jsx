import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCompanyDetail, getJobs } from "../services/jobService";
import {
    MapPin,
    Building2,
    BarChart2,
    DollarSign,
    Globe,
} from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const generateColor = (str) => {
  if (!str) return "#1a73e8";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs((((Math.sin(hash) * 10000) % 1) * 16777215))
  ).toString(16);
  return "#" + "000000".substring(0, 6 - color.length) + color;
};

const resolveMediaUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
};

export default function CompanyDetail() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [companyData, jobsData] = await Promise.all([
          getCompanyDetail(id),
          getJobs({ company: id }),
        ]);

        setCompany(companyData);

        const companyLogoUrl = resolveMediaUrl(companyData?.logo_url);
        const jobsList = jobsData?.results || jobsData || [];

        const formattedJobs = Array.isArray(jobsList)
          ? jobsList.map((job) => ({
              id: job.id,
              title: job.title,
              company: companyData?.name || "Company",
              logo: companyData?.name
                ? companyData.name.charAt(0).toUpperCase()
                : "C",
              logoUrl: companyLogoUrl,
              logoColor: generateColor(companyData?.name || "Company"),
              location: job.location || "Chưa cập nhật",
              salary:
                job.salary_min && job.salary_max
                  ? `${Number(job.salary_min).toLocaleString()} - ${Number(
                      job.salary_max
                    ).toLocaleString()}`
                  : "Thỏa thuận",
              tags: Array.isArray(job.skills) ? job.skills : [],
              type:
                job.job_type === "FT"
                  ? "Full-time"
                  : job.job_type === "PT"
                  ? "Part-time"
                  : job.job_type === "RE"
                  ? "Remote"
                  : "Freelance",
            }))
          : [];

        setJobs(formattedJobs);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu công ty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={styles.spinner}></div>
        <p>Đang tải thông tin công ty...</p>
      </div>
    );
  }

  if (!company || company.detail || !company.id) {
    return (
      <div style={styles.errorContainer}>
        <h2>Không tìm thấy công ty</h2>
        <Link to="/" style={styles.backLink}>
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const letter = company.name ? company.name.charAt(0).toUpperCase() : "C";
  const logoColor = generateColor(company.name);
  const logoSrc = resolveMediaUrl(company.logo_url);

  return (
    <div style={styles.root}>
      <section style={styles.headerSection}>
        <div style={styles.headerBg} />
        <div style={styles.headerContent}>
          <div style={styles.companyLogoWrap}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={company.name}
                style={styles.companyLogoLargeImage}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}

            <div
              style={{
                ...styles.companyLogoLarge,
                background: logoColor,
                display: logoSrc ? "none" : "flex",
              }}
            >
              {letter}
            </div>
          </div>

          <div style={styles.headerInfo}>
            <h1 style={styles.companyName}>{company.name}</h1>
            <div style={styles.companyMeta}>
                <MapPin size={18} color="#64748b" />
              <span style={styles.metaItem}>
                  {company.location || "Chưa cập nhật địa điểm"}
              </span>
              {company.website && (
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.metaItemLink}
                >
                 <Globe size={18} color="#64748b" /> Website
                </a>
              )}
                <Building2 size={18} color="#64748b" />
              <span style={styles.metaItem}>
                 {company.job_count || 0} việc làm đang tuyển
              </span>
            </div>
          </div>
        </div>
      </section>

      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Về chúng tôi</h2>
            <div style={styles.description}>
              {company.description ? (
                <p>{company.description}</p>
              ) : (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>
                  Chưa có thông tin giới thiệu.
                </p>
              )}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Việc làm đang tuyển ({jobs.length})
            </h2>

            <div style={styles.jobsGrid}>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobCardTop}>
                      <div style={styles.jobLogoWrap}>
                        {job.logoUrl ? (
                          <img
                            src={job.logoUrl}
                            alt={job.company}
                            style={styles.jobLogoImage}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback =
                                e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}

                        <div
                          style={{
                            ...styles.jobLogo,
                            background: job.logoColor,
                            display: job.logoUrl ? "none" : "flex",
                          }}
                        >
                          {job.logo}
                        </div>
                      </div>

                      <div style={styles.jobInfo}>
                        <h3 style={styles.jobTitle}>{job.title}</h3>
                        <div style={styles.jobCompany}>{job.company}</div>
                      </div>
                    </div>

                    <div style={styles.jobDetails}>
                      <div style={styles.jobDetailItem}>
                          <MapPin size={18} color="#64748b" />
                          {job.location}
                      </div>
                      <div style={styles.jobDetailItem}><DollarSign size={18} color="#64748b"/> {job.salary}</div>
                    </div>

                    <div style={styles.jobFooter}>
                      <span style={styles.jobType}>{job.type}</span>
                      <Link to={`/jobs/${job.id}`} style={styles.viewJobBtn}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noJobs}>
                  <p>Công ty hiện chưa có việc làm nào đang tuyển dụng.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.card}>
            <h3 style={styles.sidebarTitle}>Thông tin liên hệ</h3>
            <ul style={styles.contactList}>
              <li style={styles.contactItem}>
                <span style={styles.contactIcon}><MapPin size={18} color="#64748b" /></span>
                <div>
                  <div style={styles.contactLabel}>Địa chỉ</div>
                  <div style={styles.contactValue}>
                    {company.location || "Chưa cập nhật"}
                  </div>
                </div>
              </li>

              {company.website && (
                <li style={styles.contactItem}>
                  <span style={styles.contactIcon}><Globe size={18} color="#64748b" /></span>
                  <div>
                    <div style={styles.contactLabel}>Website</div>
                    <a
                      href={
                        company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.contactLink}
                    >
                      {company.website}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    color: "#0f172a",
    background: "#f8fafc",
    minHeight: "100vh",
    paddingBottom: 60,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "4px solid #e2e8f0",
    borderTopColor: "#3b82f6",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },
  errorContainer: {
    textAlign: "center",
    padding: "80px 20px",
  },
  backLink: {
    color: "#3b82f6",
    textDecoration: "none",
    fontWeight: 600,
    marginTop: 16,
    display: "inline-block",
  },

  headerSection: {
    position: "relative",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
  },
  headerBg: {
    height: 160,
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  },
  headerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    gap: 24,
    transform: "translateY(-40px)",
    marginBottom: -40,
    flexWrap: "wrap",
  },
  companyLogoWrap: {
    width: 120,
    height: 120,
    flexShrink: 0,
    position: "relative",
  },
  companyLogoLarge: {
    width: 120,
    height: 120,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 48,
    fontWeight: 800,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "4px solid #fff",
    flexShrink: 0,
  },
  companyLogoLargeImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    objectFit: "contain",
    background: "#fff",
    padding: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    border: "4px solid #fff",
    display: "block",
  },
  headerInfo: {
    paddingTop: 56,
  },
  companyName: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px",
  },
  companyMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px 24px",
  },
  metaItem: {
    fontSize: 15,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  metaItemLink: {
    fontSize: 15,
    color: "#3b82f6",
    display: "flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
  },

  container: {
    maxWidth: 1200,
    margin: "40px auto 0",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
    gap: 32,
    alignItems: "start",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 24px",
    paddingBottom: 16,
    borderBottom: "1px solid #f1f5f9",
  },
  description: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },

  jobsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  jobCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    transition: "all 0.2s",
    background: "#fff",
  },
  jobCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  jobLogoWrap: {
    width: 48,
    height: 48,
    flexShrink: 0,
  },
  jobLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
  },
  jobLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    objectFit: "contain",
    background: "#fff",
    padding: 4,
    border: "1px solid #e2e8f0",
    display: "block",
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px",
  },
  jobCompany: {
    fontSize: 14,
    color: "#64748b",
  },
  jobDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: 24,
    marginBottom: 16,
  },
  jobDetailItem: {
    fontSize: 14,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  jobFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTop: "1px solid #f1f5f9",
  },
  jobType: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "6px 12px",
    borderRadius: 6,
  },
  viewJobBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    background: "#3b82f6",
    padding: "8px 16px",
    borderRadius: 8,
    textDecoration: "none",
    transition: "background 0.2s",
  },
  noJobs: {
    textAlign: "center",
    padding: "40px 0",
    color: "#64748b",
  },

  sidebarTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 20px",
  },
  contactList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  contactItem: {
    display: "flex",
    gap: 16,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#3b82f6",
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: 500,
    wordBreak: "break-word",
  },
  contactLink: {
    fontSize: 15,
    color: "#3b82f6",
    fontWeight: 500,
    textDecoration: "none",
    wordBreak: "break-word",
  },
};