import { useState, useEffect } from "react";
import { getJobs, getCompanies, getJobCategories, getSkills } from "../services/jobService";

const generateColor = (str) => {
  if (!str) return "#1a73e8";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1 * 16777215)).toString(16);
  return '#' + '000000'.substring(0, 6 - color.length) + color;
};

export default function Home() {
  const [searchJob, setSearchJob] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [savedJobs, setSavedJobs] = useState(new Set());

  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsData, companiesData, categoriesData, skillsData] = await Promise.all([
          getJobs(),
          getCompanies(),
          getJobCategories(),
          getSkills()
        ]);

        const jobs = jobsData.results || jobsData;
        const companies = companiesData.results || companiesData;
        const apiCategories = categoriesData.results || categoriesData;
        const skills = skillsData.results || skillsData;

        const skillMap = {};
        if (Array.isArray(skills)) {
          skills.forEach(s => { skillMap[s.id] = s.content; });
        }

        const formattedJobs = Array.isArray(jobs) ? jobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || "Company",
          logo: job.company_name ? job.company_name.charAt(0).toUpperCase() : "C",
          logoColor: generateColor(job.company_name || "Company"),
          location: job.location,
          salary: (job.salary_min && job.salary_max) ? `${job.salary_min} - ${job.salary_max}` : "Thỏa thuận",
          tags: Array.isArray(job.skills) ? job.skills : [],
          type: job.job_type === "FT" ? "Full-time" : job.job_type === "PT" ? "Part-time" : job.job_type === "RE" ? "Remote" : "Freelance",
          hot: false
        })) : [];
        setFeaturedJobs(formattedJobs);

        const formattedCompanies = Array.isArray(companies) ? companies.map(c => ({
          id: c.id || c.name,
          name: c.name, 
          letter: c.name ? c.name.charAt(0).toUpperCase() : "C",
          color: generateColor(c.name || "Company"), 
          jobs: c.job_count || 0, 
          industry: c.industry || "Doanh nghiệp"
        })) : [];
        setTopCompanies(formattedCompanies);

        const defaultIcons = ["💻", "📣", "📊", "🎨", "🤝", "🏢", "🚚", "📚", "🚀", "💡"];
        const formattedCategories = Array.isArray(apiCategories) ? apiCategories.map((cat, idx) => ({
          id: cat.id || cat.name,
          name: cat.name, 
          icon: defaultIcons[idx % defaultIcons.length], 
          job_count: cat.job_count || 0
        })) : [];
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={styles.root}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Tìm việc làm<br />
            <span style={styles.heroTitleAccent}>phù hợp nhất</span> với bạn
          </h1>
          <p style={styles.heroSub}>
            Kết nối ứng viên tài năng với những công ty hàng đầu Việt Nam và quốc tế.
          </p>

          {/* SEARCH BOX */}
          <div style={styles.searchBox}>
            <div style={styles.searchField}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Chức danh, kỹ năng, công ty..."
                value={searchJob}
                onChange={(e) => setSearchJob(e.target.value)}
              />
            </div>
            <div style={styles.searchDivider} />
            <div style={styles.searchField}>
              <span style={styles.searchIcon}>📍</span>
              <input
                style={styles.searchInput}
                placeholder="Địa điểm làm việc"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <button style={styles.searchBtn}>Tìm kiếm</button>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Khám phá theo lĩnh vực</h2>
          <a style={styles.seeAll} href="#">Xem tất cả →</a>
        </div>
        <div style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <div key={cat.id} style={styles.catCard}>
              <span style={styles.catIcon}>{cat.icon}</span>
              <div style={styles.catName}>{cat.name}</div>
              <div style={styles.catCount}>{(cat.job_count || 0).toLocaleString()} việc làm</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section style={{ ...styles.section, background: "#f8faff" }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Việc làm nổi bật</h2>
          <a style={styles.seeAll} href="#">Xem tất cả →</a>
        </div>
        <div style={styles.jobsGrid}>
          {featuredJobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobCardTop}>
                <div style={{ ...styles.companyLogo, background: job.logoColor }}>
                  {job.logo}
                </div>
                <div style={styles.jobMeta}>
                  <div style={styles.jobCompany}>{job.company}</div>
                  <div style={styles.jobLocation}>📍 {job.location}</div>
                </div>
                <button
                  onClick={() => toggleSave(job.id)}
                  style={styles.saveBtn}
                  title="Lưu việc làm"
                >
                  {savedJobs.has(job.id) ? "❤️" : "🤍"}
                </button>
              </div>

              {job.hot && <span style={styles.hotBadge}>🔥 HOT</span>}
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <div style={styles.jobSalary}>💰 {job.salary}</div>

              <div style={styles.jobTags}>
                {job.tags.map((tag) => (
                  <span key={tag} style={styles.jobTag}>{tag}</span>
                ))}
              </div>

              <div style={styles.jobFooter}>
                <span style={styles.jobType}>{job.type}</span>
                <button style={styles.applyBtn}>Ứng tuyển</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP COMPANIES */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Công ty hàng đầu</h2>
          <a style={styles.seeAll} href="#">Xem tất cả →</a>
        </div>
        <div style={styles.companiesGrid}>
          {topCompanies.map((c) => (
            <div key={c.id} style={styles.companyCard}>
              <div style={{ ...styles.companyCardLogo, background: c.color }}>{c.letter}</div>
              <div style={styles.companyCardName}>{c.name}</div>
              <div style={styles.companyCardIndustry}>{c.industry}</div>
              <div style={styles.companyCardJobs}>{c.jobs} việc làm đang tuyển</div>
              <button style={styles.viewCompanyBtn}>Xem công ty</button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>⬡</span>
              <span style={{ ...styles.logoText, color: "#fff" }}>RecruitVN</span>
            </div>
            <p style={styles.footerDesc}>Nền tảng tuyển dụng hàng đầu Việt Nam. Kết nối tài năng – Xây dựng tương lai.</p>
          </div>
          {[
            { title: "Ứng viên", links: ["Tìm việc làm", "Hồ sơ cá nhân", "Việc làm đã lưu", "Thông báo việc làm"] },
            { title: "Nhà tuyển dụng", links: ["Đăng tin tuyển dụng", "Tìm kiếm ứng viên", "Quản lý tin đăng", "Gói dịch vụ"] },
            { title: "Công ty", links: ["Về chúng tôi", "Blog tuyển dụng", "Chính sách bảo mật", "Điều khoản sử dụng"] },
          ].map((col) => (
            <div key={col.title}>
              <div style={styles.footerColTitle}>{col.title}</div>
              {col.links.map((l) => <div key={l} style={styles.footerLink}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={styles.footerBottom}>© 2025 RecruitVN. Tất cả quyền được bảo lưu.</div>
      </footer>
    </div>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────── */
const styles = {
  root: {
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    color: "#0f172a",
    background: "#fff",
    minHeight: "100vh",
  },

  // HERO
  hero: {
    position: "relative", minHeight: "60vh",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
  },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative", zIndex: 2,
    textAlign: "center", maxWidth: 760, padding: "0 24px",
  },
  heroTitle: {
    fontSize: 56, fontWeight: 900, color: "#fff",
    lineHeight: 1.12, letterSpacing: "-1.5px", margin: "0 0 16px",
  },
  heroTitleAccent: {
    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 17, color: "#93c5fd", lineHeight: 1.6, marginBottom: 36,
  },
  searchBox: {
    display: "flex", alignItems: "center",
    background: "#fff", borderRadius: 16,
    padding: "8px 8px 8px 20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    marginBottom: 20, gap: 0,
  },
  searchField: { display: "flex", alignItems: "center", gap: 10, flex: 1 },
  searchIcon: { fontSize: 18, flexShrink: 0 },
  searchInput: {
    border: "none", outline: "none", fontSize: 15, color: "#0f172a",
    width: "100%", background: "transparent", padding: "8px 0",
  },
  searchDivider: { width: 1, height: 32, background: "#e2e8f0", margin: "0 16px" },
  searchBtn: {
    padding: "14px 32px", borderRadius: 12, border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0,
  },
  heroTags: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  heroTag: {
    padding: "6px 14px", borderRadius: 100,
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
    color: "#bfdbfe", fontSize: 13, cursor: "pointer",
  },

  // SECTIONS
  section: {
    padding: "80px 40px",
    maxWidth: "100%",
  },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    maxWidth: 1200, margin: "0 auto 40px",
  },
  sectionTitle: { fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" },
  seeAll: { fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none" },

  // CATEGORIES
  categoriesGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16, maxWidth: 1200, margin: "0 auto",
  },
  catCard: {
    background: "#fff", borderRadius: 16,
    padding: "28px 20px", textAlign: "center", cursor: "pointer",
    border: "1.5px solid #e2e8f0",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  catIcon: { fontSize: 36 },
  catName: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 12, marginBottom: 6 },
  catCount: { fontSize: 13, color: "#64748b" },

  // JOBS GRID
  jobsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20, maxWidth: 1200, margin: "0 auto",
  },
  jobCard: {
    background: "#fff", borderRadius: 16, padding: 24,
    border: "1.5px solid #e2e8f0", position: "relative",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    display: "flex", flexDirection: "column", gap: 10,
    transition: "all 0.2s",
  },
  jobCardTop: { display: "flex", alignItems: "center", gap: 12 },
  companyLogo: {
    width: 44, height: 44, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 900, fontSize: 18, flexShrink: 0,
  },
  jobMeta: { flex: 1 },
  jobCompany: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  jobLocation: { fontSize: 12, color: "#64748b", marginTop: 2 },
  saveBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 },
  hotBadge: {
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "#fff7ed", color: "#ea580c",
    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100,
    border: "1px solid #fed7aa", alignSelf: "flex-start",
  },
  jobTitle: { fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 },
  jobSalary: { fontSize: 14, fontWeight: 600, color: "#16a34a" },
  jobTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  jobTag: {
    padding: "4px 10px", borderRadius: 6,
    background: "#eff6ff", color: "#2563eb",
    fontSize: 12, fontWeight: 600,
  },
  jobFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  jobType: { fontSize: 12, color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: 6 },
  applyBtn: {
    padding: "8px 18px", borderRadius: 8, border: "none",
    background: "#2563eb", color: "#fff",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
  },

  // COMPANIES
  companiesGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20, maxWidth: 1200, margin: "0 auto",
  },
  companyCard: {
    background: "#fff", borderRadius: 16, padding: "28px 24px",
    border: "1.5px solid #e2e8f0",
    display: "flex", flexDirection: "column", alignItems: "center",
    textAlign: "center", gap: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  companyCardLogo: {
    width: 64, height: 64, borderRadius: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 900, fontSize: 26, marginBottom: 4,
  },
  companyCardName: { fontSize: 16, fontWeight: 800, color: "#0f172a" },
  companyCardIndustry: { fontSize: 13, color: "#64748b" },
  companyCardJobs: { fontSize: 13, fontWeight: 600, color: "#2563eb", marginTop: 4 },
  viewCompanyBtn: {
    marginTop: 8, padding: "9px 24px", borderRadius: 8,
    border: "1.5px solid #2563eb", background: "none",
    color: "#2563eb", fontWeight: 700, fontSize: 13, cursor: "pointer",
  },

  // FOOTER
  footer: { background: "#0f172a", padding: "60px 40px 0" },
  footerInner: {
    maxWidth: 1200, margin: "0 auto",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40,
    paddingBottom: 48, borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  footerDesc: { fontSize: 14, color: "#64748b", lineHeight: 1.7, marginTop: 12 },
  footerColTitle: { fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 },
  footerLink: { fontSize: 13, color: "#64748b", marginBottom: 10, cursor: "pointer" },
  footerBottom: {
    textAlign: "center", fontSize: 13, color: "#475569",
    padding: "20px 0", maxWidth: 1200, margin: "0 auto",
  },
};