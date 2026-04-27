# Chạy toàn bộ hệ thống

docker compose up -d

# Vào backend để migrate (bắt buộc)

docker compose exec backend python jobboard/manage.py migrate

# Tạo admin (nếu cần)

docker compose exec backend python jobboard/manage.py createsuperuser

# (Nếu sửa gì thì phải chạy lại docker compose build --no-cache)

# chạy test

# Chạy toàn bộ test

docker-compose exec -w /app/jobboard backend python manage.py test

# Hoặc từng app

docker-compose exec -w /app/jobboard backend python manage.py test users
docker-compose exec -w /app/jobboard backend python manage.py test companies
docker-compose exec -w /app/jobboard backend python manage.py test jobs

# nếu sửa lại gì

docker compose up frontend backend -d --build