## Database Container

Hệ thống sử dụng MySQL container trong Docker để lưu trữ dữ liệu.

MySQL container chịu trách nhiệm:

- lưu trữ dữ liệu hệ thống
- quản lý bảng dữ liệu
- xử lý truy vấn SQL từ backend

Backend Django kết nối tới MySQL thông qua Django ORM.