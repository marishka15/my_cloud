from django.urls import path

from . import views


urlpatterns = [
    path('register/', views.register),
    path('login/', views.login_view),
    path('logout/', views.logout_view),
    path('me/', views.current_user),

    path('users/', views.users_list),
    path('users/<int:user_id>/', views.user_update),
    path('users/<int:user_id>/delete/', views.user_delete),

    path('files/', views.files_list),
    path('files/upload/', views.file_upload),
    path('files/<int:file_id>/', views.file_update),
    path('files/<int:file_id>/delete/', views.file_delete),
    path('files/<int:file_id>/download/', views.file_download),
    path('files/<int:file_id>/public-link/', views.create_public_link),

    path('public/<str:public_link>/', views.public_download),
]
