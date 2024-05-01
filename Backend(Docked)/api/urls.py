from django.urls import path
from . import views

urlpatterns = [
    path('', views.getData),
    path('signup/', views.addUser),
    path('upload/', views.addItem),
    path('item/<slug:slug>/', views.getItem),
     path('category/<str:item_category_name>/', views.getCatItems)

   
    
]