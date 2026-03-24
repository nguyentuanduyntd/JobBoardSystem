from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
from .serializers import ApplyJobSerializer, ApplicationSerializer

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
