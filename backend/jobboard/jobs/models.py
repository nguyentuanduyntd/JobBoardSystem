from django.db import models

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ('-created_date',) #record mới luôn lên đầu


class Company(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()
    location = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class JobCategory(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Skill(BaseModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Job(BaseModel):

    JOB_TYPE_CHOICES = [
        ('FT', 'Full-time'),
        ('PT', 'Part-time'),
        ('RE', 'Remote'),
        ('FR', 'Freelance'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=100)

    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    job_type = models.CharField(max_length=2, choices=JOB_TYPE_CHOICES, default='FT')
    deadline = models.DateTimeField(null=True, blank=True)

    slots = models.IntegerField(default=1)
    skills = models.ManyToManyField(Skill, related_name='jobs')

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='jobs',
    )

    category = models.ForeignKey(
        JobCategory,
        on_delete=models.SET_NULL,
        null = True,
        related_name='jobs',
    )

    def __str__(self):
        return f"{self.title} - {self.company.name}"



