# Backend Architecture

Backend của hệ thống được xây dựng bằng **Django REST Framework**.

Cấu trúc backend được chia thành nhiều ứng dụng (apps) theo domain nghiệp vụ.

## Backend Structure

backend/
    applications/
    companies/
    jobs/
    users/
    jobboard/

### users
Quản lý người dùng, xác thực và phân quyền.

Chức năng:
- đăng ký
- đăng nhập
- quản lý profile

### companies
Quản lý thông tin công ty.

### jobs
Quản lý tin tuyển dụng.

Chức năng:
- tạo job
- chỉnh sửa job
- tìm kiếm job
- phân trang

### applications
Quản lý hồ sơ ứng tuyển.

Chức năng:
- ứng tuyển
- xem danh sách ứng viên
- quản lý trạng thái hồ sơ

## Backend Layers

### Presentation Layer
- views.py
- serializers.py
- urls.py

### Business Logic Layer
- services

### Data Access Layer
- models
- ORM

### Infrastructure Layer
- Redis
- Media storage
- Docker