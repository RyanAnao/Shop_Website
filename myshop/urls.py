from django.urls import path
from . import views


urlpatterns = [
	path('', views.main, name='main'),
    path('<slug:category_slug>/', views.filter_by_category, name='filter_by_category'),
	path('<slug:category_slug>/<slug:product_slug>', views.product_detail, name='product_detail'),
]