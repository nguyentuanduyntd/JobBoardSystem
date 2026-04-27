import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");

  const fetchEmployerJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://127.0.0.1:8000/employer/jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Không thể tải danh sách job");
      }

      const data = await res.json();
      setJobs(data.results || data);
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa job này không?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/employer/jobs/${jobId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Xóa job thất bại");
      }

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      alert("Xóa job thành công");
    } catch (err) {
      alert(err.message || "Có lỗi khi xóa job");
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/employer/jobs/${jobId}/edit`);
  };

  useEffect(() => {
    fetchEmployerJobs();
  }, []);

  if (loading) return <p>Đang tải danh sách job...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Danh sách job đã đăng</h2>

      {jobs.length === 0 ? (
        <p>Bạn chưa đăng job nào.</p>
      ) : (
        <div>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <h3>{job.title}</h3>
              <p><strong>Công ty:</strong> {job.company_name}</p>
              <p><strong>Địa điểm:</strong> {job.location}</p>
              <p><strong>Loại job:</strong> {job.job_type}</p>
              <p><strong>Lương:</strong> {job.salary_min} - {job.salary_max}</p>
              <p><strong>Mô tả:</strong> {job.description}</p>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(job.id)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cập nhật
                </button>

                <button
                  onClick={() => handleDelete(job.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerJobs;