# System Architecture

## Overview

JobBoardSystem là một nền tảng tuyển dụng trực tuyến cho phép nhà tuyển dụng đăng tin tuyển dụng và ứng viên tìm kiếm, ứng tuyển công việc.

Hệ thống được xây dựng theo mô hình **Client-Server Architecture** và sử dụng kiến trúc **phân tầng (Layered Architecture)**.

Các công nghệ chính:

- Frontend: React + Vite
- Backend: Django REST Framework
- Database: MySQL
- Cache & Message Broker: Redis
- Containerization: Docker

---

## Architecture Diagram

User -> React Client -> Django REST API -> MySQL

Redis được sử dụng để cache dữ liệu và xử lý các tác vụ bất đồng bộ.

---

## Layers

Hệ thống được chia thành các tầng chính:

### Client Layer
React frontend chịu trách nhiệm hiển thị giao diện và gửi request tới backend thông qua REST API.

### API Layer
Django REST Framework xử lý các request từ client, xác thực người dùng và điều phối nghiệp vụ.

### Business Logic Layer
Xử lý logic nghiệp vụ như:
- đăng tin tuyển dụng
- tìm kiếm việc làm
- ứng tuyển công việc
- quản lý hồ sơ ứng viên

### Data Layer
Tầng dữ liệu của hệ thống sử dụng **MySQL** để lưu trữ thông tin chính của ứng dụng.

MySQL là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) phổ biến, cung cấp khả năng:

- lưu trữ dữ liệu có cấu trúc
- đảm bảo tính toàn vẹn dữ liệu
- hỗ trợ truy vấn SQL hiệu quả
- dễ tích hợp với Django ORM

Django sử dụng **Django ORM** để giao tiếp với MySQL, cho phép lập trình viên thao tác dữ liệu thông qua các model thay vì viết SQL trực tiếp.

### Infrastructure Layer
Bao gồm Redis, Docker và media storage để hỗ trợ hệ thống hoạt động hiệu quả.