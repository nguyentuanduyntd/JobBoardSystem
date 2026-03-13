from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import CompanyViewSet
router = DefaultRouter()
router.register('companies', views.CompanyViewSet, basename='company')
urlpatterns = [
    path('', include(router.urls)),
    ]