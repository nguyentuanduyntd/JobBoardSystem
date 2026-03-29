from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, CandidateProfile, EmployerProfile
from companies.models import Company


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    company = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        write_only=True,
        required=False
    )
    class Meta:
        model = User
        fields = ('id','first_name','last_name' ,'username', 'email', 'password','avatar','avatar_url','role','company')
        extra_kwargs ={
            'password' : {
                'write_only' : True,
            },
            'avatar' :{
                'write_only': True,
            }
        }

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    def validate(self,  data):
        if data.get('role') == User.Role.EMPLOYER and not data.get('company'):
            raise serializers.ValidationError({'company': 'Employer phải chọn công ty'})
        return data

    def create(self, validated_data):
        company = validated_data.pop('company',None)

        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()

        if user.role == User.Role.CANDIDATE:
            CandidateProfile.objects.get_or_create(user=user)
        elif user.role == User.Role.EMPLOYER:
            employer_profile, _ = EmployerProfile.objects.get_or_create(user=user)
            if company:
                employer_profile.company = company
                employer_profile.save()

        return user