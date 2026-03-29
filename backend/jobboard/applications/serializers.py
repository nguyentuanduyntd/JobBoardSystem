from rest_framework import serializers
from django.utils import timezone

from .models import Application

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_name = serializers.CharField(source='candidate.username', read_only=True)

    class Meta:
        model = Application
        fields = ['id' ,'job' ,'job_title', 'candidate', 'candidate_name','cover_letter','status','applied_date','interview_date','interview_address']
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

#Employee
class ApplicationDetailSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    candidate_name = serializers.CharField(source='candidate.username', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)

    class Meta:
        model = Application
        fields = ['id','job','job_title','candidate','candidate_name','candidate_email','cover_letter','cv_file','status','applied_date','interview_date','interview_address']
        read_only_fields = ['candidate','job','applied_date']

class EmployerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status','interview_date','interview_address']

    def validate_status(self, value):
        valid = ['PENDING','REVIEWING','ACCEPTED','REJECTED']
        if value not in valid:
            raise serializers.ValidationError(f'Status phải là một trong: {valid}')
        return value

    def validate_interview_date(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError('Lịch phỏng vấn không được là ngày trong quá khứ')
        return value

    def validate(self, data):
        interview_date = data.get('interview_date', self.instance.interview_date if self.instance else None)
        interview_address = data.get('interview_address', self.instance.interview_address if self.instance else None)
        status = data.get('status', self.instance.status if self.instance else None)
        if status == 'REJECTED' and (interview_date or interview_address):
            raise serializers.ValidationError(
                'Không thể đặt lịch hoặc địa chỉ phỏng vấn cho đơn đã bị từ chối'
            )
        if interview_date and not interview_address:
            raise serializers.ValidationError(
                {'interview_address': 'Vui lòng nhập địa chỉ phỏng vấn'}
            )

        return data
