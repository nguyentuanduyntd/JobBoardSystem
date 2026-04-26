import { getJobs, getCompanies, getJobCategories } from "../services/jobService";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Heart,
  Bookmark,
  Monitor,
  Megaphone,
  BarChart2,
  Palette,
  Handshake,
  Truck,
  BookOpen,
  Rocket,
  Lightbulb,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const generateColor = (str) => {
  if (!str) return "#1a73e8";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs((((Math.sin(hash) * 10000) % 1) * 16777215))
  ).toString(16);

  return `#${"000000".substring(0, 6 - color.length)}${color}`;
};

const categoryIcons = [
  <Monitor size={32} key="monitor" />,
  <Megaphone size={32} key="megaphone" />,
  <BarChart2 size={32} key="chart" />,
  <Palette size={32} key="palette" />,
  <Handshake size={32} key="handshake" />,
  <Building2 size={32} key="building" />,
  <Truck size={32} key="truck" />,
  <BookOpen size={32} key="book" />,
  <Rocket size={32} key="rocket" />,
  <Lightbulb size={32} key="bulb" />,
];

export default function Home() {
  const [searchJob, setSearchJob] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  const handleSearchInput = useCallback((value) => {
    setSearchJob(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setShowDropdown(true);
      try {
        const params = new URLSearchParams({ q: value });
        if (searchLocation.trim()) params.append("location", searchLocation.trim());
        const url = `${API_BASE_URL}/search/?${params}`;
        console.log("🔍 Fetching:", url);          // ← log URL
        const res = await fetch(url);
        const data = await res.json();
        console.log("✅ Results:", data);           // ← log kết quả
        setSearchResults(data.results);
      } catch (e) {
        console.error("❌ Search error:", e);       // ← log lỗi
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, [searchLocation]);

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [jobsData, companiesData, categoriesData] = await Promise.all([
          getJobs(),
          getCompanies(),
          getJobCategories(),
        ]);

        const jobs = jobsData?.results || jobsData || [];
        const companies = companiesData?.results || companiesData || [];
        const apiCategories = categoriesData?.results || categoriesData || [];

        const formattedJobs = Array.isArray(jobs)
          ? jobs.map((job) => ({
            id: job.id,
            title: job.title,
            company: job.company_name || "Company",
            logo: job.company_name ? job.company_name.charAt(0).toUpperCase() : "C",
            logoColor: generateColor(job.company_name || "Company"),
            location: job.location || "Đang cập nhật",
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

        setFeaturedJobs(formattedJobs);

        const API_BASE_URL = "http://127.0.0.1:8000";
        const formattedCompanies = Array.isArray(companies)
          ? companies.map((company) => ({
            id: company.id || company.name,
            name: company.name || "Company",
            logo: company.logo_url
              ? (company.logo_url.startsWith("http")
                ? company.logo_url
                : `${API_BASE_URL}${company.logo_url}`)
              : null,
            letter: company.name ? company.name.charAt(0).toUpperCase() : "C",
            color: generateColor(company.name || "Company"),
            jobs: company.job_count || 0,
            industry: company.industry || "Doanh nghiệp",
          }))
          : [];
        console.log(formattedCompanies);
        setTopCompanies(formattedCompanies);

        const formattedCategories = Array.isArray(apiCategories)
          ? apiCategories.map((cat, idx) => ({
            id: cat.id || cat.name,
            name: cat.name,
            icon: categoryIcons[idx % categoryIcons.length],
            job_count: cat.job_count || 0,
          }))
          : [];

        setCategories(formattedCategories);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingCard}>Đang tải dữ liệu trang chủ...</div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Tìm việc làm
            <br />
            <span style={styles.heroTitleAccent}>phù hợp nhất</span> với bạn
          </h1>

          <p style={styles.heroSub}>
            Kết nối ứng viên tài năng với những công ty hàng đầu Việt Nam và quốc tế.
          </p>

          <div style={styles.searchBox} ref={searchRef}>
            <div style={styles.searchField}>
              <Search size={18} color="#64748b" />
              <input
                style={styles.searchInput}
                placeholder="Chức danh, kỹ năng, công ty..."
                value={searchJob}
                onChange={(e) => {
                  console.log("INPUT CHANGED:", e.target.value);  // ← thêm dòng này
                  handleSearchInput(e.target.value);
                }}
                onFocus={() => searchResults && setShowDropdown(true)}
              />
            </div>

            <div style={styles.searchDivider} />

       

            <button
              type="button"
              style={styles.searchBtn}
              onClick={() => {
                if (searchJob.trim()) {
                  navigate(`/jobs?q=${encodeURIComponent(searchJob)}&location=${encodeURIComponent(searchLocation)}`);
                }
              }}
            >
              Tìm kiếm
            </button>

            {/* DROPDOWN */}
            {showDropdown && (
              <div style={styles.dropdown}>
                {searchLoading && (
                  <div style={styles.dropdownLoading}>Đang tìm kiếm...</div>
                )}

                {!searchLoading && searchResults && (
                  <>
                    {/* JOBS */}
                    {searchResults.jobs?.data?.length > 0 && (
                      <div>
                        <div style={styles.dropdownGroupTitle}>
                          <Briefcase size={13} /> Việc làm
                        </div>
                        {searchResults.jobs.data.slice(0, 4).map((job) => (
                          <div
                            key={job.id}
                            style={styles.dropdownItem}
                            onClick={() => {
                              setShowDropdown(false);
                              navigate(`/jobs/${job.id}`);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <div style={{ ...styles.dropdownIcon, background: generateColor(job.company_name) }}>
                              {job.company_name?.charAt(0) || "J"}
                            </div>
                            <div style={styles.dropdownInfo}>
                              <div style={styles.dropdownName}>{job.title}</div>
                              <div style={styles.dropdownSub}>
                                {job.company_name} · {job.location}
                              </div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* COMPANIES */}
                    {searchResults.companies?.data?.length > 0 && (
                      <div>
                        <div style={styles.dropdownGroupTitle}>
                          <Building2 size={13} /> Công ty
                        </div>
                        {searchResults.companies.data.slice(0, 3).map((company) => (
                          <div
                            key={company.id}
                            style={styles.dropdownItem}
                            onClick={() => {
                              setShowDropdown(false);
                              navigate(`/companies/${company.id}`);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <div style={{ ...styles.dropdownIcon, background: generateColor(company.name) }}>
                              {company.name?.charAt(0) || "C"}
                            </div>
                            <div style={styles.dropdownInfo}>
                              <div style={styles.dropdownName}>{company.name}</div>
                              <div style={styles.dropdownSub}>{company.location}</div>
                            </div>
                            <ChevronRight size={14} color="#94a3b8" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SKILLS */}
                    {searchResults.skills?.data?.length > 0 && (
                      <div>
                        <div style={styles.dropdownGroupTitle}>
                          <Rocket size={13} /> Kỹ năng
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 16px 10px" }}>
                          {searchResults.skills.data.slice(0, 6).map((skill) => (
                            <span
                              key={skill.id}
                              style={styles.dropdownSkillTag}
                              onClick={() => {
                                setShowDropdown(false);
                                navigate(`/jobs?skill=${encodeURIComponent(skill.content)}`);
                              }}
                            >
                              {skill.content}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KHÔNG CÓ KẾT QUẢ */}
                    {searchResults.jobs?.count === 0 &&
                      searchResults.companies?.count === 0 &&
                      searchResults.skills?.count === 0 && (
                        <div style={styles.dropdownEmpty}>
                          Không tìm thấy kết quả cho "<strong>{searchJob}</strong>"
                        </div>
                      )}

                    {/* XEM TẤT CẢ */}
                    {(searchResults.jobs?.count > 0 || searchResults.companies?.count > 0) && (
                      <div
                        style={styles.dropdownViewAll}
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(`/jobs?q=${encodeURIComponent(searchJob)}`);
                        }}
                      >
                        Xem tất cả kết quả cho "<strong>{searchJob}</strong>"
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Khám phá theo lĩnh vực</h2>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => setShowAllCategories((prev) => !prev)}
          >
            {showAllCategories ? "Thu gọn" : "Xem tất cả"} <ChevronRight size={14} />
          </button>
        </div>

        <div style={styles.categoriesGrid}>
          {(showAllCategories ? categories : categories.slice(0, 4)).map((cat) => (
            <div key={cat.id} style={styles.catCard}>
              <span style={styles.catIcon}>{cat.icon}</span>
              <div style={styles.catName}>{cat.name}</div>
              <div style={styles.catCount}>
                {(cat.job_count || 0).toLocaleString()} việc làm
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...styles.section, background: "#f8faff" }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Việc làm nổi bật</h2>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => setShowAllJobs((prev) => !prev)}
          >
            {showAllJobs ? "Thu gọn" : "Xem tất cả"} <ChevronRight size={14} />
          </button>
        </div>

        <div style={styles.jobsGrid}>
          {(showAllJobs ? featuredJobs : featuredJobs.slice(0, 3)).map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobCardTop}>
                <div style={{ ...styles.companyLogo, background: job.logoColor }}>
                  {job.logo}
                </div>

                <div style={styles.jobMeta}>
                  <div style={styles.jobCompany}>{job.company}</div>
                  <div style={styles.jobLocation}>
                    <MapPin size={12} style={{ marginRight: 4 }} />
                    {job.location}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSave(job.id)}
                  style={styles.saveBtn}
                >
                  {savedJobs.has(job.id) ? (
                    <Heart size={20} fill="#ef4444" color="#ef4444" />
                  ) : (
                    <Bookmark size={20} color="#94a3b8" />
                  )}
                </button>
              </div>

              <h3 style={styles.jobTitle}>{job.title}</h3>

              <div style={styles.jobSalary}>
                <DollarSign size={14} style={{ marginRight: 4 }} />
                {job.salary} VNĐ
              </div>

              <div style={styles.jobTags}>
                {job.tags.map((tag, index) => (
                  <span key={`${job.id}-${tag}-${index}`} style={styles.jobTag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={styles.jobFooter}>
                <span style={styles.jobType}>
                  <Clock size={12} style={{ marginRight: 4 }} />
                  {job.type}
                </span>

                <Link to={`/jobs/${job.id}`} style={styles.viewJobBtn}>
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Công ty hàng đầu</h2>
          <button
            type="button"
            style={styles.toggleBtn}
            onClick={() => setShowAllCompanies((prev) => !prev)}
          >
            {showAllCompanies ? "Thu gọn" : "Xem tất cả"} <ChevronRight size={14} />
          </button>
        </div>

        <div style={styles.companiesGrid}>
          {(showAllCompanies ? topCompanies : topCompanies.slice(0, 3)).map((company) => (
            <div key={company.id} style={styles.companyCard}>
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  style={styles.companyCardLogoImage}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                style={{
                  ...styles.companyCardLogo,
                  background: company.color,
                  display: company.logo ? "none" : "flex",
                }}
              >
                {company.letter}
              </div>

              <div style={styles.companyCardName}>{company.name}</div>

              <div style={styles.companyCardIndustry}>
                <Building2 size={13} style={{ marginRight: 4 }} />
                {company.industry}
              </div>

              <div style={styles.companyCardJobs}>
                <Briefcase size={13} style={{ marginRight: 4 }} />
                {company.jobs} việc làm đang tuyển
              </div>

              <Link to={`/companies/${company.id}`} style={styles.viewJobBtn}>
                Xem công ty
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.logo}>
              <Briefcase size={24} color="#60a5fa" />
              <span style={{ ...styles.logoText, color: "#fff", marginLeft: 8 }}>
                JobboardVN
              </span>
            </div>
            <p style={styles.footerDesc}>
              Nền tảng tuyển dụng hàng đầu Việt Nam. Kết nối tài năng – Xây dựng tương lai.
            </p>
          </div>
        </div>

        <div style={styles.footerBottom}>© 2025 JobboardVN.</div>
      </footer>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    color: "#0f172a",
    background: "#fff",
    minHeight: "100vh",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
  },
  loadingCard: {
    background: "#fff",
    padding: "18px 24px",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    fontWeight: 600,
    color: "#334155",
  },
  hero: {
    position: "relative",
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    maxWidth: 760,
    padding: "0 24px",
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.12,
    letterSpacing: "-1.5px",
    margin: "0 0 16px",
  },
  heroTitleAccent: {
    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 17,
    color: "#93c5fd",
    lineHeight: 1.6,
    marginBottom: 36,
  },
  searchBox: {
    display: "flex",
    position: "relative",
    alignItems: "center",
    background: "#fff",
    borderRadius: 16,
    padding: "8px 8px 8px 20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: 20,
    gap: 0,
  },
  searchField: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#0f172a",
    width: "100%",
    background: "transparent",
    padding: "8px 0",
  },
  searchDivider: {
    width: 1,
    height: 32,
    background: "#e2e8f0",
    margin: "0 16px",
  },
  searchBtn: {
    padding: "14px 32px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  section: {
    padding: "80px 40px",
    maxWidth: "100%",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    margin: "0 auto 40px",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2563eb",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  },
  toggleBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2563eb",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    maxWidth: 1200,
    margin: "0 auto",
  },
  catCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 20px",
    textAlign: "center",
    cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  catIcon: {
    display: "flex",
    justifyContent: "center",
    color: "#2563eb",
  },
  catName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 6,
  },
  catCount: {
    fontSize: 13,
    color: "#64748b",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    maxWidth: 1200,
    margin: "0 auto",
  },
  jobCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1.5px solid #e2e8f0",
    position: "relative",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  jobCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    flexShrink: 0,
  },
  jobMeta: {
    flex: 1,
  },
  jobCompany: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f172a",
  },
  jobLocation: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
  },
  saveBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.3,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: 600,
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
  },
  jobTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  jobTag: {
    padding: "4px 10px",
    borderRadius: 6,
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600,
  },
  jobFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  jobType: {
    fontSize: 12,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
  },
  viewJobBtn: {
    padding: "7.5px 16px",
    borderRadius: 8,
    border: "1.5px solid #2563eb",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "none",
  },
  companiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    maxWidth: 1200,
    margin: "0 auto",
  },
  companyCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 24px",
    border: "1.5px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  companyCardLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 900,
    fontSize: 26,
    marginBottom: 4,
  },
  companyCardLogoImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    objectFit: "cover",
    marginBottom: 4,
    border: "1px solid #e2e8f0",
  },
  companyCardName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  companyCardIndustry: {
    fontSize: 13,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
  },
  companyCardJobs: {
    fontSize: 13,
    fontWeight: 600,
    color: "#2563eb",
    marginTop: 4,
    display: "flex",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: 800,
  },
  footer: {
    background: "#0f172a",
    padding: "60px 40px 0",
  },
  footerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 40,
    paddingBottom: 48,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  footerDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 1.7,
    marginTop: 12,
  },
  footerColTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 10,
    cursor: "pointer",
  },
  footerBottom: {
    textAlign: "center",
    fontSize: 13,
    color: "#475569",
    padding: "20px 0",
    maxWidth: 1200,
    margin: "0 auto",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    zIndex: 100,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    maxHeight: 480,
    overflowY: "auto",
  },
  dropdownLoading: {
    padding: "20px 16px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  dropdownGroupTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px 6px",
    fontSize: 11,
    fontWeight: 800,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    borderTop: "1px solid #f1f5f9",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  dropdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  dropdownInfo: {
    flex: 1,
    minWidth: 0,
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  dropdownSkillTag: {
    padding: "5px 12px",
    borderRadius: 20,
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  dropdownEmpty: {
    padding: "20px 16px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  dropdownViewAll: {
    padding: "12px 16px",
    textAlign: "center",
    color: "#2563eb",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    borderTop: "1px solid #f1f5f9",
    background: "#f8faff",
  },
};