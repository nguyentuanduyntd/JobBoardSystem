from django.http import HttpResponse
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobCategory, Job, Skill
from .paginators import MyPaginator
from .serializers import JobCategorySerializer, JobSerializer, SkillSerializer


class JobCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.filter(active=True)
    serializer_class = JobSerializer
    pagination_class = MyPaginator
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = self.queryset
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)
        return query

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
