from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import User, CandidateProfile
from .serializers import UserSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['current_user', 'update_info', 'update_profile', 'change_password']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'patch'], url_path='current-user', detail=False)
    def current_user(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)

        # Patch
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.validated_data.pop('password', None)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], url_path='update-info', detail=False)
    def update_profile(self, request):
        try:
            profile = request.user.candidate_profile
        except CandidateProfile.DoesNotExist:
            return Response({'error': 'Không tìm thấy profile'}, status=404)

        if 'cv_file' in request.FILES:
            profile.cv_file = request.FILES['cv_file']
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        profile.save()

        return Response({'message': 'Cập nhật thành công!'})

    @action(methods=['post'], url_path='change-password', detail=False)
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response(
                {'error': 'Mật khẩu cũ không đúng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Đổi mật khẩu thành công!'})
