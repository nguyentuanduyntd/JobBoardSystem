from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
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
        serializer.save()
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
        user = self.request.user
        return Application.objects.filter(
            job__company__recruiters__user=user
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
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': 'Cập nhật thành công',
            'data': ApplicationDetailSerializer(instance).data
        })


class JobApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(
            job_id=self.kwargs['job_id'],
            job__company__recruiters__user=self.request.user
        ).select_related('candidate', 'job', 'job__company').distinct()