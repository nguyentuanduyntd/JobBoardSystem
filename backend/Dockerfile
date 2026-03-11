# Sử dụng Python image chính thức
FROM python:3.11-slim

# Thiết lập biến môi trường để Python không tạo file .pyc và output trực tiếp ra terminal
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Tạo thư mục làm việc
WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho MySQL client
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy file requirements và cài đặt thư viện
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend vào container
COPY . /app/

# Chạy server Django (có thể dùng gunicorn khi deploy thật)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]