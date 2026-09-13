from django.contrib import admin
from django.urls import include, path, re_path

from .views import frontend


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('storage.urls')),
    re_path(r'^(?!api/|admin/)(?P<path>.*)$', frontend),
]
