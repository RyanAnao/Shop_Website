from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage

from rest_framework import viewsets

from .models import Product, Category
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    

def paginat(request, list_objects):
	p = Paginator(list_objects, 20)
	page_number = request.GET.get('page')
	try:
		page_obj = p.get_page(page_number)
	except PageNotAnInteger:
		page_obj = p.page(1)
	except EmptyPage:
		page_obj = p.page(p.num_pages)
	return page_obj


def main(request):
	products = Product.objects.all()
	context = {'products': paginat(request ,products)}
	return render(request, 'main.html', context)

def filter_by_category(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    products_all = Product.objects.filter(catid=category)
    paginator = Paginator(products_all, 20)
    page_number = request.GET.get('page')
    products = paginator.get_page(page_number)
    return render(request, 'myshop/category.html', {'category': category, 'products': products})

def product_detail(request, category_slug, product_slug):
    category = get_object_or_404(Category, slug=category_slug)
    product = get_object_or_404(Product, slug=product_slug, catid=category)
    return render(request, 'myshop/product_detail.html', {'category': category, 'product': product})
