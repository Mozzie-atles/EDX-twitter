# Generated by Django 3.0.5 on 2020-09-07 16:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_auto_20200907_1757'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Follow',
            new_name='Follower',
        ),
    ]
