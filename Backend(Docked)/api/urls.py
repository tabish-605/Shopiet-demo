from django.urls import path
from . import views

urlpatterns = [
    path('', views.getData),
    path('signup/', views.addUser),
    path('upload/', views.addItem),
    path('update-profile/', views.update_profile),
    path('item/<slug:slug>/', views.getItem),
    path('item-images/<slug:slug>/', views.getItemAdditionalImages),
    path('category/<str:item_category_name>/', views.getCatItems),
    path('search/<str:search_query>/', views.getSearchItems),
    path('searchq/<str:search_query>/', views.getSearchqItems),
    path('save/<str:username>/<slug:slug>/', views.save_item),
    path('saved-items/<str:username>/', views.getSavedItems),
    path('profile/<str:username>/', views.getProfile)

   
    
]