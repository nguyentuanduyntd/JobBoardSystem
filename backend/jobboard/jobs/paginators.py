from rest_framework.pagination import PageNumberPagination

class MyPaginator(PageNumberPagination):
    page_size = 4
    page_query_param = 'p'