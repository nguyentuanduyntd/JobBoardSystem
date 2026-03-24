from rest_framework import serializers
from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_name = serializers.CharField(source='candidate.username', read_only=True)

    class Meta:
        model = Application
        fields = ['id' ,'job' ,'job_title', 'candidate', 'candidate_name','cover_letter','status','applied_date']
        read_only_fields = ['candidate','status','applied_date']

class ApplyJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['job','cover_letter','cv_file']

    def validate(self, data):
        user = self.context['request'].user
        job = data['job']

        if Application.objects.filter(candidate=user, job=job).exists():
            raise serializers.ValidationError('Bạn đã ứng tuyển vị trí này rồi')
        return data

    def create(self, validated_data):
        validated_data['candidate'] = self.context['request'].user
        return super().create(validated_data)