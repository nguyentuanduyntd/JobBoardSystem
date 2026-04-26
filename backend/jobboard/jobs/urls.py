from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import GlobalSearchView

router = DefaultRouter()
router.register('jobcategories', views.JobCategoryViewSet, basename='jobcategory')
router.register('jobs', views.JobViewSet, basename='job')
router.register('skills', views.SkillViewSet, basename='skill')
router.register('employer/jobs', views.EmployerJobViewSet, basename='employer-job')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
]