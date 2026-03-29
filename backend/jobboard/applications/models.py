from django.db import models
from jobs.models import Job
from users.models import User


# from users.models import User
# from jobs.models import Job

class Application(models.Model):
    STATUS_CHOICES =[
        ('PENDING' ,'Chờ xét duyệt'),
        ('REVIEWING','Đang xem xét'),
        ('ACCEPTED','Chấp nhận'),
        ('REJECTED','Từ chối'),
    ]
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_date = models.DateTimeField(auto_now_add=True)
    cv_file = models.FileField(upload_to='jobboard/applications/cv/', null=True, blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_address = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ('candidate', 'job') # mỗi người chỉ apply job đó 1 lần
        ordering = ('-applied_date',)

    def __str__(self):
        return f"{self.candidate.username} - {self.job.title}"