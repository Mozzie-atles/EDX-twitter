from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
import json
from django.views.decorators.csrf import csrf_exempt

from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def post(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)

        content = data.get("content", "")

        posting = Posts(content=content, user=request.user)
        posting.save()
        return JsonResponse({"message": "Post sent successfully."}, status=201)


@csrf_exempt
def all_posts(request):
    if request.method == 'GET':
        data = Posts.objects.order_by("pk").reverse()
        return JsonResponse([post.serialize() for post in data], safe=False)


def profile(request, username):
    if request.method == 'GET':
        if username != '':
            tar = User.objects.get(username=username)

            data = Follower.objects.all()
            if data != None:
                return JsonResponse([info.serialize() for info in data], safe=False)
            else:
                return JsonResponse({"follower": "0"}, status=403)


@csrf_exempt
@login_required
def follow(request):
    if request.method == 'POST':
        user = request.user
        data = json.loads(request.body)
        username = data.get("name", "")
        state = data.get("state", "")
        user = request.user
        temp = User.objects.get(username=username)
        temp = temp.id
        if username != '':
            if state == 'follow':
                try:
                    feed = Follower.objects.get(
                        user=user, userfollowing=temp)
                except Follower.DoesNotExist:

                    follow = Follower(user=user)
                    follow.save()
                    follow.userfollowing.add(temp)
                    return JsonResponse({"message": "Followed successfully."}, status=201)

            elif state == 'unfollow':
                try:
                    feed = Follower.objects.get(user=user, userfollowing=temp)
                except Follower.DoesNotExist:
                    return JsonResponse({"message": "no such object"}, status=201)
                else:
                    feed.delete()

                    return JsonResponse({"message": "Unfollowed successfully."}, status=201)
            elif state == 'check':
                if username == user.username:
                    return JsonResponse({"message": "self"}, status=201)
                else:
                    try:
                        feed = Follower.objects.get(
                            user=user, userfollowing=temp)
                    except Follower.DoesNotExist:
                        return JsonResponse({"message": "can follow"}, status=201)
                    else:
                        return JsonResponse({"message": "error"}, status=201)


def followpost(request):
    user = request.user
    ls = []
    y = []
    if request.method == "GET":
        following = Follower.objects.filter(user=user)
        for each in following:
            ls.append(each.userfollowing.all())
        li = [str(x[0]) for x in ls]
        for tmp in li:
            pks = User.objects.get(username=tmp)
            z = Posts.objects.filter(user=pks.id)
            y.append([re.serialize() for re in z])
        return JsonResponse(y, safe=False)


@csrf_exempt
@login_required
def like(request):
    user = request.user
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    else:
        data = json.loads(request.body)
        pk = data.get("pk", "")
        status = data.get("status", "")
        if status == 'check':
            try:
                check = Likes.objects.get(user_liked=user, like=pk)
            except Likes.DoesNotExist:
                return JsonResponse({"message": "NO liked post."}, status=200)
            else:

                return JsonResponse({"message": "Post exist."}, status=200)
        elif status == 'like':
            try:
                that_post = Posts.objects.get(pk=pk)
            except Posts.DoesNotExist:
                return JsonResponse({"error": "NO such post."}, status=400)
            else:
                like = Likes(user_liked=user, like=that_post)
                like.save()
                return JsonResponse({"message": "Post liked successfully."}, status=201)
        elif status == 'unlike':
            try:
                check = Likes.objects.get(user_liked=user, like=pk)
            except Likes.DoesNotExist:
                return JsonResponse({"message": "Liked post dosen't exist."}, status=200)
            else:
                check.delete()
                return JsonResponse({"message": "Post Unliked successfully."}, status=201)


@csrf_exempt
@login_required
def edit_post(request):
    if request.method == "GET":
        user = request.user.username
        return JsonResponse(user, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        pk = data.get("id", "")
        content = data.get("content", "")

        Posts.objects.filter(pk=pk).update(content=content)
        return JsonResponse({"message": "Post Edited successfully."}, status=201)
