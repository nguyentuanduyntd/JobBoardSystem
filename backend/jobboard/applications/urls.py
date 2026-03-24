from django.urls import path
from . import views

urlpatterns = [
    path('apply/', views.ApplyJobView.as_view(), name='apply-job'),
    path('my-applications/', views.MyApplicationsView.as_view(), name='my-applications'),
]