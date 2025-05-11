from django.urls import path

from orders import views

app_name = "orders"

urlpatterns = [
    path('create', views.create_order, name='create_order'),
    path('update/<int:oid>', views.update_order, name='update_order'),
    path('list', views.user_orders, name='user_orders'),
    path("<int:order_id>/items/", views.get_order_items, name="get_order_items"),

    path('checkout/<int:oid>', views.checkout, name='checkout'),
    path('paypal-webhook/', views.paypal_webhook, name='paypal_webhook'),
    path('complete', views.complete_paypal_order, name='complete_paypal_order'),

]