import random
import string

from django.db import models

from accounts.models import User
from shop.models import Product


class Order(models.Model):
    oid = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    status = models.BooleanField(default=False)
    order_id = models.CharField(max_length=8, unique=True, editable=False)
    digest = models.TextField(blank=True, null=True)
    currency = models.CharField(max_length=10)
    total_price = models.IntegerField()
    merchant_email = models.CharField(max_length=100)
    salt = models.CharField(max_length=10)
    items = models.JSONField(default=dict, blank=True, null=True)
    transaction_id = models.CharField(max_length=100)

    class Meta:
        ordering = ('-created',)

    def __str__(self):
        return f"{self.user.full_name} - order id: {self.id}"

    def save(self, *args, **kwargs):
        if not self.order_id:
            self.order_id = self.generate_unique_order_id()
        super().save(*args, **kwargs)

    def generate_unique_order_id(self):
        while True:
            order_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Order.objects.filter(order_id=order_id).exists():
                return order_id

    @property
    def get_total_price(self):
        total = sum(item.get_cost() for item in self.items.all())
        return total
    

class OrderItem(models.Model):
    oiid = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    price = models.IntegerField()
    quantity = models.SmallIntegerField(default=1)

    def __str__(self):
        return str(self.id)

    def get_cost(self):
        return self.price * self.quantity