from django.contrib import admin
from django.template.response import TemplateResponse
from django.utils.html import mark_safe
from django.urls import path
from django import forms
from django.db.models import Count
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']


