from PIL import Image
import os

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.template.defaultfilters import slugify


class Category(models.Model):
    catid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, null=False)
    slug = models.SlugField(max_length=200, unique=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('shop:category', kwargs={'slug':self.slug})

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        return super().save(*args, **kwargs)
        

class Product(models.Model):
    pid = models.AutoField(primary_key=True)
    catid = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='catid', null=False)
    name = models.CharField(max_length=100, null=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    description = models.TextField()
    image = models.ImageField(upload_to='products')
    thumbnail = models.ImageField(upload_to='thumbnails', blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ('-date_created',)

    def __str__(self):
        return self.slug
        
    def get_absolute_url(self):
        return reverse('shop:product_detail', kwargs={
            'category_slug': self.catid.slug,
            'product_slug': self.slug
        })

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        if not self.catid.slug:
            self.catid.slug = slugify(self.catid.name)
            self.catid.save()

        super().save(*args, **kwargs)

        if self.image:
            self.generate_thumbnail()

    
    def generate_thumbnail(self):
        thumbnail_path = os.path.join(settings.MEDIA_ROOT, 'thumbnails')
        os.makedirs(thumbnail_path, exist_ok=True)

        img = Image.open(self.image.path)
        img.thumbnail((50, 50))
        thumbnail_filename = f"{os.path.splitext(os.path.basename(self.image.name))[0]}_{self.pid}_thumb.jpg"
        thumbnail_full_path = os.path.join(thumbnail_path, thumbnail_filename)
        img.save(thumbnail_full_path, "JPEG")

        self.thumbnail.name = f"thumbnails/{thumbnail_filename}"
        super().save(update_fields=['thumbnail'])
