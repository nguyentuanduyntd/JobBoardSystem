from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, CandidateProfile, EmployerProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','first_name','last_name' ,'username', 'email', 'password','avatar')
        extra_kwargs ={
            'password' : {
                'write_only' : True,
            }
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()

        if user.role == User.Role.CANDIDATE:
            CandidateProfile.objects.create(user=user)
        elif user.role == User.Role.EMPLOYER:
            EmployerProfile.objects.create(user=user)

        return user