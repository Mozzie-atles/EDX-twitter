
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),



    # API path
    path("network", views.post, name="newpost"),
    path("allposts", views.all_posts, name='allposts'),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow", views.follow, name="follow"),
    path("follow/post", views.followpost, name="followpost"),
    path("like", views.like, name="likepost"),
    path("edit", views.edit_post, name="edit"),

]
