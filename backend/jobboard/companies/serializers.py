from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    job_count = serializers.IntegerField(source='jobs.count', read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'location', 'website', 'job_count','logo_url','logo']
        extra_kwargs = {
            'logo': {'write_only': True}
        }
    def get_logo_url(self, obj):
        if obj.logo:
            return obj.logo.url
        return None

