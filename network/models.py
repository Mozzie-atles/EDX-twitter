from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Posts(models.Model):

    content = models.CharField(max_length=300, null=True)
    user = models.ForeignKey("User", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "user": self.user.username,
            "timestamp": self.timestamp.strftime("%b %#d %Y, %#I:%M %p")
        }


class Likes(models.Model):
    user_liked = models.ForeignKey(
        "User", on_delete=models.CASCADE, null=True, related_name="postliker")
    like = models.ForeignKey(
        "Posts", on_delete=models.CASCADE, related_name="likedpost")


class Follower(models.Model):
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, null=True, related_name="profileholder")
    userfollowing = models.ManyToManyField(
        "User", blank=True, related_name="following")

    def serialize(self):
        return {
            "user": self.user.username,
            "userfollowing": [user.username for user in self.userfollowing.all()],
        }
