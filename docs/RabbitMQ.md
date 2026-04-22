#Công dụng:
- Django chỉ việc đẩy message/task
- Celery worker lấy task từ queue RabbitMQ để xử lý nền

#Step by step:
- Bước 1: pip install celery pika
- Bước 2: pip freeze > requirements.txt
- Bước 3: Thêm rabbitMQ vào docker-compose 
- Bước 4: chạy docker compose up -d rabbitmq
- Bước 5: Kiểm tra RabbitMQ chạy chưa port 15672
- Bước 6: tạo file celery.py trong project chính
- Bước 7: Sửa init.py 
