from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, CandidateProfile, EmployerProfile


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id','first_name','last_name' ,'username', 'email', 'password','avatar','avatar_url','role')
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

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()

        if user.role == User.Role.CANDIDATE:
            CandidateProfile.objects.get_or_create(user=user)
        elif user.role == User.Role.EMPLOYER:
            EmployerProfile.objects.get_or_create(user=user)

        return user