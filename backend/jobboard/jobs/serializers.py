from rest_framework import serializers
from .models import Job, Skill, JobCategory

class JobCategorySerializer(serializers.ModelSerializer):
    job_count = serializers.IntegerField(source='jobs.count', read_only=True)
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'job_count']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'content']

class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    skills = serializers.SlugRelatedField(many=True, read_only=True, slug_field='content')
    class Meta:
        model = Job
        fields = ['id', 'title', 'description','location','job_type','salary_min','salary_max','category','company','company_name','skills', 'created_date', ]

