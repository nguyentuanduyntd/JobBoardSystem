from django.http import HttpResponse
from rest_framework import viewsets, permissions, status, generics, filters, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer
from django.db.models import Q    
    
class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.filter(active=True)
    serializer_class = CompanySerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        query = super().get_queryset()
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(
                Q(name__icontains=q) |
                Q(description__icontains=q) |
                Q(location__icontains=q)
            )
        return query