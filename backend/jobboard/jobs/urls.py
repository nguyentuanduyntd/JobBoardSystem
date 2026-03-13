from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import JobCategoryViewSet
router = DefaultRouter()
router.register('jobcategories', views.JobCategoryViewSet, basename='jobcategory')
router.register('jobs', views.JobViewSet, basename='job')
router.register('skills', views.SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
]