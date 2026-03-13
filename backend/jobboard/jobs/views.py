from django.http import HttpResponse
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobCategory, Job, Skill
from .serializers import JobCategorySerializer, JobSerializer, Skill, SkillSerializer


class JobCategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer

class JobViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class SkillViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
