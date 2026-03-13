from cloudinary.provisioning import Role
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        EMPLOYER = "EMPLOYER", "Employer"
        CANDIDATE = "CANDIDATE", "Candidate"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CANDIDATE)
    avatar = models.ImageField(upload_to='jobboard/avatars/', null=True, blank=True)

    @property
    def is_employer(self):
        return self.role == Role.EMPLOYER
    @property
    def is_candidate(self):
        return self.role == Role.CANDIDATE


    def __str__(self):
        return self.username

class CandidateProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    cv_file = models.FileField(upload_to='jobboard/cvs/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.user.username

class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL,null=True, related_name='recruiters')
    position = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.username