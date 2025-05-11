from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required

from django.views.decorators.http import require_POST
from django.utils import timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json, requests, hashlib, secrets
from .models import Product, Order, OrderItem
# from cart.utils.cart import Cart


@login_required
@csrf_exempt
def create_order(request):
    if request.method == "POST":
        try:
            cart_data = json.loads(request.body)
            order = Order.objects.create(user=request.user)

            for pid, item in cart_data.items():
                product = Product.objects.get(pid=pid) 
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    price=product.price, 
                    quantity=item["quantity"],
                )

            return JsonResponse({
                "status": "success",
                "message": "Order created successfully!",
                "redirect_url": f"/orders/checkout/{order.id}/",
            })
        except Product.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Invalid product ID."}, status=400)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)

@csrf_exempt
@login_required
def update_order(request, oid):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            currency = data.get("currency")

            # Fetch the order
            order = Order.objects.get(oid=oid)

            # Generate hash (digest) for the order
            salt = secrets.token_hex(4)
            items_list = list(OrderItem.objects.filter(order=order).values("product__pid", "quantity", "price"))
            total_price = sum(item["price"] * item["quantity"] for item in items_list)
            items = json.dumps(items_list)
            merchant_email = "sb-vue9441771387@business.example.com"
            digest_data = {
                "currency": currency,
                "merchantEmail": merchant_email, 
                "salt": salt,
                "items": items,
                "totalPrice": total_price,
            }
            hash_string = json.dumps(digest_data, sort_keys=True)
            digest = hashlib.sha256(hash_string.encode("utf-8")).hexdigest()
            
            order.total_price = total_price
            order.currency = currency
            order.merchant_email = merchant_email
            order.salt = salt
            order.items = items
            order.total_price = total_price
            order.digest = digest
            order.save()

            return JsonResponse({"message": "Order updated successfully", "order": order, "digest_for_paypal": hash_string})
        except Order.DoesNotExist:
            return JsonResponse({"message": "Order not found"}, status=404)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)
    return JsonResponse({"message": "Invalid request method"}, status=405)

@login_required
def get_order_items(request, oid):
    order = get_object_or_404(Order, oid=oid, user=request.user)
    order_items = OrderItem.objects.filter(order=order).values(
        "pid", "product__name", "quantity", "price"
    )
    return JsonResponse(list(order_items), safe=False)

@login_required
def checkout(request, oid):
    order = get_object_or_404(Order, oid=oid)
    context = {'title':'Checkout' ,'order':order}
    return render(request, 'checkout.html', context)

@login_required
def user_orders(request):
    orders = request.user.orders.all()
    context = {'title':'Orders', 'orders': orders}
    return render(request, 'user_orders.html', context)

@csrf_exempt
def paypal_webhook(request):
    if request.method == "POST":
        # Verify PayPal IPN message
        verify_url = "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
        payload = {"cmd": "_notify-validate"}
        payload.update(request.POST)

        response = requests.post(verify_url, data=payload)
        if response.text != "VERIFIED":
            return JsonResponse({"message": "Invalid PayPal IPN"}, status=400)

        # Check if the transaction is already processed
        txn_id = request.POST.get("txn_id")
        if Order.objects.filter(transaction_id=txn_id).exists():
            return JsonResponse({"message": "Transaction already processed"}, status=400)

        # Validate order details
        order_id = request.POST.get("invoice")
        custom_digest = request.POST.get("custom")
        regenerate_digest = hashlib.sha256(custom_digest.encode("utf-8")).hexdigest()
        order = Order.objects.filter(order_id=order_id, digest=regenerate_digest).first()
        if not order:
            
            return JsonResponse({"message": "Order not found or invalid digest"}, status=400)

        # Update order status
        order.status = "Completed"
        order.transaction_id = txn_id
        order.save()

        return JsonResponse({"message": "Payment processed successfully"})
    return JsonResponse({"message": "Invalid request method"}, status=405)


@login_required
def complete_paypal_order(request, oid):
    order = get_object_or_404(Order, oid=oid)

    if order.status:
        return redirect("orders:user_orders")
    else:
        return render(request, "payment_failed.html", {"order": order})