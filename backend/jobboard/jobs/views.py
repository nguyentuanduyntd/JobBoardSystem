from django.http import HttpResponse
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobCategory, Job, Skill
from .paginators import MyPaginator
from .serializers import JobCategorySerializer, JobSerializer, Skill, SkillSerializer


class JobCategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer

class JobViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Job.objects.filter(active=True)
    serializer_class = JobSerializer
    pagination_class = MyPaginator

    def get_queryset(self):
        query = self.queryset
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)
        return query

class SkillViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
