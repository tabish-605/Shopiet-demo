from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
# Create your models here.



class Category(models.Model):
    name = models.CharField(max_length=30, default="Top")
    parent = models.ForeignKey(
        'self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    description = models.TextField(
        blank=True, null=True)  # Add a description field
   

    def __str__(self):
        return self.name
    
class Item(models.Model):
    CONDITION_CHOICES = [
        ('love', 'Needs Love'),
        ('used', 'Used'),
        ('like_new', 'Like New'),
        ('new', 'New'),
    ]
    item_name = models.CharField( max_length=50, blank=False)
    item_price = models.DecimalField(max_digits=10, decimal_places=2,  blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    item_thumbnail = models.ImageField(upload_to='item_thumbnails')
    item_description = models.TextField( blank=False)
    item_condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='used')
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.item_name)
        super().save(*args, **kwargs)

    time_stamp = models.DateField(auto_now_add=True)
    category = models.ForeignKey(
        Category, related_name="category", on_delete=models.CASCADE, null=True)

    def __str__(self):
     return self.item_name
    

class Images(models.Model):
  
    
    item = models.ForeignKey(
        Item, related_name="images", on_delete=models.CASCADE, null=True)
    image = models.ImageField(
        upload_to='item_images_additional',  null=True)  

    def __str__(self):
        return self.item.item_name