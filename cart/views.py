from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404

from shop.models import Product

@login_required
def show_cart(request):
    return render(request, 'cart.html', {'title': 'Cart'})

@login_required
def add_to_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))

        product = get_object_or_404(Product, id=product_id)

        return JsonResponse({
            'status': 'success',
            'message': f'Added {quantity} of {product.title} to the cart.'
        })

    return JsonResponse({'status': 'error', 'message': 'Invalid request.'})


@csrf_exempt
@login_required
def remove_from_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')

        product = get_object_or_404(Product, id=product_id)

        return JsonResponse({
            'status': 'success',
            'message': f'Removed {product.title} from the cart.'
        })

    return JsonResponse({'status': 'error', 'message': 'Invalid request.'})