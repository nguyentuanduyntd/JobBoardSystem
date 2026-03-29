from django.urls import path
from . import views

urlpatterns = [
    #API CANDIDATE
    path('apply/', views.ApplyJobView.as_view(), name='apply-job'),
    path('my-applications/', views.MyApplicationsView.as_view(), name='my-applications'),

    #API EMPLOYER
    path('applications/', views.EmployerApplicationListView.as_view(), name='employer-applications'),
    path('applications/<int:pk>/', views.EmployerApplicationDetailView.as_view(), name='application-detail'),
    path('applications/<int:pk>/status/', views.EmployerApplicationUpdateView.as_view(), name='application-update'),
    path('jobs/<int:job_id>/applications', views.JobApplicationListView.as_view(), name='job-applications'),
]