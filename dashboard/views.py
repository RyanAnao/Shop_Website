from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.http import Http404

from myshop.models import Product, Category
from accounts.models import User
from orders.models import Order, OrderItem
from .forms import AddProductForm, AddCategoryForm, EditProductForm, EditCategoryForm


def is_manager(user):
    try:
        if not user.is_manager:
            raise Http404
        return True
    except:
        raise Http404


@user_passes_test(is_manager)
@login_required
def categories(request):
    categories = Category.objects.all()
    context = {'title':'Categories' ,'categories':categories}
    return render(request, 'categories.html', context)

@user_passes_test(is_manager)
@login_required
def add_category(request):
    if request.method == 'POST':
        form = AddCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category added Successfuly!')
            return redirect('dashboard:add_category')
    else:
        form = AddCategoryForm()
    context = {'title':'Add Category', 'form':form}
    return render(request, 'add_category.html', context)

@user_passes_test(is_manager)
@login_required
def edit_category(request, catid):
    category = get_object_or_404(Category, catid=catid)
    if request.method == 'POST':
        form = EditCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category has been updated successfully!', 'success')
            return redirect('dashboard:categories')
    else:
        form = EditCategoryForm(instance=category)
    context = {'title': 'Edit Category', 'form': form}
    return render(request, 'edit_category.html', context)

@user_passes_test(is_manager)
@login_required
def delete_category(request, catid):
    category = Category.objects.filter(catid=catid).delete()
    messages.success(request, 'Category has been deleted successfully!', 'success')
    return redirect('dashboard:categories')


@user_passes_test(is_manager)
@login_required
def products(request):
    products = Product.objects.all()
    context = {'title':'Products' ,'products':products}
    return render(request, 'products.html', context)


@user_passes_test(is_manager)
@login_required
def add_product(request):
    if request.method == 'POST':
        form = AddProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product added Successfuly!')
            return redirect('dashboard:add_product')
    else:
        form = AddProductForm()
    context = {'title':'Add Product', 'form':form}
    return render(request, 'add_product.html', context)


@user_passes_test(is_manager)
@login_required
def delete_product(request, pid):
    product = Product.objects.filter(pid=pid).delete()
    messages.success(request, 'product has been deleted!', 'success')
    return redirect('dashboard:products')


@user_passes_test(is_manager)
@login_required
def edit_product(request, pid):
    product = get_object_or_404(Product, pid=pid)
    if request.method == 'POST':
        form = EditProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            messages.success(request, 'Product has been updated', 'success')
            return redirect('dashboard:products')
    else:
        form = EditProductForm(instance=product)
    context = {'title': 'Edit Product', 'form':form}
    return render(request, 'edit_product.html', context)


@user_passes_test(is_manager)
@login_required
def orders(request):
    orders = Order.objects.all()
    context = {'title':'Orders', 'orders':orders}
    return render(request, 'orders.html', context)


@user_passes_test(is_manager)
@login_required
def order_detail(request, oid):
    order = Order.objects.filter(oid=oid).first()
    items = OrderItem.objects.filter(order=order).all()
    context = {'title':'order detail', 'items':items, 'order':order}
    return render(request, 'order_detail.html', context)