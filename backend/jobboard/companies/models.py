from django.db import models

from users.models import User


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
    logo = models.ImageField( upload_to='jobboard/companies/',blank=True, null=True)
    employer = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null=True, blank=True,
        related_name='companies',
    )

    def __str__(self):
        return self.name
