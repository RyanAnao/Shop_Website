from django import forms
from django.forms import ModelForm
from django.core.exceptions import ValidationError

from shop.models import Product, Category


class AddCategoryForm(ModelForm):
    class Meta:
        model = Category
        fields = ['name']
    
    def __init__(self, *args, **kwargs):
        super(AddCategoryForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['class'] = 'form-control'

class EditCategoryForm(ModelForm):
    class Meta:
        model = Category
        fields = ['name']

    def __init__(self, *args, **kwargs):
        super(EditCategoryForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['class'] = 'form-control'


class AddProductForm(ModelForm):
    class Meta:
        model = Product
        fields = ['catid', 'name', 'price', 'description', 'image']

    def __init__(self, *args, **kwargs):
        super(AddProductForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'

    def clean_image(self):
        image = self.cleaned_data.get('image')

        if image:
            valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
            if not image.name.split('.')[-1].lower() in valid_extensions:
                raise ValidationError("Only surpport jpg、jpeg、png or gif.")

            if image.size > 10 * 1024 * 1024:
                raise ValidationError("The size of image should be smaller than 10MB.")

        return image

class EditProductForm(ModelForm):
    class Meta:
        model = Product
        fields = ['catid', 'name', 'price', 'description', 'image']

    def __init__(self, *args, **kwargs):
        super(EditProductForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'

    def clean_image(self):
        image = self.cleaned_data.get('image')

        if image:
            valid_extensions = ['jpg', 'jpeg', 'png', 'gif']
            if not image.name.split('.')[-1].lower() in valid_extensions:
                raise ValidationError("Only surpport jpg、jpeg、png or gif.")

            if image.size > 10 * 1024 * 1024:
                raise ValidationError("The size of image should be smaller than 10MB.")

        return image