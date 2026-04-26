from django.http import HttpResponse
from django.db.models import Count, Q
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import JobCategory, Job, Skill
from .paginators import MyPaginator
from .serializers import JobCategorySerializer, JobSerializer, SkillSerializer, EmployerJobSerializer
from companies.models import Company
from companies.serializers import CompanySerializer


class JobCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(name__icontains=q)
        return query


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.filter(active=True)
    serializer_class = JobSerializer
    pagination_class = MyPaginator
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = super().get_queryset()

        # Search theo title
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)

        # Filter theo company
        company = self.request.query_params.get('company')
        if company:
            query = query.filter(company_id=company)

        # Filter theo skill (id hoặc tên)
        skill = self.request.query_params.get('skill')
        if skill:
            query = query.filter(
                Q(skills__id=skill) | Q(skills__content__icontains=skill)
            ).distinct()

        # Filter theo salary
        salary_min = self.request.query_params.get('salary_min')
        if salary_min:
            query = query.filter(salary_max__gte=salary_min)

        salary_max = self.request.query_params.get('salary_max')
        if salary_max:
            query = query.filter(salary_min__lte=salary_max)

        # Filter theo job_type
        job_type = self.request.query_params.get('job_type')
        if job_type:
            query = query.filter(job_type=job_type)

        # Filter theo location
        location = self.request.query_params.get('location')
        if location:
            query = query.filter(location__icontains=location)

        return query

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        query = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(content__icontains=q)
        return query


class EmployerJobViewSet(viewsets.ModelViewSet):
    serializer_class = EmployerJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MyPaginator

    def get_queryset(self):
        user = self.request.user
        try:
            company = user.employer_profile.company
            return Job.objects.filter(company=company).order_by('-created_date')
        except Exception:
            return Job.objects.none()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        job.delete()
        return Response(
            {'message': 'Xóa job thành công'},
            status=status.HTTP_204_NO_CONTENT
        )

class GlobalSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()

        if not q:
            return Response(
                {'error': 'Vui lòng nhập từ khóa tìm kiếm (param: q)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Search Jobs
        jobs = Job.objects.filter(
            active=True
        ).filter(
            Q(title__icontains=q) |
            Q(description__icontains=q) |
            Q(location__icontains=q) |
            Q(skills__content__icontains=q) |
            Q(company__name__icontains=q)
        ).distinct()

        # Search Companies
        companies = Company.objects.filter(
            active=True
        ).filter(
            Q(name__icontains=q) |
            Q(description__icontains=q) |
            Q(location__icontains=q)
        ).distinct()

        # Search Job Categories
        categories = JobCategory.objects.filter(
            active=True,
            name__icontains=q
        )

        # Search Skills
        skills = Skill.objects.filter(
            active=True,
            content__icontains=q
        )

        return Response({
            'query': q,
            'results': {
                'jobs': {
                    'count': jobs.count(),
                    'data': JobSerializer(jobs[:10], many=True).data,
                },
                'companies': {
                    'count': companies.count(),
                    'data': CompanySerializer(companies[:10], many=True).data,
                },
                'categories': {
                    'count': categories.count(),
                    'data': JobCategorySerializer(categories[:10], many=True).data,
                },
                'skills': {
                    'count': skills.count(),
                    'data': SkillSerializer(skills[:10], many=True).data,
                },
            }
        })