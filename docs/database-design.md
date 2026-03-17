# Database Design

Hệ thống JobBoard sử dụng **MySQL** làm hệ quản trị cơ sở dữ liệu chính.

Django ORM được sử dụng để ánh xạ các model trong backend sang các bảng trong MySQL.

## Main Entities

Hệ thống bao gồm các thực thể chính sau:

### Users
Lưu thông tin người dùng của hệ thống.

Các loại người dùng:
- Candidate
- Employer
- Admin

Các thuộc tính chính:

- id
- username
- email
- password
- role
- created_at

---

### Companies

Lưu thông tin công ty tuyển dụng.

Thuộc tính:

- id
- name
- description
- location
- website

---

### Jobs

Lưu thông tin tin tuyển dụng.

Thuộc tính:

- id
- title
- description
- salary
- location
- job_type
- company_id
- created_at

---

### Applications

Lưu thông tin hồ sơ ứng tuyển.

Thuộc tính:

- id
- candidate_id
- job_id
- cv_file
- status
- applied_at