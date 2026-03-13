from django.contrib import admin
from django.template.response import TemplateResponse
from django.utils.html import mark_safe
from django.urls import path
from django import forms
from django.db.models import Count
from .models import Job, JobCategory, Skill

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['id', 'content']
    search_fields = ['content']

class JobForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['requirements'].required = False
        self.fields['salary_min'].required = False
        self.fields['salary_max'].required = False
        self.fields['deadline'].required = False

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    form = JobForm
    list_display = ['id', 'title', 'company', 'job_type', 'location', 'deadline', 'active']
    search_fields = ['title', 'company__name']
    list_filter = ['active', 'job_type', 'category']
    filter_horizontal = ['skills']
    readonly_fields = ['created_date', 'update_date']
