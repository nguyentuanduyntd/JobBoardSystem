from datetime import timedelta
from pathlib import Path
import os
from dotenv import load_dotenv
from kombu import Queue, Exchange
from celery.schedules import crontab

load_dotenv()

import cloudinary

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = 'django-insecure-or#@oanh&^17krd97g60w-_6vq2#_rt_a(yo2y6#1zw(a1f2=5'
DEBUG = True
ALLOWED_HOSTS = ['*']

# Media
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
CKEDITOR_UPLOAD_PATH = "uploads/"
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# ============================================================
# INSTALLED APPS
# ============================================================
INSTALLED_APPS = [
    'users',
    'jobs',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',
    'cloudinary',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg',
    'companies',
    'applications',
    'ckeditor',
    'ckeditor_uploader',
    'corsheaders',
    'django_celery_beat',
    'django_celery_results',
]

# ============================================================
# MIDDLEWARE
# ============================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
]

ROOT_URLCONF = 'jobboard.urls'
WSGI_APPLICATION = 'jobboard.wsgi.application'
AUTH_USER_MODEL = 'users.User'

# ============================================================
# TEMPLATES
# ============================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ============================================================
# DATABASE
# ============================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE'),
        'USER': os.getenv('MYSQL_USER'),
        'PASSWORD': os.getenv('MYSQL_PASSWORD'),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '3305'),
    }
}

# ============================================================
# REST FRAMEWORK + JWT
# ============================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# ============================================================
# CLOUDINARY
# ============================================================
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
)

# ============================================================
# PASSWORD VALIDATION
# ============================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ============================================================
# INTERNATIONALIZATION
# ✅ Phải khai báo TIME_ZONE TRƯỚC khi dùng trong Celery
# ============================================================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Ho_Chi_Minh'   # ✅ Đổi sang giờ Việt Nam
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================================
# EMAIL (cần thiết để tasks gửi mail hoạt động)
# ============================================================
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)



# ============================================================
# CELERY + RABBITMQ
# ✅ Đặt SAU TIME_ZONE để dùng được biến TIME_ZONE
# ============================================================
CELERY_BROKER_URL = os.environ.get(
    'CELERY_BROKER_URL',
    'amqp://guest:guest@localhost:5672/'
)
CELERY_RESULT_BACKEND = os.environ.get(
    'CELERY_RESULT_BACKEND',
    'redis://localhost:6379/0'
)

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE                    # ✅ Giờ đây TIME_ZONE đã được khai báo
CELERY_RESULT_EXPIRES = 86400
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# Queues
CELERY_TASK_QUEUES = (
    Queue('default',       Exchange('default'),       routing_key='default'),
    Queue('emails',        Exchange('emails'),        routing_key='emails'),
    Queue('notifications', Exchange('notifications'), routing_key='notifications'),
)
CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_DEFAULT_EXCHANGE = 'default'
CELERY_TASK_DEFAULT_ROUTING_KEY = 'default'

# Task routing
CELERY_TASK_ROUTES = {
    'applications.tasks.*': {'queue': 'emails',        'routing_key': 'emails'},
    'users.tasks.*':        {'queue': 'emails',        'routing_key': 'emails'},
    'jobs.tasks.*':         {'queue': 'notifications', 'routing_key': 'notifications'},
    'companies.tasks.*':    {'queue': 'notifications', 'routing_key': 'notifications'},
}

# Scheduled tasks (Celery Beat)
CELERY_BEAT_SCHEDULE = {
    'delete-expired-jobs-daily': {
        'task': 'jobs.tasks.delete_expired_jobs',
        'schedule': crontab(hour=0, minute=0),
    },
    'weekly-application-summary': {
        'task': 'applications.tasks.send_weekly_summary',
        'schedule': crontab(hour=8, minute=0, day_of_week=1),
    },
}