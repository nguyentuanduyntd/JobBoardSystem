from rest_framework import serializers
from .models import Job, Skill, JobCategory

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ['id', 'name']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'content']

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    class Meta:
        model = Job
        fields = ['id', 'title', 'description','location','job_type','salary_min','salary_max','category','company','company_name','skills', 'created_date', ]

