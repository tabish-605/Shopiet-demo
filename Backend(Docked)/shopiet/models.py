from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField
import random
import time
import tinify
import tempfile
import os
from django.core.files import File
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
        ('Love', 'Needs Love'),
        ('Used', 'Used'),
        ('L-New', 'Like New'),
        ('New', 'New'),
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
            self.slug = self.generate_unique_slug()
        if self.user:
            self.item_username = self.user.username
        if self.category:
            self.item_category_name = self.category.name

        if self.item_thumbnail and hasattr(self.item_thumbnail, 'file'):
            with self.item_thumbnail.open('rb') as source:
                source_data = source.read()
                result_data = tinify.from_buffer(source_data).to_buffer()

                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    try:
                        temp_file.write(result_data)
                        temp_file.seek(0)
                        self.item_thumbnail.save(os.path.basename(self.item_thumbnail.name), temp_file, save=False)
                    except Exception as e:
                        print(f"An error occurred: {e}")
                    finally:
                        temp_file.close()
                        os.remove(temp_file.name)

        super().save(*args, **kwargs)

    def generate_unique_slug(self):
        base_slug = slugify(self.item_name)
        unique_part = str(int(time.time())) + str(random.randint(1, 1000))  # Combine time and random number
        return f"{base_slug}-{unique_part}"

    time_stamp = models.DateField(auto_now_add=True)
    category = models.ForeignKey(
        Category, related_name="category", on_delete=models.CASCADE, null=True)
    item_username = models.CharField(max_length=150, blank=True)
    item_category_name = models.CharField(max_length=150, blank=True)

    

    
    def __str__(self):
     return self.item_name
    
class SavedItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.item.item_name}"


class Images(models.Model):
  
    
    item = models.ForeignKey(
        Item, related_name="images", on_delete=models.CASCADE, null=True)
    image = models.ImageField(
        upload_to='item_images_additional',  null=True)  

    def __str__(self):
        return self.item.item_name

    def save(self, *args, **kwargs):
        if self.image and hasattr(self.image, 'file'):
            with self.image.open('rb') as source:
                source_data = source.read()
                result_data = tinify.from_buffer(source_data).to_buffer()

                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    try:
                        temp_file.write(result_data)
                        temp_file.seek(0)
                        self.image.save(os.path.basename(self.image.name), temp_file, save=False)
                    except Exception as e:
                        print(f"An error occurred: {e}")
                    finally:
                        temp_file.close()
                        os.remove(temp_file.name)

        super().save(*args, **kwargs)
    
class Profile(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    number = PhoneNumberField(blank=True)
    whatsapp_number = PhoneNumberField(blank=True)
    other =  models.URLField(blank=True, max_length=200)
    profile_pic = models.ImageField(upload_to='profile_pictures', null=True, blank=True)

    def __str__(self):
        return str(self.user)