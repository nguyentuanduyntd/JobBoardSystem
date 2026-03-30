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

class EmployerJobSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), required=False
    )
    company_name = serializers.CharField(source='company.name', read_only=True)
    class Meta:
        model = Job
        fields =['id', 'title','description','requirements','location','job_type','salary_min','salary_max','deadline','slots','category','skills','company','company_name','active','created_date']
        read_only_fields = ['company','created_date']

    def create (self, validated_data):
        skills = validated_data.pop('skills',[])
        user = self.context['request'].user
        try:
            company = user.employer_profile.company
        except Exception:
            raise serializers.ValidationError({'company': 'Employer chưa có company'})
        job = Job.objects.create(company=company,**validated_data)
        job.skills.set(skills)
        return job

    def update(self, instance, validated_data):
        skills = validated_data.pop('skills',None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if skills is not None:
            instance.skills.set(skills)
        return instance