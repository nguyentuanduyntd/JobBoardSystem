# User Request -> Django -> Celery Task -> RabbitMQ (broker) -> Celery Worker -> Xử lý async
# Use cases cho jobboard
- Gửi email thông báo khi có đơn ứng tuyển
- Gửi email xác nhận đăng ký tài khoản
- Thông báo cho nhà tuyển dụng khi có ứng viên mới
- Export báo cáo
