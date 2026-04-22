import os
from celery import Celery
from django.conf import settings

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobboard.settings')

app = Celery('jobboard')

# Load config từ Django settings với namespace 'CELERY_'
app.config_from_object('django.conf:settings', namespace='CELERY')

# Tự động discover tasks.py trong tất cả INSTALLED_APPS
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')