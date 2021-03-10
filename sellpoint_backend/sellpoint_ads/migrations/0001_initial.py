# Generated by Django 3.1.6 on 2021-02-22 15:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import sellpoint_ads.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Ad",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("title", models.CharField(max_length=100)),
                ("description", models.TextField(max_length=512)),
                ("price", models.PositiveSmallIntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_modified", models.DateTimeField(auto_now=True)),
                ("is_sold", models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name="Category",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=64, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name="Image",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "image",
                    models.ImageField(upload_to=sellpoint_ads.models.get_image_path),
                ),
                (
                    "description",
                    models.CharField(blank=True, max_length=256, null=True),
                ),
                (
                    "ad",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="sellpoint_ads.ad",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="ad",
            name="category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="sellpoint_ads.category",
            ),
        ),
        migrations.AddField(
            model_name="ad",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name="ad",
            name="thumbnail",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name="thumbnail_for",
                to="sellpoint_ads.image",
            ),
        ),
    ]
