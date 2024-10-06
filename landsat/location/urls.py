from django.urls import path
from . import views

urlpatterns = [
    path('find-grid/', views.find_wrs2_grid, name='find_wrs2_grid'),
]