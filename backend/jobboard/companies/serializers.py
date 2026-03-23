from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    job_count = serializers.IntegerField(source='jobs.count', read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'location', 'website', 'job_count']


