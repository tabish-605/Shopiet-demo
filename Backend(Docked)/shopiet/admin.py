from django.contrib import admin
from .models import Item, Images, Category, Profile,SavedItem

# Register your models here.
admin.site.register(Item)
admin.site.register(Images)
admin.site.register(Category)
admin.site.register(Profile)
admin.site.register(SavedItem)