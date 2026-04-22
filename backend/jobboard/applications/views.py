from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
from .tasks import (
    notify_new_application,
    notify_employer_new_application,
    notify_candidate_status_changed,
    send_interview_schedule,
)
from .serializers import (
    ApplyJobSerializer,
    ApplicationSerializer,
    ApplicationDetailSerializer,
    EmployerUpdateSerializer,
)


class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplyJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        # Task 1 — Xác nhận cho candidate
        notify_new_application.apply_async(
            kwargs={
                'candidate_name':  application.candidate.username,
                'candidate_email': application.candidate.email,
                'job_title':       application.job.title,
                'company_name':    application.job.company.name,
            },
            queue='emails'
        )

        # Task 2 — Thông báo cho employer
        notify_employer_new_application.apply_async(
            args=[application.id],
            queue='emails'
        )

        return Response(
            {'message': 'Ứng tuyển thành công'},
            status=status.HTTP_201_CREATED
        )


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(candidate=self.request.user)


class EmployerApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiters__user=self.request.user
        ).select_related('candidate', 'job', 'job__company').distinct()


class EmployerApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiters__user=self.request.user
        ).select_related('candidate', 'job', 'job__company').distinct()


class EmployerApplicationUpdateView(generics.UpdateAPIView):
    serializer_class = EmployerUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch', 'put']

    def get_queryset(self):
        return Application.objects.filter(
            job__company__recruiters__user=self.request.user
        ).select_related('candidate', 'job', 'job__company').distinct()

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        old_status = instance.status                    # Lưu status cũ
        old_interview_date = instance.interview_date    # Lưu interview_date cũ

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()

        # Task 3 — Gửi email nếu status thay đổi
        if application.status != old_status:
            notify_candidate_status_changed.apply_async(
                args=[application.id],
                queue='emails'
            )

        # Task 4 — Gửi email nếu lịch phỏng vấn được set mới
        if application.interview_date and application.interview_date != old_interview_date:
            send_interview_schedule.apply_async(
                args=[application.id],
                queue='emails'
            )

        return Response({
            'message': 'Cập nhật thành công',
            'data': ApplicationDetailSerializer(application).data
        })


class JobApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job_id=self.kwargs['job_id'],
            job__company__recruiters__user=self.request.user
        ).select_related('candidate', 'job', 'job__company').distinct()