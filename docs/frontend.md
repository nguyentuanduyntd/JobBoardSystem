# Frontend Architecture

Frontend được xây dựng bằng **React + Vite** và hoạt động như một Single Page Application (SPA).

Frontend giao tiếp với backend thông qua REST API.

## Frontend Structure

src/
    assets/
    components/
    contexts/
    pages/
    services/

### pages
Chứa các trang chính của hệ thống.

Ví dụ:
- Home
- JobList
- JobDetail
- Login
- Register

### components
Các UI component có thể tái sử dụng.

Ví dụ:
- JobCard
- Navbar
- Pagination

### contexts
Quản lý state toàn cục của ứng dụng.

Ví dụ:
- AuthContext

### services
Chứa các hàm gọi API tới backend.